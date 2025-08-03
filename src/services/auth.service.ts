import { TUserSignup, TUserLogin, TConfirmSignup } from "../validators/auth.validator.js";
import { prisma } from "../utils/prisma.js";
import {
  AuthError,
  ConflictError,
  SignUpError,
  ValidationError,
} from "../errors/appError.js";
import {
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient, getSecretHash } from "../utils/cognito.client.js";

export class AuthService {
  async signup(userData: TUserSignup) {
    // const existingUser = await prisma.user.findFirst({
    //   where: {
    //     OR: [{ username: userData.username }, { email: userData.email }],
    //   },
    // });

    // if (existingUser) {
    //   if (existingUser.username === userData.username) {
    //     throw new ConflictError("Username already exists");
    //   }
    //   if (existingUser.email === userData.email) {
    //     throw new ConflictError("Email already registered");
    //   }
    // }

    // const hashedPassword = await bcrypt.hash(userData.password, 10);

    // const user = await prisma.user.create({
    //   data: {
    //     username: userData.username,
    //     passwordHash: hashedPassword,
    //     email: userData.email,
    //   },
    // });

    // return {
    //   username: user.username,
    //   email: user.email,
    //   createdAt: user.createdAt,
    // };
    const signUpCommand = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      SecretHash: getSecretHash(userData.username),
      Username: userData.username,
      Password: userData.password,
      UserAttributes: [
        { Name: "email", Value: userData.email },
        { Name: "preferred_username", Value: userData.username },
      ],
    });
    await cognitoClient.send(signUpCommand);
  }

  async confirmSignup(
   userData: TConfirmSignup
  ) {
      // — Confirm in Cognito —
      await cognitoClient.send(
        new ConfirmSignUpCommand({
          ClientId: process.env.COGNITO_CLIENT_ID!,
          SecretHash: getSecretHash(userData.username),
          Username: userData.username,
          ConfirmationCode: userData.confirmationCode,
        })
      );

      // — Grab the Cognito `sub` attribute —
      const { UserAttributes } = await cognitoClient.send(
        new AdminGetUserCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID!,
          Username: userData.username,
        })
      );
      const sub = UserAttributes?.find((a) => a.Name === "sub")?.Value;
      if (!sub) throw new Error("Missing Cognito sub");

      // — Create the user in your RDS in one go —
      const dbUser = await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          cognitoSub: sub,
        },
      });

      // — Link the RDS ID back into Cognito —
      await cognitoClient.send(
        new AdminUpdateUserAttributesCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID!,
          Username: userData.username,
          UserAttributes: [
            { Name: "custom:rds_user_id", Value: dbUser.id },
          ],
        })
      );

      return dbUser;
    
  }

  async login(userData: TUserLogin) {
    // const user = await prisma.user.findFirst({
    //   where: {
    //     OR: [{ username: userData.identifier }, { email: userData.identifier }],
    //   },
    // });

    // if (
    //   !user ||
    //   !(await bcrypt.compare(userData.password, user.passwordHash))
    // ) {
    //   throw new AuthError("Invalid credentials");
    // }

    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { lastLogin: new Date() },
    // });

    // return {
    //   user: {
    //     id: user.id,
    //     username: user.username,
    //     email: user.email,
    //     createdAt: user.createdAt,
    //     lastLogin: user.lastLogin,
    //   },
    // };
    const authCommand = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID!,
      AuthParameters: {
        USERNAME: userData.identifier,
        PASSWORD: userData.password,
        SECRET_HASH: getSecretHash(userData.identifier),
      },
    });

    const authResponse = await cognitoClient.send(authCommand);

    // Get user info from Cognito
    const userInfoCommand = new AdminGetUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      Username: userData.identifier,
    });

    const cognitoUser = await cognitoClient.send(userInfoCommand);

    // Extract RDS user ID from Cognito attributes
    const rdsUserId = cognitoUser.UserAttributes?.find(
      (attr) => attr.Name === "custom:rds_user_id"
    )?.Value;

    if (!rdsUserId) throw new AuthError("User not linked to database");

    // Fetch user from RDS
    const user = await prisma.user.findUnique({
      where: { id: rdsUserId },
    });

    if (!user) throw new AuthError("User not found in database");

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      user: {
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
      tokens: authResponse.AuthenticationResult,
    };
  }
}
