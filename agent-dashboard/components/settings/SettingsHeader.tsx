import { Settings } from "lucide-react";

export function SettingsHeader() {
    return (
        <div className="flex items-start justify-between">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Settings className="h-6 w-6 text-primary" />

                    <h1 className="text-3xl font-bold tracking-tight">
                        Organization Settings
                    </h1>
                </div>

                <p className="text-muted-foreground">
                    Manage your organization information and administrative settings.
                </p>
            </div>
        </div>
    );
}