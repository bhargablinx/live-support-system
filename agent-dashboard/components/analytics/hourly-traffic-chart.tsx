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

const data = [
    { hour: "12 AM", conversations: 8 },
    { hour: "2 AM", conversations: 4 },
    { hour: "4 AM", conversations: 2 },
    { hour: "6 AM", conversations: 10 },
    { hour: "8 AM", conversations: 28 },
    { hour: "10 AM", conversations: 52 },
    { hour: "12 PM", conversations: 74 },
    { hour: "2 PM", conversations: 68 },
    { hour: "4 PM", conversations: 61 },
    { hour: "6 PM", conversations: 47 },
    { hour: "8 PM", conversations: 33 },
    { hour: "10 PM", conversations: 18 },
];

const maxValue = Math.max(...data.map((d) => d.conversations));

export default function HourlyTrafficChart() {
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
                            12 PM
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                            Conversations
                        </p>

                        <p className="text-2xl font-bold">
                            74
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
                                            entry.conversations === maxValue
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