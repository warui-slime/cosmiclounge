import { FastifyInstance } from "fastify";
import {
  errorResponseSchema,
  signupSchema,
  TUserSignup,
  signupResponseSchema,
} from "../validators/auth.validator.js";
import { AuthError, SignUpError } from "../errors/appError.js";
import { signup } from "../services/auth.service.js";

async function userAuth(fastify: FastifyInstance) {
  fastify.post<{ Body: TUserSignup }>(
    "/signup",
    {
      schema: {
        headers: {
          type: 'object',
          required: ['authorization'],
          properties: {
            authorization: { type: 'string' }
          }
        },
        response: {
          201: signupResponseSchema,
          400: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
          throw new AuthError("Invalid authorization header format");
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
          throw new AuthError("Authentication token is missing");
        }

        await signup(token);

        // Set the cookie with the token
        reply
          .setCookie("idToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 3600,
          })
          .code(201)
          .send({ message: "User signed up successfully" });
      } catch (error) {
        if (error instanceof AuthError) {
          reply.code(401).send({ message: error.message });
          return;
        }
        if (error instanceof SignUpError) {
          reply.code(409).send({ message: error.message });
          return;
        }
        reply.code(500).send({ message: "Internal server error" });
      }
    }
  );
}
export default userAuth;
