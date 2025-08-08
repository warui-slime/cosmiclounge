// middlewares/errorHandler.ts
import { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod"; // Make sure to import ZodError
import { AppError } from "../errors/appError.js";
import { errorResponseSchema } from "../validators/auth.validator.js";
import z from "zod/v4";

export function errorHandler(
    error: unknown,
    request: FastifyRequest,
    reply: FastifyReply
) {
    request.log.error(
        {
            err: error,
            headers: request.headers,
            body: request.body,
        },
        "Error with incoming request"
    );
    let statusCode = 500;
    let message = "Internal Server Error";
    let errorCode = "SERVER_ERROR";
    let errors: { path: string; message: string }[] | undefined;

    // Handle different error types
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
        errorCode = error.errorCode;
    } else if (error instanceof ZodError) {
        statusCode = 400;
        message = "Validation failed";
        errorCode = "VALIDATION_ERROR";
        errors = error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
        }));
    } else if (error instanceof Error) {
        message = error.message;
    }

    // Build response
    const response: z.infer<typeof errorResponseSchema> = {
        success: false,
        message,
        errorCode,
        errors,
    };

    // Add stack trace in development
    if (process.env.NODE_ENV === "development" && error instanceof Error) {
        response.stack = error.stack;
    }

    reply.code(statusCode).send(response);
}
