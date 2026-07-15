import jwt from 'jsonwebtoken';
import prisma from './prisma.js';
import "dotenv/config"

interface DecodedToken {
    id: string;
    iat: number;
    exp: number;
}

export async function verifyAccessToken(token: string) {
    const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || ''
    ) as DecodedToken;

    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        omit: {
            passwordHash: true,
            refreshToken: true,
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}