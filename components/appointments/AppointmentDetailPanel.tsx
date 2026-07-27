"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { addCommentAction } from "@/lib/actions/platform.actions";
import { formatDateTime } from "@/lib/utils";
import type {
  ActivityEvent,
  AppointmentComment,
  AppointmentRecord,
} from "@/types/domain";

type AppointmentDetailPanelProps = {
  appointment: AppointmentRecord;
  comments: AppointmentComment[];
  timeline?: ActivityEvent[];
};

export function AppointmentDetailPanel({
  appointment,
  comments,
  timeline = [],
}: AppointmentDetailPanelProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submitComment = () => {
    setError("");
    if (body.trim().length < 2) {
      setError("Comment must be at least 2 characters.");
      return;
    }
    startTransition(async () => {
      try {
        await addCommentAction({
          appointmentId: appointment.$id,
          body,
          isInternal,
          notifyUserId: isInternal ? undefined : appointment.userId,
        });
        setBody("");
        setIsInternal(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add comment");
      }
    });
  };

  return (
    <div className="grid w-full gap-6 xl:grid-cols-[1.2fr_1fr]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{appointment.patientName}</CardTitle>
            <Badge className="capitalize">{appointment.status.replace("_", " ")}</Badge>
          </div>
          <CardDescription>
            Appointment · {formatDateTime(appointment.schedule).dateTime}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-14-regular">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-12-semibold text-dark-600">Doctor</dt>
              <dd className="text-light-200">{appointment.primaryPhysician}</dd>
            </div>
            <div>
              <dt className="text-12-semibold text-dark-600">Duration</dt>
              <dd className="text-light-200">
                {appointment.durationMinutes} minutes
              </dd>
            </div>
            <div>
              <dt className="text-12-semibold text-dark-600">Patient email</dt>
              <dd className="text-light-200">
                {appointment.patientEmail || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-12-semibold text-dark-600">Phone</dt>
              <dd className="text-light-200">
                {appointment.patientPhone || "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-12-semibold text-dark-600">Reason</dt>
              <dd className="text-light-200">{appointment.reason}</dd>
            </div>
            {appointment.note ? (
              <div className="sm:col-span-2">
                <dt className="text-12-semibold text-dark-600">Note</dt>
                <dd className="text-light-200">{appointment.note}</dd>
              </div>
            ) : null}
            {appointment.cancellationReason ? (
              <div className="sm:col-span-2">
                <dt className="text-12-semibold text-dark-600">
                  Cancellation reason
                </dt>
                <dd className="text-red-500">{appointment.cancellationReason}</dd>
              </div>
            ) : null}
            {appointment.location ? (
              <div>
                <dt className="text-12-semibold text-dark-600">Location</dt>
                <dd className="text-light-200">{appointment.location}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-12-semibold text-dark-600">ID</dt>
              <dd className="font-mono text-12-regular text-dark-700">
                {appointment.$id}
              </dd>
            </div>
          </dl>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-16-semibold text-light-200">Activity timeline</h3>
            {timeline.length === 0 ? (
              <p className="text-dark-600">No activity recorded yet.</p>
            ) : (
              <ol className="space-y-3 border-l border-dark-500 pl-4">
                {timeline.map((event) => (
                  <li key={event.$id} className="relative">
                    <span className="absolute -left-[1.35rem] top-1.5 size-2 rounded-full bg-green-500" />
                    <p className="text-14-medium text-light-200">{event.message}</p>
                    <p className="text-12-regular text-dark-600">
                      {event.actorName} · {event.verb} ·{" "}
                      {formatDateTime(event.$createdAt).dateTime}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
          <CardDescription>
            Internal notes stay private to clinic staff.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="max-h-80 space-y-3 overflow-y-auto" role="list">
            {comments.length === 0 ? (
              <li className="text-14-regular text-dark-600">No comments yet.</li>
            ) : (
              comments.map((comment) => (
                <li
                  key={comment.$id}
                  className="rounded-xl border border-dark-500 bg-dark-300 p-3"
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-14-medium text-light-200">
                      {comment.authorName}
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {comment.authorRole}
                    </Badge>
                    {comment.isInternal ? (
                      <Badge variant="warning">Internal</Badge>
                    ) : null}
                  </div>
                  <p className="text-14-regular text-dark-700">{comment.body}</p>
                  <p className="mt-1 text-12-regular text-dark-600">
                    {formatDateTime(comment.$createdAt).dateTime}
                  </p>
                </li>
              ))
            )}
          </ul>

          <Separator />

          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              submitComment();
            }}
          >
            <label htmlFor="comment-body" className="shad-input-label">
              Add comment
            </label>
            <Textarea
              id="comment-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a comment…"
              className="shad-textArea min-h-24"
              aria-invalid={Boolean(error)}
            />
            <label className="flex items-center gap-2 text-14-regular text-dark-700">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="size-4 rounded border-dark-500 bg-dark-400 accent-green-500"
              />
              Internal only
            </label>
            {error ? (
              <p className="shad-error text-14-regular" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              className="shad-primary-btn"
              disabled={pending}
            >
              {pending ? "Posting…" : "Post comment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
