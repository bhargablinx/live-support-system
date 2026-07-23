"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchOrganizationDetails } from "@/lib/api/org";
import { OrganizationDetails } from "@/lib/types";
import { DangerZoneCard } from "@/components/settings/DangerZoneCard";
import { OrganizationInfoCard } from "@/components/settings/OrganizationInfoCard";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { useAppSelector } from "@/lib/store/store";

export default function SettingsPage() {
    const { user } = useAppSelector((state) => state.auth);
    const isAdmin = user?.role === "ADMIN";

    const [orgDetails, setOrgDetails] = useState<OrganizationDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        fetchOrganizationDetails()
            .then((res) => {
                if (isMounted) {
                    setOrgDetails(res.data);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setError(err?.response?.data?.message || err?.message || "Failed to load organization settings");
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">
                        Loading settings...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !orgDetails) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold text-destructive">Error</p>
                    <p className="text-muted-foreground">{error || "Failed to load settings"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-10 p-6">
            <SettingsHeader />

            <OrganizationInfoCard 
                organization={orgDetails} 
                isAdmin={isAdmin}
                onNameUpdate={(newName) => setOrgDetails(prev => prev ? { ...prev, name: newName } : null)} 
            />

            <DangerZoneCard 
                organizationName={orgDetails.name} 
                isAdmin={isAdmin}
            />
        </div>
    );
}