import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";
import "dotenv/config";
import type { user } from "../utils/types.js";
import { asyncHandler } from "../utils/helper.js";

export const verifyUploadAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Check if visitorToken is provided in header or query parameter
    const visitorToken = (req.headers["x-visitor-token"] as string) || (req.query.visitorToken as string);
    if (visitorToken) {
        const visitor = await prisma.visitor.findUnique({
            where: { token: visitorToken }
        });
        if (visitor) {
            req.visitor = visitor;
            req.uploadType = "visitor";
            return next();
        }
    }

    // 2. Check if agent is authenticated via JWT (cookie or Authorization header)
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
        try {
            const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "") as user;
            const dbUser = await prisma.user.findUnique({
                where: { id: decodedData.id },
                omit: { passwordHash: true, refreshToken: true }
            });
            if (dbUser) {
                req.user = dbUser;
                req.uploadType = "agent";
                return next();
            }
        } catch (error) {
            // Decoded JWT verification failure, proceed to throw Unauthorized below
        }
    }

    throw new ApiError({
        statusCode: 401,
        message: "Unauthorized: Invalid or missing authentication credentials",
        error: "Unauthorized"
    });
});
