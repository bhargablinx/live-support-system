import api from "@/lib/axios";
import { Conversation, Message, ApiResponse } from "@/lib/types";

export const fetchConversations = async (): Promise<ApiResponse<Conversation[]>> => {
    try {
        const response = await api.get("/conversation");
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
