import api from "@/lib/axios";
import { Conversation, Message, ApiResponse } from "@/lib/types";

export interface PaginatedConversations {
    conversations: Conversation[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
    };
}

export const fetchConversations = async (page = 1, limit = 50, tagId?: string): Promise<ApiResponse<PaginatedConversations | Conversation[]>> => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (tagId) {
            params.append("tagId", tagId);
        }
        const response = await api.get(`/conversation?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const claimConversation = async (id: string): Promise<ApiResponse<Conversation>> => {
    try {
        const response = await api.post(`/conversation/${id}/claim`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const resolveConversation = async (id: string): Promise<ApiResponse<Conversation>> => {
    try {
        const response = await api.post(`/conversation/${id}/resolve`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchMessages = async (id: string): Promise<ApiResponse<Message[]>> => {
    try {
        const response = await api.get(`/conversation/${id}/messages`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const archiveConversation = async (id: string): Promise<ApiResponse<Conversation>> => {
    try {
        const response = await api.post(`/conversation/${id}/archive`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const reopenConversation = async (id: string): Promise<ApiResponse<Conversation>> => {
    try {
        const response = await api.post(`/conversation/${id}/reopen`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteConversation = async (id: string): Promise<ApiResponse<{ id: string }>> => {
    try {
        const response = await api.delete(`/conversation/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const assignConversation = async (
    id: string,
    agentId: string
): Promise<ApiResponse<{ conversation: Conversation; message: Message }>> => {
    try {
        const response = await api.patch(`/conversation/${id}/assign`, { agentId });
        return response.data;
    } catch (error) {
        throw error;
    }
};

