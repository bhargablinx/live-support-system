"use client";

import {
    MessageSquare,
    Clock3,
    CheckCircle2,
    Star,
    TrendingUp,
    TrendingDown,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const stats = [
    {
        title: "Total Conversations",
        value: "2,438",
        change: "+12%",
        positive: true,
        icon: MessageSquare,
    },
    {
        title: "Avg First Response",
        value: "2m 14s",
        change: "-18%",
        positive: true,
        icon: Clock3,
    },
    {
        title: "Avg Resolution",
        value: "8m 51s",
        change: "+6%",
        positive: false,
        icon: CheckCircle2,
    },
    {
        title: "CSAT Score",
        value: "96.2%",
        change: "+3%",
        positive: true,
        icon: Star,
    },
];

export default function KPICards() {
    return (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
                const Icon = item.icon;

                return (
                    <Card
                        key={item.title}
                        className="border-border/60 shadow-sm transition-all hover:shadow-md"
                    >
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {item.title}
                                    </p>

                                    <h2 className="mt-2 text-3xl font-bold tracking-tight">
                                        {item.value}
                                    </h2>
                                </div>

                                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="mt-5 flex items-center gap-2">
                                {item.positive ? (
                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                )}

                                <span
                                    className={`text-sm font-medium ${item.positive
                                        ? "text-emerald-500"
                                        : "text-red-500"
                                        }`}
                                >
                                    {item.change}
                                </span>

                                <span className="text-sm text-muted-foreground">
                                    vs last week
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </section>
    );
}