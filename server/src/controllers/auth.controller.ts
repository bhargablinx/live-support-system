import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/helper.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import bcrypt from "bcrypt"
import prisma from '../utils/prisma.js';
import { generateToken } from '../utils/token.js';
import { cookieOption } from '../utils/helper.js';
import jwt from "jsonwebtoken"
import "dotenv/config"
import type { user } from '../utils/types.js';

// Register / Signup
const register = asyncHandler(async (req: Request, res: Response) => {
    const { organizationName, email, password } = req.body;

    if (!organizationName || !email || !password) {
        throw new ApiError({
            statusCode: 400,
            message: "All fields are required",
            error: "Bad Request",
        });
    }

    const existingUser = await prisma.user.findFirst({
        where: {
            email: email.toLowerCase()
        }
    });

    if (existingUser) {
        throw new ApiError({
            statusCode: 409,
            message: "User already exists",
            error: "Conflict",
        });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Atomically create Organization and Admin User
    const organization = await prisma.organization.create({
        data: {
            name: organizationName,
            users: {
                create: {
                    email: email.toLowerCase(),
                    passwordHash: hashedPassword,
                    role: 'ADMIN'
                }
            }
        },
        include: {
            users: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            }
        }
    });

    const adminUser = organization.users[0];
    return res.status(201).json(
        new ApiResponse({
            statusCode: 201,
            message: "Registration successful",
            data: {
                organization: {
                    id: organization.id,
                    name: organization.name,
                },
                user: adminUser
            }
        })
    );
});

// Login / Signin
const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password)
        throw new ApiError({
            statusCode: 400,
            message: "All fields are required",
            error: "Bad Request",
        });

    const user = await prisma.user.findUnique({
        where: {
            email: email.toLowerCase()
        },
        include: {
            organization: true
        }
    })

    if (!user)
        throw new ApiError({
            statusCode: 404,
            message: "User not found",
            error: "Not Found",
        });

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid)
        throw new ApiError({
            statusCode: 401,
            message: "Invalid credentials",
            error: "Unauthorized",
        });

    const { accessToken, refreshToken } = await generateToken(user.id)

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            refreshToken: refreshToken
        }
    })

    return res.status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(
            new ApiResponse({
                statusCode: 200,
                message: "Login successful",
                data: {
                    organization: {
                        id: user.organization.id,
                        name: user.organization.name,
                    },
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        createdAt: user.createdAt
                    },
                }
            })
        )
})

// Logout
const logout = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200)
        .clearCookie("accessToken", cookieOption)
        .clearCookie("refreshToken", cookieOption)
        .json(
            new ApiResponse({
                statusCode: 200,
                message: "Logout successful",
                data: null
            })
        )
})

// Refresh Access & Refresh Token
const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const clientRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!clientRefreshToken)
        throw new ApiError({
            statusCode: 401,
            message: "Refresh token is required",
            error: "Unauthorized",
        })

    const decodeToken = jwt.verify(clientRefreshToken, process.env.REFRESH_TOKEN_SECRET || "") as user;

    const user = await prisma.user.findUnique({
        where: {
            id: decodeToken.id
        }
    })

    if (!user || user.refreshToken !== clientRefreshToken)
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        })

    const { accessToken, refreshToken } = await generateToken(user.id)

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            refreshToken: refreshToken
        }
    })

    return res.status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(
            new ApiResponse({
                statusCode: 200,
                message: "Refresh token successful",
                data: null
            })
        )
})

// Get Me
const getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }

    const organization = await prisma.organization.findUnique({
        where: {
            id: user.organizationId
        }
    });

    if (!organization) {
        throw new ApiError({
            statusCode: 404,
            message: "Organization not found",
            error: "Not Found",
        });
    }

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "User session retrieved successfully",
            data: {
                organization: {
                    id: organization.id,
                    name: organization.name,
                },
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt
                },
            }
        })
    );
});

export { register, login, logout, refreshAccessToken, getMe }