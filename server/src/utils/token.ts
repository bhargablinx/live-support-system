import jwt from "jsonwebtoken";
import prisma from "./prisma.js";
import { ApiError } from "./ApiError.js";
import "dotenv/config"
import type { user } from "../utils/types.js"

export const generateAccessToken = (user: user): string => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
        },
        process.env.ACCESS_TOKEN_SECRET || "",
        {
            expiresIn: (process.env.ACCESS_TOKEN_EXPIRY || "1d") as any,
        }
    );
};

export const generateRefreshToken = (user: user): string => {
    return jwt.sign(
        {
            id: user.id,
        },
        process.env.REFRESH_TOKEN_SECRET || "",
        {
            expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || "15d") as any,
        }
    );
};

export const generateToken = async (userId: string) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });

        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
                error: "Not Found",
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Server error: Generating tokens", error);
        throw error;
    }
};