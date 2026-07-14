import type { NextFunction, Request, Response } from 'express';
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";
import { asyncHandler } from '../utils/helper.js';
import "dotenv/config"
import type { user } from '../utils/types.js';

const verifyJwt = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token)
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        })

    const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "") as user;

    const user = await prisma.user.findUnique({
        where: {
            id: decodedData.id
        },
        omit: {
            passwordHash: true,
            refreshToken: true
        }
    })

    if (!user)
        throw new ApiError({
            statusCode: 404,
            message: "User not found",
            error: "Not Found",
        })

    req.user = user;

    next()

})

export { verifyJwt }