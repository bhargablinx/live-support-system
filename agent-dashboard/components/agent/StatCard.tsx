import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface StatCardProps {
    label: string;
    value: number | undefined;
    icon: React.ReactNode;
    accent?: string;
    loading: boolean;
}

function StatCard({ label, value, icon, accent, loading }: StatCardProps) {
    return (
        <Card
            className={cn(
                "p-6 flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-all",
                accent
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-current/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center justify-between text-muted-foreground">
                <p className="font-medium">{label}</p>
                {icon}
            </div>
            {loading ? (
                <div className="h-9 w-12 rounded-md bg-muted animate-pulse" />
            ) : (
                <div className="text-3xl font-bold">{value ?? "—"}</div>
            )}
        </Card>
    );
}

export default StatCard