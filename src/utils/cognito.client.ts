import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import crypto from "crypto";

export const cognitoClient = new CognitoIdentityProviderClient({
    region:process.env.COGNITO_REGION
})
export function getSecretHash(username: string): string {
  const hmac = crypto.createHmac("SHA256", process.env.COGNITO_CLIENT_SECRET!);
  hmac.update(username + process.env.COGNITO_CLIENT_ID!);
  return hmac.digest("base64");
}