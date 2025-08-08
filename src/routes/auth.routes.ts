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
    fastify.post(
        "/signup",
        {
            schema: {
                body: signupSchema,
                // headers: {
                //     type: "object",
                //     required: ["authorization", "x-id-token"],
                //     properties: {
                //         authorization: { type: "string" },
                //         "x-id-token": { type: "string" },
                //     },
                // },
                response: {
                    201: signupResponseSchema,
                    400: errorResponseSchema,
                    409: errorResponseSchema,
                    500: errorResponseSchema,
                },
            },
        },
        async (request, reply) => {
           

            const authHeader = request.headers.authorization;

            if (!authHeader?.startsWith("Bearer ")) {
                throw new AuthError("Invalid authorization header format");
            }

            const idToken = authHeader.split(" ")[1];
            if (!idToken) {
                throw new AuthError("Id token is missing");
            }

            
            
            await signup(idToken);

            reply.code(201).send({ message: "User signed up successfully" });
        }
    );
}
export default userAuth;
