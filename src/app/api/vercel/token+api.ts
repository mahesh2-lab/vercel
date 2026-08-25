import { auth } from "../../../lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    console.log(session);
    
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenData = await auth.api.getAccessToken({
      body: { useAccountCookie: true },
      headers: request.headers,
    });

    if (!tokenData?.accessToken) {
      return Response.json(
        { error: "No Vercel OAuth token found for this session." },
        { status: 404 }
      );
    }

    return Response.json({ accessToken: tokenData.accessToken });
  } catch (error) {
    console.error("GET /api/vercel/token error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
