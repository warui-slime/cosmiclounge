import { prisma } from "../utils/prisma.js";
import { SignUpError, ValidationError } from "../errors/appError.js";
import jwt from "jsonwebtoken";

export async function signup(token: string): Promise<void> {
    try {
        console.log("before token verification");

        const publicKey = Buffer.from(
            process.env.PUBLIC_KEY!,
            "base64"
        ).toString("utf-8");
        const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
        if (typeof decoded !== "object" || decoded === null) {
            throw new ValidationError("Invalid token payload");
        }

        console.log("after token verification");


        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email: decoded.email }, { cognitoSub: decoded.sub }],
            },
        });

        if (existingUser) {
            throw new SignUpError("User already exists");
        }

        await prisma.user.create({
            data: {
                username: decoded.username,
                email: decoded.email,
                cognitoSub: decoded.sub as string,
            },
        });
    } catch (err) {
        console.log(err);
        
        if (err instanceof ValidationError || err instanceof SignUpError) {
            throw err;
        }
        throw new SignUpError("Failed to create user");
    }
}
