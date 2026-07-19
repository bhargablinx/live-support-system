import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/helper.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';

const createVisitor = asyncHandler(async (req: Request, res: Response) => {

    const { organizationId, name, email, currentUrl } = req.body;

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

    // Parse User-Agent for Browser and OS
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || "Unknown Browser";
    const os = parser.getOS().name || "Unknown OS";

    // Lookup Geolocation by IP
    const ip = req.ip || req.socket.remoteAddress || '';
    // During local development, IP will often be ::1 or 127.0.0.1 which resolves to null.
    const geo = geoip.lookup(ip);
    const location = geo ? `${geo.city}, ${geo.country}` : "Unknown Location";

    const visitor = await prisma.visitor.create({
        data: {
            token,
            organizationId,
            name,
            email,
            currentUrl,
            browser,
            os,
            location
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