import pg, { Pool } from "pg";

/**
 * TEMPORARY one-shot migration endpoint.
 * Hit once with the BETTER_AUTH_SECRET header, then DELETE this file.
 *
 * Usage after deploy:
 *   curl -H
 *        https://vercel-app-nine-omega.vercel.app/api/migrate
 */
export async function GET(request: Request) {
  // const secret = request.headers.get("x-secret");
  // if (!secret || secret !== process.env.BETTER_AUTH_SECRET) {
  //   return Response.json({ error: "Unauthorized" }, { status: 401 });
  // }
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

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id"            TEXT        NOT NULL PRIMARY KEY,
        "name"          TEXT        NOT NULL,
        "email"         TEXT        NOT NULL UNIQUE,
        "emailVerified" BOOLEAN     NOT NULL DEFAULT FALSE,
        "image"         TEXT,
        "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "session" (
        "id"        TEXT        NOT NULL PRIMARY KEY,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "token"     TEXT        NOT NULL UNIQUE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "userId"    TEXT        NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "account" (
        "id"                    TEXT        NOT NULL PRIMARY KEY,
        "accountId"             TEXT        NOT NULL,
        "providerId"            TEXT        NOT NULL,
        "userId"                TEXT        NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "accessToken"           TEXT,
        "refreshToken"          TEXT,
        "idToken"               TEXT,
        "accessTokenExpiresAt"  TIMESTAMPTZ,
        "refreshTokenExpiresAt" TIMESTAMPTZ,
        "scope"                 TEXT,
        "password"              TEXT,
        "issuer"                TEXT,
        "createdAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Patch existing tables if already created without new columns
      ALTER TABLE IF EXISTS "account" ADD COLUMN IF NOT EXISTS "issuer" TEXT;

      CREATE TABLE IF NOT EXISTS "verification" (
        "id"         TEXT        NOT NULL PRIMARY KEY,
        "identifier" TEXT        NOT NULL,
        "value"      TEXT        NOT NULL,
        "expiresAt"  TIMESTAMPTZ NOT NULL,
        "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS "session_userId_idx"
        ON "session" ("userId");
      CREATE INDEX IF NOT EXISTS "account_userId_idx"
        ON "account" ("userId");
      CREATE INDEX IF NOT EXISTS "verification_identifier_idx"
        ON "verification" ("identifier");
    `);

    return Response.json({ success: true, message: "All tables created." });
  } catch (err: any) {
    console.error("Migration error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  } finally {
    await pool.end();
  }
}
