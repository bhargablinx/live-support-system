"use client";

import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
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
        name: "Resolved",
        value: 1248,
        color: "#22c55e",
    },
    {
        name: "Open",
        value: 642,
        color: "#3b82f6",
    },
    {
        name: "Pending",
        value: 548,
        color: "#f59e0b",
    },
];

const total = data.reduce((sum, item) => sum + item.value, 0);

export default function ConversationStatus() {
    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader>
                <CardTitle>Conversation Status</CardTitle>
                <CardDescription>
                    Distribution of all conversations
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={65}
                                outerRadius={90}
                                dataKey="value"
                                strokeWidth={4}
                            >
                                {data.map((entry) => (
                                    <Cell
                                        key={entry.name}
                                        fill={entry.color}
                                    />
                                ))}
                            </Pie>

                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="-mt-36 flex flex-col items-center">
                    <p className="text-3xl font-bold">{total}</p>
                    <p className="text-sm text-muted-foreground">
                        Total
                    </p>
                </div>

                <div className="mt-16 space-y-4">
                    {data.map((item) => (
                        <div
                            key={item.name}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className="h-3 w-3 rounded-full"
                                    style={{
                                        backgroundColor: item.color,
                                    }}
                                />

                                <span className="text-sm font-medium">
                                    {item.name}
                                </span>
                            </div>

                            <div className="text-right">
                                <p className="font-semibold">{item.value}</p>

                                <p className="text-xs text-muted-foreground">
                                    {((item.value / total) * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}