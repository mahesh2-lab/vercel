import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { expo } from "@better-auth/expo";

export const auth = betterAuth({
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.EXPO_PUBLIC_AUTH_URL ||
    "http://localhost:8081",
  trustedOrigins: [
    "myapp://",
    "myapp://*",
    ...(process.env.NODE_ENV === "development"
      ? ["exp://", "exp://**", "exp://192.168.*.*:*/**"]
      : []),
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
          scopes: ["openid", "email", "profile", "offline_access"],
          pkce: true,
        },
      ],
    }),
  ],
});
