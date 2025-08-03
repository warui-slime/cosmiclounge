import { CognitoJwtVerifier } from "aws-jwt-verify";
import { AuthError } from "../errors/appError.js";
import { CognitoAccessTokenPayload, CognitoIdTokenPayload } from "aws-jwt-verify/jwt-model";


const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!; 
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;       


const idTokenVerifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  clientId: CLIENT_ID,
  tokenUse: "id",
});

const accessTokenVerifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  clientId: CLIENT_ID,
  tokenUse: "access",
});

// Verify ID token
export async function verifyIdToken(token: string):Promise<CognitoIdTokenPayload> {
  try {
    const payload = await idTokenVerifier.verify(token);
    return payload;
  } catch (err: any) {
    throw new AuthError("Failed to verify ID token");
  }
}

// Verify Access token
export async function verifyAccessToken(token: string): Promise<CognitoAccessTokenPayload> {
  try {
    const payload = await accessTokenVerifier.verify(token);
    return payload;
  } catch (err: any) {
    throw new AuthError("Failed to verify Access token");
  }
}
