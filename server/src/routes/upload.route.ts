import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyUploadAuth } from "../middleware/uploadAuth.middleware.js";

const router = Router();

// Ensure temp directory exists
const tempDir = path.join(process.cwd(), "temp");
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post("/", verifyUploadAuth, upload.single("file"), async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ApiError({
                statusCode: 400,
                message: "No file uploaded",
                error: "Bad Request"
            });
        }

        const localFilePath = req.file.path;

        // Upload to Cloudinary
        const response = await uploadToCloudinary(localFilePath);

        if (!response) {
            throw new ApiError({
                statusCode: 500,
                message: "Failed to upload file to Cloudinary",
                error: "Internal Server Error"
            });
        }

        return res.status(200).json(
            new ApiResponse({
                statusCode: 200,
                message: "File uploaded successfully",
                data: {
                    fileUrl: response.secure_url,
                    fileName: req.file.originalname,
                    fileType: req.file.mimetype,
                    fileSize: req.file.size
                }
            })
        );
    } catch (error) {
        next(error);
    }
});

export default router;
