import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/helper.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

export const createFeedback = asyncHandler(async (req: Request, res: Response) => {
    const { conversationId, visitorToken, rating, comment } = req.body;

    if (!conversationId || !visitorToken || rating === undefined) {
        throw new ApiError({
            statusCode: 400,
            message: "conversationId, visitorToken, and rating are required",
            error: "Bad Request",
        });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        throw new ApiError({
            statusCode: 400,
            message: "Rating must be an integer between 1 and 5",
            error: "Bad Request",
        });
    }

    // 1. Verify conversation exists and belongs to the visitor
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            visitor: { token: visitorToken },
        },
    });

    if (!conversation) {
        throw new ApiError({
            statusCode: 404,
            message: "Conversation not found",
            error: "Not Found",
        });
    }

    // 2. Feedback is only allowed for closed conversations (RESOLVED or ARCHIVED)
    if (conversation.status !== "RESOLVED" && conversation.status !== "ARCHIVED") {
        throw new ApiError({
            statusCode: 400,
            message: "Feedback can only be submitted for resolved or archived conversations",
            error: "Bad Request",
        });
    }

    // 3. Ensure feedback doesn't already exist for this conversation
    const existingFeedback = await prisma.feedback.findUnique({
        where: { conversationId },
    });

    if (existingFeedback) {
        throw new ApiError({
            statusCode: 400,
            message: "Feedback has already been submitted for this conversation",
            error: "Bad Request",
        });
    }

    // 4. Create the feedback
    const feedback = await prisma.feedback.create({
        data: {
            conversationId,
            organizationId: conversation.organizationId,
            rating: ratingNum,
            comment: comment || null,
        },
    });

    // 5. Broadcast to the org room via Socket.io
    const io = req.app.get("io");
    if (io) {
        io.to(`org_${conversation.organizationId}`).emit("feedback_submitted", {
            conversationId,
            feedback,
        });
    }

    return res.status(201).json(
        new ApiResponse({
            statusCode: 201,
            message: "Feedback submitted successfully",
            data: feedback,
        })
    );
});
