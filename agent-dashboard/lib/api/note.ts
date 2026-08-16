import api from "@/lib/axios";
import { InternalNote, ApiResponse } from "@/lib/types";

export const fetchInternalNotes = async (conversationId: string): Promise<ApiResponse<InternalNote[]>> => {
    try {
        const response = await api.get(`/conversation/${conversationId}/notes`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createInternalNote = async (
    conversationId: string,
    content: string
): Promise<ApiResponse<InternalNote>> => {
    try {
        const response = await api.post(`/conversation/${conversationId}/notes`, { content });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateInternalNote = async (
    conversationId: string,
    noteId: string,
    content: string
): Promise<ApiResponse<InternalNote>> => {
    try {
        const response = await api.patch(`/conversation/${conversationId}/notes/${noteId}`, { content });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteInternalNote = async (
    conversationId: string,
    noteId: string
): Promise<ApiResponse<{ conversationId: string; noteId: string }>> => {
    try {
        const response = await api.delete(`/conversation/${conversationId}/notes/${noteId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
