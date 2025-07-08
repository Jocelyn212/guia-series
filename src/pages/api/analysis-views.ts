import type { APIRoute } from "astro";
import { incrementAnalysisViews } from "../../lib/mongo";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { analysisId } = body;

    if (!analysisId) {
      return new Response(
        JSON.stringify({ error: "Analysis ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const success = await incrementAnalysisViews(analysisId);

    if (success) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({ error: "Failed to increment views" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error in views API:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
