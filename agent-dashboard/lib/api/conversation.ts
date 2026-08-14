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

export const fetchConversations = async (page = 1, limit = 50): Promise<ApiResponse<PaginatedConversations | Conversation[]>> => {
    try {
        const response = await api.get(`/conversation?page=${page}&limit=${limit}`);
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
