import { describe, expect, it, afterAll } from "vitest";
import { deleteDocument } from "@/lib/persistence/document-store";
import {
  joinWaitlist,
  listWaitlist,
  offerWaitlistSlot,
} from "@/lib/services/waitlist.service";

const stamp = Date.now();
const userId = `waitlist-user-${stamp}`;
const createdIds: string[] = [];

describe("waitlist integration", () => {
  afterAll(async () => {
    for (const id of createdIds) {
      await deleteDocument("waitlist", id);
    }
  });

  it("joins waitlist, lists by user, and offers a slot", async () => {
    const entry = await joinWaitlist({
      userId,
      patientName: "Waitlist Patient",
      preferredDoctor: "John Green",
      preferredDays: [1, 3, 5],
      earliestDate: "2026-08-01",
      latestDate: "2026-08-15",
      reason: "Need earlier cardiology slot",
      patientEmail: "waitlist@example.com",
    });
    createdIds.push(entry.$id);

    expect(entry.status).toBe("waiting");

    const mine = await listWaitlist({ userId });
    expect(mine.some((e) => e.$id === entry.$id)).toBe(true);

    const offered = await offerWaitlistSlot({
      entryId: entry.$id,
      offeredSlot: "2026-08-05T10:00:00.000Z",
      actorId: "admin",
    });

    expect(offered.status).toBe("offered");
    expect(offered.offeredSlot).toBe("2026-08-05T10:00:00.000Z");
  });
});
