import { createDocument, queryDocuments } from "@/lib/persistence/document-store";
import type { BaseEntity } from "@/types/domain";

export interface HistoryEntry extends BaseEntity {
  entityType: string;
  entityId: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changedBy: string;
  changedByName: string;
  reason?: string;
}

export async function trackFieldChange(input: {
  entityType: string;
  entityId: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changedBy: string;
  changedByName: string;
  reason?: string;
}): Promise<HistoryEntry | null> {
  if (JSON.stringify(input.oldValue) === JSON.stringify(input.newValue)) {
    return null;
  }

  return (await createDocument("history", {
    entityType: input.entityType,
    entityId: input.entityId,
    field: input.field,
    oldValue: input.oldValue,
    newValue: input.newValue,
    changedBy: input.changedBy,
    changedByName: input.changedByName,
    reason: input.reason,
  })) as unknown as HistoryEntry;
}

export async function trackEntityDiff(input: {
  entityType: string;
  entityId: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  changedBy: string;
  changedByName: string;
  fields?: string[];
  reason?: string;
}): Promise<HistoryEntry[]> {
  const fields =
    input.fields ??
    Array.from(
      new Set([...Object.keys(input.before), ...Object.keys(input.after)])
    ).filter((k) => !k.startsWith("$"));

  const entries: HistoryEntry[] = [];
  for (const field of fields) {
    const entry = await trackFieldChange({
      entityType: input.entityType,
      entityId: input.entityId,
      field,
      oldValue: input.before[field],
      newValue: input.after[field],
      changedBy: input.changedBy,
      changedByName: input.changedByName,
      reason: input.reason,
    });
    if (entry) entries.push(entry);
  }
  return entries;
}

export async function listEntityHistory(
  entityType: string,
  entityId: string
): Promise<HistoryEntry[]> {
  const { documents } = await queryDocuments<HistoryEntry>(
    "history",
    (doc) => doc.entityType === entityType && doc.entityId === entityId,
    {
      sort: (a, b) =>
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime(),
    }
  );
  return documents;
}
