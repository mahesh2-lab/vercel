import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import pg from "pg";

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.DB_CA,
  },
};

const pool = new pg.Pool(config);

export const auth = betterAuth({
  baseURL: "https://vercel-app-nine-omega.vercel.app",

  database: pool,

  trustedOrigins: [
    "myapp://",
    "https://vercel-app-nine-omega.vercel.app",
  ],

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