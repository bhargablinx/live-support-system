import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/helper.js";
import prisma from "../utils/prisma.js";

export const getNotes = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const id = req.params.id as string;

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

    const notes = await prisma.internalNote.findMany({
        where: {
            conversationId: id,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Internal notes fetched successfully",
            data: notes,
        })
    );
});

export const createNote = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const id = req.params.id as string;
    const { content } = req.body;

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

    const note = await prisma.internalNote.create({
        data: {
            conversationId: id,
            authorId: user.id,
            content: (content as string).trim(),
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    const io = req.app.get("io");
    if (io) {
        // Emit exclusively to the organization room (agent-facing)
        io.to(`org_${user.organizationId}`).emit("internal_note_created", {
            conversationId: id,
            note,
        });
    }

    return res.status(201).json(
        new ApiResponse({
            statusCode: 201,
            message: "Internal note created successfully",
            data: note,
        })
    );
});

export const updateNote = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const id = req.params.id as string;
    const noteId = req.params.noteId as string;
    const { content } = req.body;

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

    const existingNote = await prisma.internalNote.findFirst({
        where: {
            id: noteId,
            conversationId: id,
        },
    });

    if (!existingNote) {
        throw new ApiError({
            statusCode: 404,
            message: "Internal note not found",
            error: "Not Found",
        });
    }

    if (existingNote.authorId !== user.id) {
        throw new ApiError({
            statusCode: 403,
            message: "You can only edit internal notes authored by you",
            error: "Forbidden",
        });
    }

    const updatedNote = await prisma.internalNote.update({
        where: { id: noteId },
        data: {
            content: (content as string).trim(),
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Internal note updated successfully",
            data: updatedNote,
        })
    );
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const id = req.params.id as string;
    const noteId = req.params.noteId as string;

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

    const existingNote = await prisma.internalNote.findFirst({
        where: {
            id: noteId,
            conversationId: id,
        },
    });

    if (!existingNote) {
        throw new ApiError({
            statusCode: 404,
            message: "Internal note not found",
            error: "Not Found",
        });
    }

    if (existingNote.authorId !== user.id && user.role !== "ADMIN") {
        throw new ApiError({
            statusCode: 403,
            message: "You do not have permission to delete this note",
            error: "Forbidden",
        });
    }

    await prisma.internalNote.delete({
        where: { id: noteId },
    });

    const io = req.app.get("io");
    if (io) {
        io.to(`org_${user.organizationId}`).emit("internal_note_deleted", {
            conversationId: id,
            noteId,
        });
    }

    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Internal note deleted successfully",
            data: { conversationId: id, noteId },
        })
    );
});
