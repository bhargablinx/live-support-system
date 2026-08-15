import api from "@/lib/axios";
import { Tag, ConversationTag, ApiResponse } from "@/lib/types";

export const fetchTags = async (): Promise<ApiResponse<Tag[]>> => {
    try {
        const response = await api.get("/tags");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createTag = async (data: { name: string; color?: string }): Promise<ApiResponse<Tag>> => {
    try {
        const response = await api.post("/tags", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateTag = async (
    tagId: string,
    data: { name?: string; color?: string }
): Promise<ApiResponse<Tag>> => {
    try {
        const response = await api.patch(`/tags/${tagId}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteTag = async (tagId: string): Promise<ApiResponse<{ id: string }>> => {
    try {
        const response = await api.delete(`/tags/${tagId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addTagToConversation = async (
    conversationId: string,
    payload: { tagId?: string; name?: string }
): Promise<ApiResponse<ConversationTag>> => {
    try {
        const response = await api.post(`/conversation/${conversationId}/tags`, payload);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const removeTagFromConversation = async (
    conversationId: string,
    tagId: string
): Promise<ApiResponse<{ conversationId: string; tagId: string }>> => {
    try {
        const response = await api.delete(`/conversation/${conversationId}/tags/${tagId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
