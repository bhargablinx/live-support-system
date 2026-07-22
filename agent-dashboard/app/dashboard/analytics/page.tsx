import ConversationStatus from "@/components/analytics/conversation-status";
import ConversationVolumeChart from "@/components/analytics/conversation-volume-chart";
import HourlyTrafficChart from "@/components/analytics/hourly-traffic-chart";
import KPICards from "@/components/analytics/kpi-card";
import ResponseTimeChart from "@/components/analytics/response-time-chart";

function AnalyticsPage() {
    return (
        <div className="space-y-6 p-6">
            <KPICards />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ConversationVolumeChart />
                </div>

                <ConversationStatus />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <ResponseTimeChart />
                <HourlyTrafficChart />
            </div>
        </div>
    )
}

export default AnalyticsPage;