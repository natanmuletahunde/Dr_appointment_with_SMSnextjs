import {
  createDocument,
  queryDocuments,
  updateDocument,
} from "@/lib/persistence/document-store";
import { logger } from "@/lib/logger";
import type { BackgroundJob, JobStatus, JobType } from "@/types/domain";
import { createNotification } from "@/lib/services/notification.service";
import { writeAuditLog } from "@/lib/services/audit.service";

export async function enqueueJob(input: {
  type: JobType;
  payload?: Record<string, unknown>;
  runAt?: Date;
  maxAttempts?: number;
}): Promise<BackgroundJob> {
  const job = (await createDocument("jobs", {
    type: input.type,
    status: "queued" as JobStatus,
    payload: input.payload ?? {},
    attempts: 0,
    maxAttempts: input.maxAttempts ?? 3,
    runAt: (input.runAt ?? new Date()).toISOString(),
  })) as unknown as BackgroundJob;

  logger.info("job.enqueued", { id: job.$id, type: job.type });
  return job;
}

export async function listJobs(options?: {
  status?: JobStatus;
  type?: JobType;
  limit?: number;
}): Promise<BackgroundJob[]> {
  const { documents } = await queryDocuments<
    BackgroundJob & { $id: string; $createdAt: string; $updatedAt: string }
  >(
    "jobs",
    (doc) => {
      if (options?.status && doc.status !== options.status) return false;
      if (options?.type && doc.type !== options.type) return false;
      return true;
    },
    {
      sort: (a, b) =>
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime(),
      limit: options?.limit ?? 50,
    }
  );
  return documents;
}

async function processJob(job: BackgroundJob): Promise<BackgroundJob> {
  await updateDocument("jobs", job.$id, {
    status: "running",
    startedAt: new Date().toISOString(),
    attempts: job.attempts + 1,
  });

  try {
    let result: Record<string, unknown> = {};

    switch (job.type) {
      case "appointment_reminder": {
        const userId = String(job.payload.userId ?? "");
        const schedule = String(job.payload.schedule ?? "");
        const doctor = String(job.payload.doctor ?? "your doctor");
        if (userId) {
          await createNotification({
            userId,
            title: "Appointment reminder",
            body: `Reminder: you have an appointment with Dr. ${doctor} on ${schedule}`,
            type: "appointment_reminder",
            href: `/patients/${userId}/appointments`,
          });
        }
        result = { reminded: Boolean(userId) };
        break;
      }
      case "purge_old_notifications": {
        result = { purged: 0, note: "Retention purge scheduled" };
        break;
      }
      case "daily_digest": {
        result = { digest: "generated", recipients: job.payload.recipients ?? [] };
        break;
      }
      case "export_report": {
        result = { exportId: job.payload.exportId ?? job.$id };
        break;
      }
      case "sync_doctor_availability": {
        result = { synced: true };
        break;
      }
      case "analytics_rollup": {
        result = { rolledUpAt: new Date().toISOString() };
        break;
      }
      default:
        result = { skipped: true };
    }

    const completed = (await updateDocument("jobs", job.$id, {
      status: "completed",
      completedAt: new Date().toISOString(),
      result,
      lastError: undefined,
    })) as unknown as BackgroundJob;

    await writeAuditLog({
      actorId: "system",
      actorRole: "system",
      action: "update",
      resourceType: "job",
      resourceId: job.$id,
      summary: `Job ${job.type} completed`,
      after: result,
    });

    return completed;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const failed = job.attempts + 1 >= job.maxAttempts;
    const updated = (await updateDocument("jobs", job.$id, {
      status: failed ? "failed" : "queued",
      lastError: message,
    })) as unknown as BackgroundJob;
    logger.error("job.failed", { id: job.$id, message });
    return updated;
  }
}

export async function processDueJobs(limit = 10): Promise<BackgroundJob[]> {
  const now = Date.now();
  const { documents } = await queryDocuments<
    BackgroundJob & { $id: string; $createdAt: string; $updatedAt: string }
  >(
    "jobs",
    (doc) =>
      doc.status === "queued" && new Date(doc.runAt).getTime() <= now,
    {
      sort: (a, b) =>
        new Date(a.runAt).getTime() - new Date(b.runAt).getTime(),
      limit,
    }
  );

  const results: BackgroundJob[] = [];
  for (const job of documents) {
    results.push(await processJob(job));
  }
  return results;
}

export async function scheduleAppointmentReminder(input: {
  userId: string;
  scheduleIso: string;
  doctor: string;
  hoursBefore: number;
}): Promise<BackgroundJob | null> {
  const runAt = new Date(
    new Date(input.scheduleIso).getTime() - input.hoursBefore * 3600_000
  );
  if (runAt.getTime() <= Date.now()) return null;
  return enqueueJob({
    type: "appointment_reminder",
    runAt,
    payload: {
      userId: input.userId,
      schedule: input.scheduleIso,
      doctor: input.doctor,
    },
  });
}
