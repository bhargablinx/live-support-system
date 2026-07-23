"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { TrendingUp } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { VolumeDataItem } from "@/lib/types";

interface ConversationVolumeChartProps {
    data: VolumeDataItem[];
}

export default function ConversationVolumeChart({ data }: ConversationVolumeChartProps) {
    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Conversation Volume</CardTitle>
                    <CardDescription>
                        Daily conversations over the last 7 days
                    </CardDescription>
                </div>

                <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                    +12.4%
                </div>
            </CardHeader>

            <CardContent>
                <div className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient
                                    id="conversationGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="var(--primary)"
                                        stopOpacity={0.55}
                                    />
                                    <stop
                                        offset="60%"
                                        stopColor="var(--primary)"
                                        stopOpacity={0.20}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="var(--primary)"
                                        stopOpacity={0}
                                    />
                                </linearGradient>

                                <filter id="shadow">
                                    <feDropShadow
                                        dx="0"
                                        dy="4"
                                        stdDeviation="6"
                                        floodColor="var(--primary)"
                                        floodOpacity="0.35"
                                    />
                                </filter>
                            </defs>

                            <CartesianGrid
                                vertical={false}
                                strokeDasharray="3 3"
                                className="stroke-muted"
                            />

                            <XAxis
                                dataKey="day"
                                tickLine={false}
                                axisLine={false}
                            />

                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                width={35}
                            />

                            <Tooltip
                                cursor={{ strokeDasharray: "4 4" }}
                                contentStyle={{
                                    borderRadius: 12,
                                    border: "1px solid var(--border)",
                                    background: "var(--background)",
                                }}
                            />

                            <Area
                                type="monotone"
                                dataKey="conversations"
                                stroke="var(--primary)"
                                strokeWidth={3}
                                fill="url(#conversationGradient)"
                                filter="url(#shadow)"
                                dot={{
                                    r: 4,
                                    fill: "var(--primary)",
                                    strokeWidth: 2,
                                    stroke: "var(--background)",
                                }}
                                activeDot={{
                                    r: 6,
                                    fill: "var(--primary)",
                                    stroke: "var(--background)",
                                    strokeWidth: 2,
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}