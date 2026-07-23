import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/helper.js";
import prisma from "../utils/prisma.js";

// GET /api/v1/org
// Protected: verifyJwt
export const getOrganization = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }

    const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
            _count: {
                select: { users: true },
            },
        },
    });

    if (!org) {
        throw new ApiError({
            statusCode: 404,
            message: "Organization not found",
            error: "Not Found",
        });
    }

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Organization details retrieved successfully",
            data: {
                id: org.id,
                name: org.name,
                totalAgents: org._count.users,
            },
        })
    );
});

// PATCH /api/v1/org
// Protected: verifyJwt + authorizeRole("ADMIN")
export const updateOrganization = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }

    const { name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
        throw new ApiError({
            statusCode: 400,
            message: "Organization name is required",
            error: "Bad Request",
        });
    }

    const updated = await prisma.organization.update({
        where: { id: organizationId },
        data: { name: name.trim() },
        select: {
            id: true,
            name: true,
        },
    });

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Organization name updated successfully",
            data: updated,
        })
    );
});

// DELETE /api/v1/org
// Protected: verifyJwt + authorizeRole("ADMIN")
export const deleteOrganization = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }

    // Cascade delete related records first in a transaction
    await prisma.$transaction([
        prisma.message.deleteMany({
            where: {
                conversation: {
                    organizationId,
                },
            },
        }),
        prisma.conversation.deleteMany({
            where: { organizationId },
        }),
        prisma.visitor.deleteMany({
            where: { organizationId },
        }),
        prisma.user.deleteMany({
            where: { organizationId },
        }),
        prisma.organization.delete({
            where: { id: organizationId },
        }),
    ]);

    // Clear access token cookie to clean up auth
    res.clearCookie("accessToken");

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Organization and all related data deleted successfully",
            data: null,
        })
    );
});
