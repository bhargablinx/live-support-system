import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/helper.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';


const createVisitor = asyncHandler(async (req: Request, res: Response) => {

    const { organizationId, name, email } = req.body;

    if (!organizationId || !name || !email)
        throw new ApiError({
            statusCode: 400,
            message: "Organization id, name, and email are required",
            error: "Bad Request"
        })

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
        })

    const token = crypto.randomUUID();

    const visitor = await prisma.visitor.create({
        data: {
            token,
            organizationId,
            name,
            email
        }
    });


    return res.status(201).json(
        new ApiResponse({
            statusCode: 201,
            message: "Visitor created successfully",
            data: {
                visitorToken: visitor.token
            },
        })
    );
})

export { createVisitor }