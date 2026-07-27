import { describe, expect, it, afterAll } from "vitest";
import { deleteDocument } from "@/lib/persistence/document-store";
import {
  createNotification,
  listNotifications,
  markNotificationRead,
  unreadNotificationCount,
} from "@/lib/services/notification.service";

const userId = `test-user-${Date.now()}`;
const createdIds: string[] = [];

describe("notifications integration", () => {
  afterAll(async () => {
    for (const id of createdIds) {
      await deleteDocument("notifications", id);
    }
  });

  it("creates, lists, and marks notifications read", async () => {
    const item = await createNotification({
      userId,
      title: "Test notice",
      body: "Integration test body",
      type: "system",
    });
    createdIds.push(item.$id);

    expect(item.read).toBe(false);
    expect(item.userId).toBe(userId);

    const listed = await listNotifications(userId, { unreadOnly: true });
    expect(listed.items.some((n) => n.$id === item.$id)).toBe(true);
    expect(await unreadNotificationCount(userId)).toBeGreaterThanOrEqual(1);

    const read = await markNotificationRead(item.$id, userId);
    expect(read?.read).toBe(true);

    const unreadOnly = await listNotifications(userId, { unreadOnly: true });
    expect(unreadOnly.items.some((n) => n.$id === item.$id)).toBe(false);
  });
});
