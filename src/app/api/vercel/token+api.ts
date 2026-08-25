import { auth } from "../../../lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const accounts = await auth.api.listUserAccounts({
      headers: request.headers,
    });

    const vercelAccount = accounts.find(
      (account) => account.providerId === "vercel"
    );

    if (!vercelAccount) {
      return Response.json(
        { error: "Vercel account is not linked." },
        { status: 404 }
      );
    }

    const tokenData = await auth.api.getAccessToken({
      body: {
        accountId: vercelAccount.id,
      },
      headers: request.headers,
    });

    if (!tokenData?.accessToken) {
      return Response.json(
        { error: "No Vercel OAuth access token found." },
        { status: 404 }
      );
    }

    return Response.json({
      accessToken: tokenData.accessToken,
    });
  } catch (error) {
    console.error("GET /api/vercel/token error:", error);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}