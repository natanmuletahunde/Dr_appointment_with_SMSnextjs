"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMessageAction } from "@/lib/actions/platform.actions";

type MessageComposerProps = {
  fromUserId: string;
  defaultToUserId?: string;
  defaultSubject?: string;
  threadId?: string;
  lockedRecipient?: boolean;
};

export function MessageComposer({
  fromUserId,
  defaultToUserId = "",
  defaultSubject = "",
  threadId,
  lockedRecipient = false,
}: MessageComposerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  return (
    <form
      className="grid gap-3 rounded-xl border border-dark-500 bg-dark-400 p-6"
      action={(formData) => {
        setError(null);
        setSent(false);
        startTransition(async () => {
          try {
            await sendMessageAction(formData);
            setSent(true);
            router.refresh();
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Failed to send message"
            );
          }
        });
      }}
    >
      <h2 className="text-18-bold text-light-200">Compose message</h2>
      <input type="hidden" name="fromUserId" value={fromUserId} />
      {threadId ? (
        <input type="hidden" name="threadId" value={threadId} />
      ) : null}

      <Input
        name="toUserId"
        placeholder="Recipient user id"
        defaultValue={defaultToUserId}
        required
        readOnly={lockedRecipient}
        className="shad-input"
        aria-label="Recipient user id"
      />
      <Input
        name="subject"
        placeholder="Subject"
        defaultValue={defaultSubject}
        required
        className="shad-input"
        aria-label="Subject"
      />
      <textarea
        name="body"
        placeholder="Write your message…"
        required
        rows={5}
        className="shad-textArea"
        aria-label="Message body"
      />

      {error ? (
        <p className="text-14-regular text-red-500" role="alert">
          {error}
        </p>
      ) : null}
      {sent ? (
        <p className="text-14-regular text-green-500">Message sent.</p>
      ) : null}

      <Button
        type="submit"
        className="shad-primary-btn"
        disabled={pending}
      >
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
