import { PatientShell } from "@/components/layout/PatientShell";
import { MessageComposer } from "@/components/messages/MessageComposer";
import { MessageList } from "@/components/messages/MessageList";
import { PageHeader } from "@/components/shared/PageHeader";
import { listInbox } from "@/lib/services/message.service";

type PageProps = {
  params: { userId: string };
};

export default async function PatientMessagesPage({ params }: PageProps) {
  const { userId } = params;
  const inbox = await listInbox(userId);

  return (
    <PatientShell userId={userId}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <PageHeader
          title="Messages"
          description="Secure messages between you and the CarePulse clinic team."
        />

        <MessageComposer
          fromUserId={userId}
          defaultToUserId="admin"
          lockedRecipient
        />

        <section className="space-y-4">
          <h2 className="text-18-bold text-light-200">Inbox</h2>
          <MessageList messages={inbox} userId={userId} />
        </section>
      </div>
    </PatientShell>
  );
}
