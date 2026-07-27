import { SettingsForm } from "@/components/settings/SettingsForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { getClinicSettings } from "@/lib/services/settings.service";

export default async function AdminSettingsPage() {
  const settings = await getClinicSettings();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Clinic settings"
        description="Configure branding, scheduling defaults, and feature flags."
      />
      <SettingsForm settings={settings} />
    </div>
  );
}
