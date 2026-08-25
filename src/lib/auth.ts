import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { genericOAuth } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: "https://vercel-app-nine-omega.vercel.app",
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  }),
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
