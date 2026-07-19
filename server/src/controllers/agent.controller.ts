import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/helper.js";
import prisma from "../utils/prisma.js";
import bcrypt from "bcrypt";

// ------------------------------------------------------------------
// GET /api/v1/agents
// Returns all users (agents + admins) belonging to the caller's org.
// Protected: verifyJwt + authorizeRole("ADMIN")
// ------------------------------------------------------------------
const getAgents = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }

    const agents = await prisma.user.findMany({
        where: { organizationId },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            // Count assigned conversations to derive activity metrics
            _count: {
                select: { conversations: true },
            },
        },
        orderBy: { createdAt: "asc" },
    });

    // Derive simple stats from the list itself
    const total = agents.length;
    const active = agents.filter((a) => a.role === "AGENT" || a.role === "ADMIN").length;
    const inactive = 0; // Will be driven by a status field in a future iteration

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Agents retrieved successfully",
            data: {
                stats: { total, active, inactive },
                agents,
            },
        })
    );
});

// ------------------------------------------------------------------
// POST /api/v1/agents
// Creates a new AGENT user under the caller's organization.
// Body: { email: string, password: string }
// Protected: verifyJwt + authorizeRole("ADMIN")
// ------------------------------------------------------------------
const createAgent = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError({
            statusCode: 400,
            message: "Email and password are required",
            error: "Bad Request",
        });
    }

    const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (existing) {
        throw new ApiError({
            statusCode: 409,
            message: "A user with this email already exists",
            error: "Conflict",
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const agent = await prisma.user.create({
        data: {
            email: email.toLowerCase(),
            passwordHash,
            role: "AGENT",
            organizationId,
        },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });

    return res.status(201).json(
        new ApiResponse({
            statusCode: 201,
            message: "Agent created successfully",
            data: { agent },
        })
    );
});

// ------------------------------------------------------------------
// DELETE /api/v1/agents/:agentId
// Removes an agent from the organization. Cannot delete yourself.
// Protected: verifyJwt + authorizeRole("ADMIN")
// ------------------------------------------------------------------
const deleteAgent = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.user?.organizationId;
    const callerId = req.user?.id;
    const agentId = req.params["agentId"] as string;

    if (!organizationId || !callerId) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }

    if (agentId === callerId) {
        throw new ApiError({
            statusCode: 400,
            message: "You cannot remove yourself",
            error: "Bad Request",
        });
    }

    // Confirm the target belongs to the same org (multi-tenancy guard)
    const target = await prisma.user.findFirst({
        where: { id: agentId, organizationId },
    });

    if (!target) {
        throw new ApiError({
            statusCode: 404,
            message: "Agent not found in your organization",
            error: "Not Found",
        });
    }

    await prisma.user.delete({ where: { id: agentId } });

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Agent removed successfully",
            data: null,
        })
    );
});

export { getAgents, createAgent, deleteAgent };
