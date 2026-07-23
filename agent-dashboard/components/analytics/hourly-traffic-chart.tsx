"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { HourlyTrafficItem } from "@/lib/types";

interface HourlyTrafficChartProps {
    data: HourlyTrafficItem[];
}

export default function HourlyTrafficChart({ data }: HourlyTrafficChartProps) {
    const maxValue = Math.max(...data.map((d) => d.conversations), 0);

    // Find the peak hour dynamically
    const peakEntry = data.reduce((max, entry) => 
        entry.conversations > (max?.conversations || 0) ? entry : max, 
        data[0] || { hour: "N/A", conversations: 0 }
    );

    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader>
                <CardTitle>Hourly Traffic</CardTitle>

                <CardDescription>
                    Conversation volume throughout the day
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="mb-6 flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Peak Hour
                        </p>

                        <p className="text-2xl font-bold">
                            {peakEntry.hour}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                            Conversations
                        </p>

                        <p className="text-2xl font-bold">
                            {peakEntry.conversations}
                        </p>
                    </div>
                </div>

                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid
                                vertical={false}
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="hour"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                                interval={1}
                            />

                            <YAxis
                                tickLine={false}
                                axisLine={false}
                            />

                            <Tooltip
                                cursor={{ fill: "transparent" }}
                                contentStyle={{
                                    borderRadius: 12,
                                }}
                            />

                            <Bar dataKey="conversations" radius={[6, 6, 0, 0]}>
                                {data.map((entry) => (
                                    <Cell
                                        key={entry.hour}
                                        fill={
                                            entry.conversations === maxValue && maxValue > 0
                                                ? "var(--primary)"
                                                : "color-mix(in srgb, var(--primary) 35%, transparent)"
                                        }
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}