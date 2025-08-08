// src/middleware/auth.middleware.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { AuthError, ValidationError } from "../errors/appError.js";
import { prisma } from "../utils/prisma.js";
import type { User } from "@prisma/client";
import jwt from "jsonwebtoken";

declare module "fastify" {
    interface FastifyRequest {
        user: User;
    }
}

export async function verifyToken(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        throw new AuthError("Invalid authorization header format");
    }

    const idToken = authHeader.split(" ")[1];
    if (!idToken) {
        throw new AuthError("Id token is missing");
    }
    try {
        const publicKey = Buffer.from(
            process.env.PUBLIC_KEY!,
            "base64"
        ).toString("utf-8");
        const payload = jwt.verify(idToken, publicKey, { algorithms: ["RS256"] });
        if (typeof payload !== "object" || payload === null) {
            throw new ValidationError("Invalid token payload");
        }

        try {
            const user = await prisma.user.findUnique({
                where: {
                    username: payload.username,
                },
            });
            if (!user) {
                throw new AuthError("User not found in database");
            }
            request.user = user;
        } catch (err) {
            throw new Error("User not found in database");
        }
    } catch (err) {
        throw new AuthError("Invalid or expired token");
    }
}
