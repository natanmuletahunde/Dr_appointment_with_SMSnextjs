import { describe, expect, it, afterAll } from "vitest";
import { deleteDocument } from "@/lib/persistence/document-store";
import {
  enqueueJob,
  listJobs,
  processDueJobs,
} from "@/lib/services/job.service";

const createdIds: string[] = [];

describe("jobs integration", () => {
  afterAll(async () => {
    for (const id of createdIds) {
      await deleteDocument("jobs", id);
    }
  });

  it("enqueues and processes due jobs", async () => {
    const job = await enqueueJob({
      type: "analytics_rollup",
      payload: { source: "jobs.test" },
      runAt: new Date(Date.now() - 1000),
    });
    createdIds.push(job.$id);

    expect(job.status).toBe("queued");
    expect(job.type).toBe("analytics_rollup");

    const listed = await listJobs({ type: "analytics_rollup", limit: 50 });
    expect(listed.some((j) => j.$id === job.$id)).toBe(true);

    const processed = await processDueJobs(20);
    const ours = processed.find((j) => j.$id === job.$id);
    expect(ours).toBeTruthy();
    expect(ours?.status).toBe("completed");
    expect(ours?.result).toBeTruthy();
  });
});
