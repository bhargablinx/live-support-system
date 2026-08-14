import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";
import fs from "fs";

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

if (cloud_name && api_key && api_secret) {
    cloudinary.config({
        cloud_name,
        api_key,
        api_secret,
    });
}

export const extractPublicIdFromUrl = (fileUrl: string): string => {
    if (!fileUrl) return "";
    try {
        const urlParts = fileUrl.split("/upload/");
        if (urlParts.length < 2 || !urlParts[1]) return "";
        let path = urlParts[1];
        // Remove version prefix e.g. v123456789/
        path = path.replace(/^v\d+\//, "");
        // Remove file extension
        const lastDotIndex = path.lastIndexOf(".");
        if (lastDotIndex !== -1) {
            path = path.substring(0, lastDotIndex);
        }
        return path;
    } catch {
        return "";
    }
};

export const deleteFromCloudinary = async (fileUrl: string) => {
    try {
        if (!fileUrl) return null;
        const publicId = extractPublicIdFromUrl(fileUrl);
        if (!publicId) return null;

        let resourceType = "image";
        if (fileUrl.includes("/video/upload/")) {
            resourceType = "video";
        } else if (fileUrl.includes("/raw/upload/")) {
            resourceType = "raw";
        }

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });

        return result;
    } catch (error) {
        console.error(`Failed to delete file from Cloudinary (${fileUrl}):`, error);
        return null;
    }
};

export const uploadToCloudinary = async (localFilePath: string) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response;
    } catch (error) {
        console.log(error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};