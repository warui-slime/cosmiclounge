import { FastifyReply } from "fastify";

export class ApiResponse {
  static success(
    reply: FastifyReply,
    statusCode: number,
    message: string,
    data?: any
  ) {
    reply.status(statusCode).send({
      success: true,
      message,
      data,
    });
  }

  // Optional: Keep for consistency if needed in controllers
  static error(
    reply: FastifyReply,
    statusCode: number,
    message: string,
    errorCode: string = "APP_ERROR",
    errors?: { path: string; message: string }[]
  ) {
    reply.status(statusCode).send({
      success: false,
      message,
      errorCode,
      errors,
    });
  }
}