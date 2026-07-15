import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/helper.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

const createConversation = asyncHandler(async (req: Request, res: Response) => {

    const { organizationId, visitorToken } = req.body;

    if (!organizationId || !visitorToken)
        throw new ApiError({
            statusCode: 400,
            message: "Organization id and visitor token are required",
            error: "Bad Request"
        });

    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId
        }
    })

    if (!organization)
        throw new ApiError({
            statusCode: 404,
            message: "Organization not found",
            error: "Not Found"
        });

    const visitor = await prisma.visitor.findUnique({
        where: {
            token: visitorToken,
            organizationId
        }
    })

    if (!visitor)
        throw new ApiError({
            statusCode: 404,
            message: "Visitor not found",
            error: "Not Found"
        });

    const conversation = await prisma.conversation.create({
        data: {
            organizationId,
            visitorId: visitor.id,
        }
    });

    return res.status(201).json(
        new ApiResponse({
            statusCode: 201,
            message: "Conversation created successfully",
            data: {
                conversationId: conversation.id,
                visitorId: visitor.id
            },
        })
    );
})

export { createConversation }