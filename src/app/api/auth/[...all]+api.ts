import { auth } from "../../../lib/auth";

const handler = async (request: Request) => {
  try {
    console.log("Auth request:", request.method, request.url);
    const response = await auth.handler(request);

    if (!response.ok) {
      const clone = response.clone();
      const body = await clone.text();
      console.error("Better Auth API Error:", response.status, body);
    }

    return response;
  } catch (error) {
    console.error("Better Auth API Exception:", error);
    throw error;
  }
};

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
  handler as OPTIONS,
};
