import { createDocument, queryDocuments } from "@/lib/persistence/document-store";
import { cacheGetOrSet } from "@/lib/cache/memory-cache";
import type { BaseEntity } from "@/types/domain";

export interface MetricPoint extends BaseEntity {
  name: string;
  value: number;
  tags?: Record<string, string>;
  recordedAt: string;
}

export async function recordMetric(
  name: string,
  value: number,
  tags?: Record<string, string>
): Promise<MetricPoint> {
  return (await createDocument("metrics", {
    name,
    value,
    tags: tags ?? {},
    recordedAt: new Date().toISOString(),
  })) as unknown as MetricPoint;
}

export async function incrementMetric(
  name: string,
  by = 1,
  tags?: Record<string, string>
): Promise<MetricPoint> {
  return recordMetric(name, by, tags);
}

export async function listMetrics(
  name: string,
  limit = 100
): Promise<MetricPoint[]> {
  const { documents } = await queryDocuments<MetricPoint>(
    "metrics",
    (doc) => doc.name === name,
    {
      sort: (a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
      limit,
    }
  );
  return documents;
}

export async function sumMetric(name: string): Promise<number> {
  return cacheGetOrSet(`metric:sum:${name}`, async () => {
    const points = await listMetrics(name, 1000);
    return points.reduce((acc, p) => acc + p.value, 0);
  }, 10_000);
}

export async function getOpsDashboardMetrics() {
  const [apiRequests, smsSent, exportsRun, jobsCompleted] = await Promise.all([
    sumMetric("api.requests"),
    sumMetric("sms.sent"),
    sumMetric("exports.run"),
    sumMetric("jobs.completed"),
  ]);

  return {
    apiRequests,
    smsSent,
    exportsRun,
    jobsCompleted,
    generatedAt: new Date().toISOString(),
  };
}
