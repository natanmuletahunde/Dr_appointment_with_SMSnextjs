import { MessageComposer } from "@/components/messages/MessageComposer";
import { MessageList } from "@/components/messages/MessageList";
import { PageHeader } from "@/components/shared/PageHeader";
import { listInbox } from "@/lib/services/message.service";

export default async function AdminMessagesPage() {
  const inbox = await listInbox("admin");

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Messages"
        description="Clinic inbox for patient correspondence and internal follow-ups."
      />

      <MessageComposer fromUserId="admin" defaultToUserId="" />

      <section className="space-y-4">
        <h2 className="text-18-bold text-light-200">Inbox</h2>
        <MessageList
          messages={inbox}
          userId="admin"
          emptyTitle="Inbox is empty"
          emptyDescription="Patient and staff messages addressed to admin will show up here."
        />
      </section>
    </div>
  );
}
