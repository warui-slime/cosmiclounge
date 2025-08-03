// src/middleware/auth.middleware.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { AuthError } from "../errors/appError.js";
import { prisma } from "../utils/prisma.js";
import type { User } from "@prisma/client";
import { verifyAccessToken } from "../utils/verifyCognitoToken.js";


declare module "fastify" {
  interface FastifyRequest {
    user: User;
  }
}

export async function verifyToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
     const token = request.cookies.accessToken;
    if (!token) {
      throw new AuthError("Authentication token is missing");
    }

    const payload = await verifyAccessToken(token);
    try {
      const user = await prisma.user.findUnique({
        where: {
          username: payload.username,
        },
      });
      if (!user) {
        throw new AuthError("User not found in database");
      }
      request.user = user
    } catch (err) {
      throw new Error("User not found in database");
    }

    
  } catch (err) {
    throw new AuthError("Invalid or expired token");
  }
}
