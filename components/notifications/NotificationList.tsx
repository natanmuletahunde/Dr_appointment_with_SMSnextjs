"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Bell, CheckCheck } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  markAllReadAction,
  markNotificationReadAction,
} from "@/lib/actions/platform.actions";
import { formatDateTime } from "@/lib/utils";
import type { NotificationItem } from "@/types/domain";
import { cn } from "@/lib/utils";

type NotificationListProps = {
  notifications: NotificationItem[];
  userId: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function NotificationList({
  notifications,
  userId,
  emptyTitle = "No notifications",
  emptyDescription = "You're all caught up. New alerts will appear here.",
}: NotificationListProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (notifications.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={<Bell className="size-6" aria-hidden />}
      />
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-14-regular text-dark-700">
          {unreadCount} unread of {notifications.length}
        </p>
        {unreadCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            className="shad-gray-btn"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await markAllReadAction(userId);
                router.refresh();
              });
            }}
          >
            <CheckCheck className="size-4" aria-hidden />
            Mark all read
          </Button>
        ) : null}
      </div>

      <ul className="flex flex-col gap-3" role="list">
        {notifications.map((item) => {
          const content = (
            <div
              className={cn(
                "rounded-2xl border border-dark-400 bg-dark-400 p-4 transition-colors",
                !item.read && "border-green-500/40 bg-green-500/5"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-16-semibold text-light-200">
                      {item.title}
                    </h3>
                    {!item.read ? (
                      <Badge variant="success">Unread</Badge>
                    ) : (
                      <Badge variant="secondary">Read</Badge>
                    )}
                    <Badge variant="outline" className="capitalize">
                      {item.type.replaceAll("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-14-regular text-dark-700">{item.body}</p>
                  <p className="text-12-regular text-dark-600">
                    {formatDateTime(item.$createdAt).dateTime}
                  </p>
                </div>
                {!item.read ? (
                  <Button
                    type="button"
                    size="sm"
                    className="shad-primary-btn"
                    disabled={pending}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startTransition(async () => {
                        await markNotificationReadAction(item.$id, userId);
                        router.refresh();
                      });
                    }}
                  >
                    Mark read
                  </Button>
                ) : null}
              </div>
            </div>
          );

          return (
            <li key={item.$id}>
              {item.href ? (
                <Link href={item.href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-2xl">
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
