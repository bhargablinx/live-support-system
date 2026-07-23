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
import { KPIMetric } from "@/lib/types";

interface KPICardsProps {
    stats: KPIMetric[];
}

const getIcon = (title: string) => {
    switch (title) {
        case "Total Conversations":
            return MessageSquare;
        case "Avg First Response":
            return Clock3;
        case "Avg Resolution":
            return CheckCircle2;
        case "CSAT Score":
        default:
            return Star;
    }
};

export default function KPICards({ stats }: KPICardsProps) {
    return (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
                const Icon = getIcon(item.title);

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