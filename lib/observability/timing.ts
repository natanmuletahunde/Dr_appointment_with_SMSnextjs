/**
 * Request timing utilities for API route instrumentation.
 */

import { recordMetric } from "@/lib/services/metrics.service";
import { logger } from "@/lib/logger";

export async function withTiming<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const ms = Date.now() - start;
    await recordMetric("api.latency_ms", ms, { route: name, status: "ok" });
    await recordMetric("api.requests", 1, { route: name });
    logger.debug("timing.ok", { name, ms });
    return result;
  } catch (error) {
    const ms = Date.now() - start;
    await recordMetric("api.latency_ms", ms, { route: name, status: "error" });
    await recordMetric("api.errors", 1, { route: name });
    logger.error("timing.error", { name, ms, error: String(error) });
    throw error;
  }
}
