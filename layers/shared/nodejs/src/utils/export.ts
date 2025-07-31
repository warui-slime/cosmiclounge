import type { FastifyInstance,FastifyRequest, FastifyReply } from "fastify";
import awsLambdaFastify from "@fastify/aws-lambda";
import {
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  InitiateAuthCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { customAlphabet } from "nanoid";


export {
  FastifyInstance,
  awsLambdaFastify,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  InitiateAuthCommand,
  SignUpCommand,
  FastifyRequest, FastifyReply,
  customAlphabet
};
