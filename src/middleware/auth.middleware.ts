// src/middleware/auth.middleware.ts
import { FastifyRequest, FastifyReply } from 'fastify'
import { CognitoJwtVerifier } from 'aws-jwt-verify'
import { AuthError } from '../errors/appError.js'
// import { prisma } from '../utils/prisma.js'
// import type { User } from '@prisma/client'


const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID!

const verifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  tokenUse: 'id', // or 'access' depending on your use case
  clientId: COGNITO_CLIENT_ID,
})



declare module 'fastify' {
  interface FastifyRequest {
    user: {
      sub: string
      email?: string
      [key: string]: any
    }
  }
}

export async function verifyToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // 2) Grab the token from cookies (or fallback to header)
    const token =
      (request as any).cookies?.accessToken ??
      (request.headers.authorization?.startsWith('Bearer ')
        ? request.headers.authorization.slice(7)
        : null)

    if (!token) {
      throw new AuthError('Authentication token is missing')
    }

    // 3) Verify with Cognito
    const payload = await verifier.verify(token)

    // 4) Attach Cognito claims to request.user
    request.user = payload
    return
  } catch (err) {
    throw new AuthError('Invalid or expired token')
  }
}
