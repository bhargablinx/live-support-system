import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/helper.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import bcrypt from "bcrypt"
import prisma from '../utils/prisma.js';

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

// Logout

// Refresh

// Get Me

export { register }