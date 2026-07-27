"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Mail } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { markMessageReadAction } from "@/lib/actions/platform.actions";
import { formatDateTime } from "@/lib/utils";
import type { ClinicMessage } from "@/lib/services/message.service";
import { cn } from "@/lib/utils";

type MessageListProps = {
  messages: ClinicMessage[];
  userId: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function MessageList({
  messages,
  userId,
  emptyTitle = "No messages",
  emptyDescription = "Your inbox is empty. New clinic messages will appear here.",
}: MessageListProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (messages.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={<Mail className="size-6" aria-hidden />}
      />
    );
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-14-regular text-dark-700">
        {unreadCount} unread of {messages.length}
      </p>

      <ul className="flex flex-col gap-3" role="list">
        {messages.map((item) => (
          <li
            key={item.$id}
            className={cn(
              "rounded-2xl border border-dark-400 bg-dark-400 p-4",
              !item.read && "border-green-500/40 bg-green-500/5"
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-16-semibold text-light-200">
                    {item.subject}
                  </h3>
                  {!item.read ? (
                    <Badge variant="success">Unread</Badge>
                  ) : (
                    <Badge variant="secondary">Read</Badge>
                  )}
                </div>
                <p className="text-14-regular text-dark-700 whitespace-pre-wrap">
                  {item.body}
                </p>
                <p className="text-12-regular text-dark-600">
                  From {item.fromUserId} → {item.toUserId} ·{" "}
                  {formatDateTime(item.$createdAt).dateTime}
                </p>
              </div>
              {!item.read && item.toUserId === userId ? (
                <Button
                  type="button"
                  size="sm"
                  className="shad-primary-btn"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      await markMessageReadAction(item.$id, userId);
                      router.refresh();
                    });
                  }}
                >
                  Mark read
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
