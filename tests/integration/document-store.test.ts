import { describe, expect, it, afterAll } from "vitest";
import {
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  updateDocument,
} from "@/lib/persistence/document-store";

type MetricDoc = {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  value: number;
  suite?: string;
};

const createdIds: string[] = [];

describe("document-store integration", () => {
  afterAll(async () => {
    for (const id of createdIds) {
      await deleteDocument("metrics", id);
    }
  });

  it("creates, lists, updates, and deletes documents", async () => {
    const created = (await createDocument("metrics", {
      name: "test-metric",
      value: 42,
      suite: "document-store.test",
    })) as MetricDoc;
    createdIds.push(created.$id);

    expect(created.$id).toBeTruthy();
    expect(created.$createdAt).toBeTruthy();
    expect(created.value).toBe(42);

    const listed = await listDocuments<MetricDoc>("metrics");
    expect(listed.some((d) => d.$id === created.$id)).toBe(true);

    const fetched = await getDocument<MetricDoc>("metrics", created.$id);
    expect(fetched?.name).toBe("test-metric");

    const updated = await updateDocument<MetricDoc>("metrics", created.$id, {
      value: 99,
    });
    expect(updated?.value).toBe(99);
    expect(updated?.$updatedAt).not.toBe(created.$createdAt);

    const removed = await deleteDocument("metrics", created.$id);
    expect(removed).toBe(true);
    createdIds.splice(createdIds.indexOf(created.$id), 1);

    const afterDelete = await getDocument("metrics", created.$id);
    expect(afterDelete).toBeNull();
  });
});
