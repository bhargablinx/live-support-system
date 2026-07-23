"use client";

import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
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
import { ResponseTimeDataItem } from "@/lib/types";

interface ResponseTimeChartProps {
    data: ResponseTimeDataItem[];
}

export default function ResponseTimeChart({ data }: ResponseTimeChartProps) {
    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader>
                <CardTitle>Response & Resolution Time</CardTitle>
                <CardDescription>
                    Average first response vs resolution time
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid
                                vertical={false}
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="day"
                                tickLine={false}
                                axisLine={false}
                            />

                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                width={40}
                                unit="m"
                            />

                            <Tooltip
                                formatter={(value: unknown) => [
                                    `${value} min`,
                                ]}
                                contentStyle={{
                                    borderRadius: 12,
                                }}
                            />

                            <Legend />

                            <Line
                                type="monotone"
                                dataKey="firstResponse"
                                name="First Response"
                                stroke="#2563eb"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 7 }}
                            />

                            <Line
                                type="monotone"
                                dataKey="resolution"
                                name="Resolution"
                                stroke="#22c55e"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}