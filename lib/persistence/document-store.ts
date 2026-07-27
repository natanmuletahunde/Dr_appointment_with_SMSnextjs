import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { logger } from "@/lib/logger";

export interface StoredDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

type CollectionName =
  | "doctors"
  | "doctor_exceptions"
  | "notifications"
  | "audit_logs"
  | "activities"
  | "comments"
  | "attachments"
  | "settings"
  | "jobs"
  | "appointment_mirror"
  | "metrics"
  | "approvals"
  | "history"
  | "waitlist"
  | "messages"
  | "reports";

const DATA_ROOT = path.join(process.cwd(), ".data");

/** Serialize mutations per collection to avoid lost updates under concurrency. */
const writeLocks = new Map<CollectionName, Promise<unknown>>();

async function withCollectionLock<T>(
  collection: CollectionName,
  fn: () => Promise<T>
): Promise<T> {
  const previous = writeLocks.get(collection) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  writeLocks.set(
    collection,
    previous.then(() => gate)
  );
  await previous;
  try {
    return await fn();
  } finally {
    release();
  }
}
async function ensureDir() {
  await fs.mkdir(DATA_ROOT, { recursive: true });
}

function fileFor(collection: CollectionName) {
  return path.join(DATA_ROOT, `${collection}.json`);
}

async function readCollection<T extends StoredDocument>(
  collection: CollectionName
): Promise<T[]> {
  await ensureDir();
  const file = fileFor(collection);
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await fs.writeFile(file, "[]", "utf8");
      return [];
    }
    throw error;
  }
}

async function writeCollection<T extends StoredDocument>(
  collection: CollectionName,
  docs: T[]
): Promise<void> {
  await ensureDir();
  const file = fileFor(collection);
  const tmp = `${file}.${nanoid(6)}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(docs, null, 2), "utf8");
  await fs.rename(tmp, file);
}

export async function listDocuments<T extends StoredDocument>(
  collection: CollectionName
): Promise<T[]> {
  return readCollection<T>(collection);
}

export async function getDocument<T extends StoredDocument>(
  collection: CollectionName,
  id: string
): Promise<T | null> {
  const docs = await readCollection<T>(collection);
  return docs.find((d) => d.$id === id) ?? null;
}

export async function createDocument<T extends Omit<StoredDocument, "$id" | "$createdAt" | "$updatedAt"> & Record<string, unknown>>(
  collection: CollectionName,
  data: T,
  id?: string
): Promise<T & StoredDocument> {
  return withCollectionLock(collection, async () => {
    const docs = await readCollection(collection);
    const now = new Date().toISOString();
    const doc = {
      ...data,
      $id: id ?? nanoid(),
      $createdAt: now,
      $updatedAt: now,
    } as T & StoredDocument;
    docs.push(doc);
    await writeCollection(collection, docs);
    logger.debug("document.created", { collection, id: doc.$id });
    return doc;
  });
}

export async function updateDocument<T extends StoredDocument>(
  collection: CollectionName,
  id: string,
  patch: Partial<T> & Record<string, unknown>
): Promise<T | null> {
  return withCollectionLock(collection, async () => {
    const docs = await readCollection<T>(collection);
    const index = docs.findIndex((d) => d.$id === id);
    if (index < 0) return null;
    const updated = {
      ...docs[index],
      ...patch,
      $id: id,
      $createdAt: docs[index].$createdAt,
      $updatedAt: new Date().toISOString(),
    } as T;
    docs[index] = updated;
    await writeCollection(collection, docs);
    logger.debug("document.updated", { collection, id });
    return updated;
  });
}

export async function deleteDocument(
  collection: CollectionName,
  id: string
): Promise<boolean> {
  return withCollectionLock(collection, async () => {
    const docs = await readCollection(collection);
    const next = docs.filter((d) => d.$id !== id);
    if (next.length === docs.length) return false;
    await writeCollection(collection, next);
    logger.debug("document.deleted", { collection, id });
    return true;
  });
}

export async function queryDocuments<T extends StoredDocument>(
  collection: CollectionName,
  predicate: (doc: T) => boolean,
  options?: {
    sort?: (a: T, b: T) => number;
    limit?: number;
    offset?: number;
  }
): Promise<{ documents: T[]; total: number }> {
  let docs = await readCollection<T>(collection);
  docs = docs.filter(predicate);
  const total = docs.length;
  if (options?.sort) docs = [...docs].sort(options.sort);
  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? docs.length;
  return {
    documents: docs.slice(offset, offset + limit),
    total,
  };
}

export async function upsertByKey<T extends StoredDocument>(
  collection: CollectionName,
  key: keyof T,
  value: unknown,
  data: Omit<T, "$id" | "$createdAt" | "$updatedAt"> & Record<string, unknown>
): Promise<T> {
  const docs = await readCollection<T>(collection);
  const existing = docs.find((d) => d[key] === value);
  if (existing) {
    const updated = await updateDocument<T>(collection, existing.$id, data as Partial<T>);
    return updated as T;
  }
  return createDocument(collection, data) as Promise<T>;
}

export type { CollectionName };
