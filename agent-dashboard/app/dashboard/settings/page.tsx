import { DangerZoneCard } from "@/components/settings/DangerZoneCard";
import { OrganizationInfoCard } from "@/components/settings/OrganizationInfoCard";
import { SettingsHeader } from "@/components/settings/SettingsHeader";

export default function SettingsPage() {
    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-10 p-6">
            <SettingsHeader />

            <OrganizationInfoCard />

            <DangerZoneCard />
        </div>
    );
}