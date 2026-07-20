import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/helper.js";
import { presenceService } from "../redis/presence.service.js";

// ------------------------------------------------------------------
// GET /api/v1/agents/online
// Returns the list of online agent IDs for the caller's organization.
// Protected: verifyJwt (any authenticated user / agent)
// ------------------------------------------------------------------
const getOnlineAgents = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }

    const onlineAgentIds = await presenceService.getOnlineAgents(organizationId);

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Online agents retrieved successfully",
            data: {
                count: onlineAgentIds.length,
                agentIds: onlineAgentIds,
            },
        })
    );
});

// ------------------------------------------------------------------
// GET /api/v1/visitors/:visitorId/status
// Returns the online/offline status of a specific visitor.
// Protected: verifyJwt (agents checking visitor status)
// ------------------------------------------------------------------
const getVisitorStatus = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.user?.organizationId;
    const { visitorId } = req.params as { visitorId: string };

    if (!organizationId) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }

    if (!visitorId) {
        throw new ApiError({
            statusCode: 400,
            message: "visitorId is required",
            error: "Bad Request",
        });
    }

    const online = await presenceService.isVisitorOnline(visitorId);

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Visitor status retrieved successfully",
            data: { visitorId, online },
        })
    );
});

export { getOnlineAgents, getVisitorStatus };
