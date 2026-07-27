import api from "@/lib/axios";
import { ApiResponse } from "@/lib/types";

export interface UploadResponseData {
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
}

export const uploadFile = async (file: File): Promise<ApiResponse<UploadResponseData>> => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post("/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
