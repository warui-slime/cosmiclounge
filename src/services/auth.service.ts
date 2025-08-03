import { prisma } from "../utils/prisma.js";
import {
  SignUpError,
  ValidationError,
} from "../errors/appError.js";
import { verifyIdToken } from "../utils/verifyCognitoToken.js";

export async function signup(token: string) {
  try {
    const decoded = await verifyIdToken(token);
    if (!decoded) {
      throw new ValidationError("Invalid token");
    }
    
    if (typeof decoded.email !== "string") {
      throw new ValidationError("Email missing in token");
    }
    
    if (typeof decoded["cognito:username"] !== "string") {
      throw new ValidationError("Username missing in token");
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: decoded.email },
          { cognitoSub: decoded.sub }
        ]
      }
    });

    if (existingUser) {
      throw new SignUpError("User already exists");
    }

    await prisma.user.create({
      data: {
        username: decoded["cognito:username"],
        email: decoded.email,
        cognitoSub: decoded.sub,
      },
    });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof SignUpError) {
      throw err;
    }
    throw new SignUpError("Failed to create user");
  }
}
