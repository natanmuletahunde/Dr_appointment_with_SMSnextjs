import { describe, expect, it, afterAll } from "vitest";
import { deleteDocument } from "@/lib/persistence/document-store";
import {
  getThread,
  listInbox,
  listSent,
  markMessageRead,
  sendMessage,
} from "@/lib/services/message.service";

const stamp = Date.now();
const fromUserId = `msg-from-${stamp}`;
const toUserId = `msg-to-${stamp}`;
const createdIds: string[] = [];

describe("messages integration", () => {
  afterAll(async () => {
    for (const id of createdIds) {
      await deleteDocument("messages", id);
    }
  });

  it("sends, lists inbox/sent, marks read, and loads thread", async () => {
    const first = await sendMessage({
      fromUserId,
      toUserId,
      subject: "Hello clinic",
      body: "First message body",
    });
    createdIds.push(first.$id);

    expect(first.read).toBe(false);
    expect(first.threadId).toBeTruthy();

    const reply = await sendMessage({
      fromUserId: toUserId,
      toUserId: fromUserId,
      subject: "Re: Hello clinic",
      body: "Reply body",
      threadId: first.threadId,
    });
    createdIds.push(reply.$id);

    const inbox = await listInbox(toUserId);
    expect(inbox.some((m) => m.$id === first.$id)).toBe(true);

    const sent = await listSent(fromUserId);
    expect(sent.some((m) => m.$id === first.$id)).toBe(true);

    const read = await markMessageRead(first.$id, toUserId);
    expect(read?.read).toBe(true);

    const thread = await getThread(first.threadId);
    expect(thread).toHaveLength(2);
    expect(thread.map((m) => m.$id)).toEqual(
      expect.arrayContaining([first.$id, reply.$id])
    );
  });
});
