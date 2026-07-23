import api from "@/lib/axios";
import { AnalyticsData, ApiResponse } from "@/lib/types";

export const fetchAnalytics = async (): Promise<ApiResponse<AnalyticsData>> => {
    try {
        const response = await api.get("/analytics");
        return response.data;
    } catch (error) {
        throw error;
    }
};
