import Elysia, { status } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { t } from "elysia";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET)
  throw new Error("JWT_SECRET must be defined in environment variables");

// Access token: 15 minutes
// Refresh token: 7 days
// Max age: 7 days
const ACCESS_TOKEN_EXP = "15m";
const REFRESH_TOKEN_EXP = "7d";
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;
const JWT_ISSUER = "coinz-api";
const JWT_AUDIENCE = "coinz-client";

const JwtPayloadSchema = t.Object({
  sub: t.String(), // userId as string
  jti: t.String(), // unique token ID (for revocation)
  type: t.Union([t.Literal("access"), t.Literal("refresh")]),
});

export class InvalidTokenError extends Error {
  constructor(message = "Invalid token") {
    super(message);
    this.name = "InvalidTokenError";
  }
}

export const jwtPlugin = new Elysia({ name: "jwt-plugin" })
  .use(
    jwt({
      // secret: {private: process.env.PRIVATE_KEY!, public: process.env.PUBLIC_KEY!}
      // alg: "RS256" for prod
      name: "accessJwt",
      secret: JWT_SECRET,
      schema: JwtPayloadSchema,
      alg: "HS256",
      iss: JWT_ISSUER,
      aud: JWT_AUDIENCE,
      exp: ACCESS_TOKEN_EXP,
    }),
  )
  .use(
    jwt({
      name: "refreshJwt",
      secret: JWT_SECRET,
      schema: JwtPayloadSchema,
      alg: "HS256",
      iss: JWT_ISSUER,
      aud: JWT_AUDIENCE,
      exp: REFRESH_TOKEN_EXP,
    }),
  )
  .error({ InvalidTokenError })
  .onError({ as: "global" }, ({ code, error, status }) => {
    if (code === "InvalidTokenError")
      return status(401, { success: false as const, error: error.message });
  })
  .derive(
    { as: "global" },
    ({ accessJwt, refreshJwt, cookie: { refreshToken } }) => ({
      issueTokens: async (userId: string) => {
        const sub = userId;

        const [accessToken, newRefreshToken] = await Promise.all([
          accessJwt.sign({
            sub,
            jti: randomUUID(),
            type: "access",
          }),
          refreshJwt.sign({
            sub,
            jti: randomUUID(),
            type: "refresh",
          }),
        ]);

        refreshToken.set({
          value: newRefreshToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: REFRESH_TOKEN_MAX_AGE,
          // optional: expires: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE * 1000),
          path: "/auth",
        });

        return { accessToken };
      },
    }),
  )
  .macro({
    auth: {
      async resolve({ accessJwt, headers, status: s }) {
        const auth = headers.authorization?.slice(7);
        const payload = auth && (await accessJwt.verify(auth));
        if (!payload) throw new InvalidTokenError();
        if (payload.type !== "access")
          throw new InvalidTokenError("Wrong token type");
        return { userId: payload.sub, jti: payload.jti };
      },
    },
  });
