import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { Kysely } from "kysely";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { genericOAuth } from "better-auth/plugins";


const dialect = new LibsqlDialect({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});


export const auth = betterAuth({
  baseURL: "https://vercel-app-nine-omega.vercel.app",
  database: { dialect, type: "sqlite" },
  trustedOrigins: ["myapp://", "https://vercel-app-nine-omega.vercel.app"],
  plugins: [
    expo(),
    genericOAuth({
      config: [
        {
          providerId: "vercel",
          clientId: process.env.VERCEL_CLIENT_ID || "",
          clientSecret: process.env.VERCEL_CLIENT_SECRET || "",
          authorizationUrl: "https://vercel.com/oauth/authorize",
          tokenUrl: "https://api.vercel.com/login/oauth/token",
          userInfoUrl: "https://api.vercel.com/login/oauth/userinfo",
          scopes: ["openid", "email", "profile"],
          pkce: true,
        },
      ],
    }),
  ],
});
