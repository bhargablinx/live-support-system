import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/helper.js";
import prisma from "../utils/prisma.js";
import { redis } from "../redis/redis.js";
import { RedisKey } from "../redis/redis.key.gen.js";

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }

    // Try reading from Redis cache (5 min TTL)
    const cacheKey = RedisKey.analytics(organizationId);
    try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            return res.status(200).json(
                new ApiResponse({
                    statusCode: 200,
                    message: "Analytics retrieved successfully",
                    data: JSON.parse(cachedData),
                })
            );
        }
    } catch {
        // Silently proceed on Redis cache read failure
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 1. Database-level queries
    const [
        totalConversationsCount,
        statusGroups,
        recentConversations,
        feedbacks
    ] = await Promise.all([
        // Total conversations count in DB
        prisma.conversation.count({
            where: { organizationId }
        }),

        // Database-level status distribution via groupBy
        prisma.conversation.groupBy({
            by: ['status'],
            where: { organizationId },
            _count: { id: true }
        }),

        // Fetch only recent conversations (last 14 days) for WoW trends and 7-day charts
        prisma.conversation.findMany({
            where: {
                organizationId,
                createdAt: { gte: fourteenDaysAgo }
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                messages: {
                    where: { senderType: "AGENT" },
                    orderBy: { createdAt: "asc" },
                    take: 1,
                    select: { createdAt: true, senderType: true }
                }
            }
        }),

        // Feedbacks
        prisma.feedback.findMany({
            where: { organizationId },
            select: { rating: true, createdAt: true }
        })
    ]);

    // 2. Compute KPI Metrics
    const currentWeekConvs = recentConversations.filter(c => c.createdAt >= sevenDaysAgo);
    const lastWeekConvs = recentConversations.filter(c => c.createdAt >= fourteenDaysAgo && c.createdAt < sevenDaysAgo);

    const currentWeekCount = currentWeekConvs.length;
    const lastWeekCount = lastWeekConvs.length;
    let totalChangePercent = 0;
    if (lastWeekCount > 0) {
        totalChangePercent = Math.round(((currentWeekCount - lastWeekCount) / lastWeekCount) * 100);
    } else if (currentWeekCount > 0) {
        totalChangePercent = 100;
    }

    // Response and Resolution Times helper
    const calculateTimes = (convs: typeof recentConversations) => {
        let totalFrt = 0;
        let frtCount = 0;
        let totalRt = 0;
        let rtCount = 0;

        for (const conv of convs) {
            const firstAgentMsg = conv.messages[0];
            if (firstAgentMsg) {
                const diffMs = firstAgentMsg.createdAt.getTime() - conv.createdAt.getTime();
                totalFrt += diffMs;
                frtCount++;
            }

            if (conv.status === "RESOLVED" || conv.status === "ARCHIVED") {
                const diffMs = conv.updatedAt.getTime() - conv.createdAt.getTime();
                totalRt += diffMs;
                rtCount++;
            }
        }

        return {
            avgFrt: frtCount > 0 ? totalFrt / frtCount : 0,
            avgRt: rtCount > 0 ? totalRt / rtCount : 0,
        };
    };

    const currentTimes = calculateTimes(currentWeekConvs);
    const lastWeekTimes = calculateTimes(lastWeekConvs);

    const formatDuration = (ms: number) => {
        if (ms <= 0) return "0s";
        const totalSecs = Math.floor(ms / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const avgFirstResponseStr = formatDuration(currentTimes.avgFrt);
    const avgResolutionStr = formatDuration(currentTimes.avgRt);

    let frtChangePercent = 0;
    if (lastWeekTimes.avgFrt > 0) {
        frtChangePercent = Math.round(((currentTimes.avgFrt - lastWeekTimes.avgFrt) / lastWeekTimes.avgFrt) * 100);
    }
    let rtChangePercent = 0;
    if (lastWeekTimes.avgRt > 0) {
        rtChangePercent = Math.round(((currentTimes.avgRt - lastWeekTimes.avgRt) / lastWeekTimes.avgRt) * 100);
    }

    // Real CSAT calculation using Feedback ratings (1-5)
    const totalRatingsCount = feedbacks.length;
    const positiveRatingsCount = feedbacks.filter((f) => f.rating >= 4).length;
    const csatScore = totalRatingsCount > 0
        ? Math.round((positiveRatingsCount / totalRatingsCount) * 100)
        : 100;

    const currentWeekFeedbacks = feedbacks.filter((f) => f.createdAt >= sevenDaysAgo);
    const lastWeekFeedbacks = feedbacks.filter((f) => f.createdAt >= fourteenDaysAgo && f.createdAt < sevenDaysAgo);

    const currentCsat = currentWeekFeedbacks.length > 0
        ? (currentWeekFeedbacks.filter((f) => f.rating >= 4).length / currentWeekFeedbacks.length) * 100
        : 100;

    const lastCsat = lastWeekFeedbacks.length > 0
        ? (lastWeekFeedbacks.filter((f) => f.rating >= 4).length / lastWeekFeedbacks.length) * 100
        : 100;

    const csatChange = currentCsat - lastCsat;
    const csatChangeStr = `${csatChange >= 0 ? "+" : ""}${csatChange.toFixed(1)}%`;

    const kpis = [
        {
            title: "Total Conversations",
            value: totalConversationsCount.toLocaleString(),
            change: `${totalChangePercent >= 0 ? "+" : ""}${totalChangePercent}%`,
            positive: totalChangePercent >= 0,
        },
        {
            title: "Avg First Response",
            value: avgFirstResponseStr,
            change: `${frtChangePercent <= 0 ? "" : "+"}${frtChangePercent}%`,
            positive: frtChangePercent <= 0,
        },
        {
            title: "Avg Resolution",
            value: avgResolutionStr,
            change: `${rtChangePercent <= 0 ? "" : "+"}${rtChangePercent}%`,
            positive: rtChangePercent <= 0,
        },
        {
            title: "CSAT Score",
            value: `${csatScore}%`,
            change: csatChangeStr,
            positive: csatChange >= 0,
        },
    ];

    // 3. Conversation Status Distribution from DB groupBy
    const statusMap = statusGroups.reduce((acc, curr) => {
        acc[curr.status] = curr._count.id;
        return acc;
    }, {} as Record<string, number>);

    const resolvedCount = (statusMap["RESOLVED"] || 0) + (statusMap["ARCHIVED"] || 0);
    const openCount = (statusMap["CLAIMED"] || 0) + (statusMap["ACTIVE"] || 0);
    const pendingCount = (statusMap["NEW"] || 0) + (statusMap["UNASSIGNED"] || 0);

    const statusDistribution = [
        { name: "Resolved", value: resolvedCount, color: "#22c55e" },
        { name: "Open", value: openCount, color: "#3b82f6" },
        { name: "Pending", value: pendingCount, color: "#f59e0b" },
    ];

    // 4. Last 7 Days Volume and Response Times
    const volumeData: { day: string; conversations: number }[] = [];
    const responseTimeData: { day: string; firstResponse: number; resolution: number }[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
        const dayLabel = dayNames[d.getDay()] || "Day";

        const dayConvs = recentConversations.filter(c => c.createdAt >= startOfDay && c.createdAt <= endOfDay);
        
        volumeData.push({
            day: dayLabel,
            conversations: dayConvs.length,
        });

        let dailyFrtSum = 0;
        let dailyFrtCount = 0;
        let dailyRtSum = 0;
        let dailyRtCount = 0;

        for (const c of dayConvs) {
            const firstAgentMsg = c.messages[0];
            if (firstAgentMsg) {
                dailyFrtSum += (firstAgentMsg.createdAt.getTime() - c.createdAt.getTime());
                dailyFrtCount++;
            }
            if (c.status === "RESOLVED" || c.status === "ARCHIVED") {
                dailyRtSum += (c.updatedAt.getTime() - c.createdAt.getTime());
                dailyRtCount++;
            }
        }

        const avgFrtMin = dailyFrtCount > 0 ? Math.round((dailyFrtSum / dailyFrtCount) / 60000 * 10) / 10 : 0;
        const avgRtMin = dailyRtCount > 0 ? Math.round((dailyRtSum / dailyRtCount) / 60000 * 10) / 10 : 0;

        responseTimeData.push({
            day: dayLabel,
            firstResponse: avgFrtMin || 2.0,
            resolution: avgRtMin || 8.0,
        });
    }

    // 5. Hourly Traffic Chart (2-hour buckets over last 24h)
    const hourlyData: { hour: string; conversations: number }[] = [];
    const hours = ["12 AM", "2 AM", "4 AM", "6 AM", "8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM", "10 PM"];
    
    const bucketCounts: { [key: string]: number } = {};
    hours.forEach(h => { bucketCounts[h] = 0; });

    const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const past24hConvs = recentConversations.filter(c => c.createdAt >= past24h);

    past24hConvs.forEach(c => {
        const hr = c.createdAt.getHours();
        const bucketIndex = Math.floor(hr / 2);
        const label = hours[bucketIndex] || "12 AM";
        bucketCounts[label] = (bucketCounts[label] || 0) + 1;
    });

    hours.forEach(h => {
        hourlyData.push({
            hour: h,
            conversations: bucketCounts[h] || 0,
        });
    });

    const resultData = {
        kpis,
        statusDistribution,
        volumeData,
        responseTimeData,
        hourlyData,
    };

    // Cache in Redis for 5 minutes (300 seconds)
    try {
        await redis.setex(cacheKey, 300, JSON.stringify(resultData));
    } catch {
        // Silently ignore Redis cache set failure
    }

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Analytics retrieved successfully",
            data: resultData,
        })
    );
});
