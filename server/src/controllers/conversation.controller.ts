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

const getConversations = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }

    const conversations = await prisma.conversation.findMany({
        where: {
            organizationId: user.organizationId
        },
        include: {
            visitor: true,
            assignedUser: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            },
            messages: {
                orderBy: {
                    createdAt: "asc"
                }
            }
        },
        orderBy: {
            updatedAt: "desc"
        }
    });

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Conversations fetched successfully",
            data: conversations
        })
    );
});

const claimConversation = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = req.user;
    if (!user) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }

    const conversation = await prisma.conversation.findFirst({
        where: {
            id,
            organizationId: user.organizationId
        }
    });

    if (!conversation) {
        throw new ApiError({
            statusCode: 404,
            message: "Conversation not found",
            error: "Not Found",
        });
    }

    const updated = await prisma.conversation.update({
        where: { id },
        data: {
            assignedUserId: user.id,
            status: "CLAIMED"
        },
        include: {
            visitor: true,
            assignedUser: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            }
        }
    });

    const io = req.app.get("io");
    if (io) {
        io.to(`org_${user.organizationId}`).emit("conversation_claimed", updated);
        io.to(id).emit("conversation_claimed", updated);
    }

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Conversation claimed successfully",
            data: updated
        })
    );
});

const resolveConversation = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = req.user;
    if (!user) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }

    const conversation = await prisma.conversation.findFirst({
        where: {
            id,
            organizationId: user.organizationId
        }
    });

    if (!conversation) {
        throw new ApiError({
            statusCode: 404,
            message: "Conversation not found",
            error: "Not Found",
        });
    }

    const updated = await prisma.conversation.update({
        where: { id },
        data: {
            status: "RESOLVED"
        },
        include: {
            visitor: true,
            assignedUser: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            }
        }
    });

    const io = req.app.get("io");
    if (io) {
        io.to(`org_${user.organizationId}`).emit("conversation_resolved", updated);
        io.to(id).emit("conversation_resolved", updated);
    }

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Conversation resolved successfully",
            data: updated
        })
    );
});

const getMessages = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = req.user;
    if (!user) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }

    const conversation = await prisma.conversation.findFirst({
        where: {
            id,
            organizationId: user.organizationId
        }
    });

    if (!conversation) {
        throw new ApiError({
            statusCode: 404,
            message: "Conversation not found",
            error: "Not Found",
        });
    }

    const messages = await prisma.message.findMany({
        where: {
            conversationId: id
        },
        orderBy: {
            createdAt: "asc"
        }
    });

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Messages fetched successfully",
            data: messages
        })
    );
});

export { createConversation, getConversations, claimConversation, resolveConversation, getMessages }