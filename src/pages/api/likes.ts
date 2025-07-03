// API para manejar likes de análisis
import type { APIRoute } from "astro";
import { getPublicAuthUser } from "../../lib/publicAuth";
import { addUserLikedAnalysis, removeUserLikedAnalysis } from "../../lib/mongo";

export const POST: APIRoute = async ({ request }) => {
  try {
    // Verificar autenticación
    const user = getPublicAuthUser(request);
    if (!user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { analysisId, action } = await request.json();

    if (!analysisId || !action) {
      return new Response(JSON.stringify({ error: "Datos faltantes" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let success = false;

    if (action === "add") {
      success = await addUserLikedAnalysis(user.id, analysisId);
    } else if (action === "remove") {
      success = await removeUserLikedAnalysis(user.id, analysisId);
    }

    if (success) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({ error: "Error al actualizar likes" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error en API likes:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
