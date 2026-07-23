"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchAnalytics } from "@/lib/api/analytics";
import { AnalyticsData } from "@/lib/types";
import ConversationStatus from "@/components/analytics/conversation-status";
import ConversationVolumeChart from "@/components/analytics/conversation-volume-chart";
import HourlyTrafficChart from "@/components/analytics/hourly-traffic-chart";
import KPICards from "@/components/analytics/kpi-card";
import ResponseTimeChart from "@/components/analytics/response-time-chart";

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        fetchAnalytics()
            .then((res) => {
                if (isMounted) {
                    setData(res.data);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setError(err?.response?.data?.message || err?.message || "Failed to load analytics");
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
                        Loading analytics...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold text-destructive">Error</p>
                    <p className="text-muted-foreground">{error || "Failed to fetch analytics"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <KPICards stats={data.kpis} />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ConversationVolumeChart data={data.volumeData} />
                </div>

                <ConversationStatus data={data.statusDistribution} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <ResponseTimeChart data={data.responseTimeData} />
                <HourlyTrafficChart data={data.hourlyData} />
            </div>
        </div>
    );
}