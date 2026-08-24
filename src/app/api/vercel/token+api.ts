import { auth } from "../../../lib/auth";

/**
 * Returns the Vercel OAuth access token for the currently signed-in user.
 * The client calls this once after sign-in and caches the token in SecureStore.
 */
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Better Auth stores OAuth tokens in the account table.
    const accounts = await auth.api.listUserAccounts({
      headers: request.headers,
    });

    const vercelAccount = (accounts as any[]).find(
      (a) => a.providerId === "vercel"
    );

    if (!vercelAccount?.accessToken) {
      return Response.json(
        { error: "No Vercel OAuth token found for this session." },
        { status: 404 }
      );
    }

    return Response.json({ accessToken: vercelAccount.accessToken });
  } catch (error) {
    console.error("GET /api/vercel/token error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
