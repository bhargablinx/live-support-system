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

const data = [
    {
        day: "Mon",
        firstResponse: 2.8,
        resolution: 11.4,
    },
    {
        day: "Tue",
        firstResponse: 2.2,
        resolution: 9.8,
    },
    {
        day: "Wed",
        firstResponse: 2.4,
        resolution: 10.6,
    },
    {
        day: "Thu",
        firstResponse: 1.9,
        resolution: 8.7,
    },
    {
        day: "Fri",
        firstResponse: 1.7,
        resolution: 7.9,
    },
    {
        day: "Sat",
        firstResponse: 2.1,
        resolution: 8.4,
    },
    {
        day: "Sun",
        firstResponse: 2.0,
        resolution: 8.2,
    },
];

export default function ResponseTimeChart() {
    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader>
                <CardTitle>Response Time Trend</CardTitle>

                <CardDescription>
                    Average response and resolution time (minutes)
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