import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/helper.js";
import prisma from "../utils/prisma.js";

export const getTags = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }

    const tags = await prisma.tag.findMany({
        where: {
            organizationId: user.organizationId,
        },
        include: {
            _count: {
                select: { conversations: true },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Tags fetched successfully",
            data: tags,
        })
    );
});

export const createTag = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }

    const { name, color } = req.body;

    const existingTag = await prisma.tag.findUnique({
        where: {
            organizationId_name: {
                organizationId: user.organizationId,
                name: (name as string).trim(),
            },
        },
    });

    if (existingTag) {
        throw new ApiError({
            statusCode: 409,
            message: `Tag with name '${name}' already exists in your organization`,
            error: "Conflict",
        });
    }

    const tag = await prisma.tag.create({
        data: {
            organizationId: user.organizationId,
            name: (name as string).trim(),
            color: (color as string) || "#6366f1",
        },
    });

    return res.status(201).json(
        new ApiResponse({
            statusCode: 201,
            message: "Tag created successfully",
            data: tag,
        })
    );
});

export const updateTag = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const tagId = req.params.tagId as string;
    const { name, color } = req.body;

    if (!user) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }

    const existingTag = await prisma.tag.findFirst({
        where: {
            id: tagId,
            organizationId: user.organizationId,
        },
    });

    if (!existingTag) {
        throw new ApiError({
            statusCode: 404,
            message: "Tag not found",
            error: "Not Found",
        });
    }

    if (name && (name as string).trim() !== existingTag.name) {
        const duplicate = await prisma.tag.findUnique({
            where: {
                organizationId_name: {
                    organizationId: user.organizationId,
                    name: (name as string).trim(),
                },
            },
        });

        if (duplicate) {
            throw new ApiError({
                statusCode: 409,
                message: `Tag with name '${name}' already exists`,
                error: "Conflict",
            });
        }
    }

    const updatedTag = await prisma.tag.update({
        where: { id: tagId },
        data: {
            ...(name ? { name: (name as string).trim() } : {}),
            ...(color ? { color: color as string } : {}),
        },
    });

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Tag updated successfully",
            data: updatedTag,
        })
    );
});

export const deleteTag = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const tagId = req.params.tagId as string;

    if (!user) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }

    const existingTag = await prisma.tag.findFirst({
        where: {
            id: tagId,
            organizationId: user.organizationId,
        },
    });

    if (!existingTag) {
        throw new ApiError({
            statusCode: 404,
            message: "Tag not found",
            error: "Not Found",
        });
    }

    await prisma.tag.delete({
        where: { id: tagId },
    });

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Tag deleted successfully",
            data: { id: tagId },
        })
    );
});

export const addTagToConversation = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const id = req.params.id as string; // conversationId
    const { tagId, name } = req.body;

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
            organizationId: user.organizationId,
        },
    });

    if (!conversation) {
        throw new ApiError({
            statusCode: 404,
            message: "Conversation not found",
            error: "Not Found",
        });
    }

    let targetTagId = tagId as string | undefined;

    if (!targetTagId && name) {
        let tag = await prisma.tag.findUnique({
            where: {
                organizationId_name: {
                    organizationId: user.organizationId,
                    name: (name as string).trim(),
                },
            },
        });

        if (!tag) {
            tag = await prisma.tag.create({
                data: {
                    organizationId: user.organizationId,
                    name: (name as string).trim(),
                    color: "#6366f1",
                },
            });
        }
        targetTagId = tag.id;
    } else if (targetTagId) {
        const tag = await prisma.tag.findFirst({
            where: {
                id: targetTagId,
                organizationId: user.organizationId,
            },
        });

        if (!tag) {
            throw new ApiError({
                statusCode: 404,
                message: "Tag not found in your organization",
                error: "Not Found",
            });
        }
    }

    if (!targetTagId) {
        throw new ApiError({
            statusCode: 400,
            message: "Either tagId or name must be provided",
            error: "Bad Request",
        });
    }

    const conversationTag = await prisma.conversationTag.upsert({
        where: {
            conversationId_tagId: {
                conversationId: id,
                tagId: targetTagId,
            },
        },
        create: {
            conversationId: id,
            tagId: targetTagId,
            taggedByUserId: user.id,
        },
        update: {},
        include: {
            tag: true,
        },
    });

    const allConversationTags = await prisma.conversationTag.findMany({
        where: { conversationId: id },
        include: { tag: true },
    });

    const io = req.app.get("io");
    if (io) {
        io.to(`org_${user.organizationId}`).emit("conversation_tagged", {
            conversationId: id,
            tags: allConversationTags,
            action: "added",
            tagId: targetTagId,
        });
        io.to(id).emit("conversation_tagged", {
            conversationId: id,
            tags: allConversationTags,
            action: "added",
            tagId: targetTagId,
        });
    }

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Tag added to conversation successfully",
            data: conversationTag,
        })
    );
});

export const removeTagFromConversation = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const id = req.params.id as string;
    const tagId = req.params.tagId as string;

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
            organizationId: user.organizationId,
        },
    });

    if (!conversation) {
        throw new ApiError({
            statusCode: 404,
            message: "Conversation not found",
            error: "Not Found",
        });
    }

    const existingLink = await prisma.conversationTag.findUnique({
        where: {
            conversationId_tagId: {
                conversationId: id,
                tagId,
            },
        },
    });

    if (!existingLink) {
        throw new ApiError({
            statusCode: 404,
            message: "Tag not associated with this conversation",
            error: "Not Found",
        });
    }

    await prisma.conversationTag.delete({
        where: {
            conversationId_tagId: {
                conversationId: id,
                tagId,
            },
        },
    });

    const allConversationTags = await prisma.conversationTag.findMany({
        where: { conversationId: id },
        include: { tag: true },
    });

    const io = req.app.get("io");
    if (io) {
        io.to(`org_${user.organizationId}`).emit("conversation_tagged", {
            conversationId: id,
            tags: allConversationTags,
            action: "removed",
            tagId,
        });
        io.to(id).emit("conversation_tagged", {
            conversationId: id,
            tags: allConversationTags,
            action: "removed",
            tagId,
        });
    }

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Tag removed from conversation successfully",
            data: { conversationId: id, tagId },
        })
    );
});
