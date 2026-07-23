import api from "@/lib/axios";
import { OrganizationDetails, ApiResponse } from "@/lib/types";

export const fetchOrganizationDetails = async (): Promise<ApiResponse<OrganizationDetails>> => {
    try {
        const response = await api.get("/org");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateOrganizationName = async (name: string): Promise<ApiResponse<{ id: string; name: string }>> => {
    try {
        const response = await api.patch("/org", { name });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteOrganization = async (): Promise<ApiResponse<null>> => {
    try {
        const response = await api.delete("/org");
        return response.data;
    } catch (error) {
        throw error;
    }
};
