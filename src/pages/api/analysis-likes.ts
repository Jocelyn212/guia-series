// API para manejar likes de análisis
import type { APIRoute } from "astro";
import {
  incrementAnalysisLikes,
  decrementAnalysisLikes,
} from "../../lib/mongo";
import { getPublicAuthUser } from "../../lib/publicAuth";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const user = getPublicAuthUser(request);

    if (!user) {
      return new Response(JSON.stringify({ error: "Usuario no autenticado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { analysisId, analysisSlug, action } = body;

    // Aceptar tanto analysisId como analysisSlug para compatibilidad
    const id = analysisId || analysisSlug;

    if (
      !id ||
      !action ||
      !["like", "unlike", "add", "remove"].includes(action)
    ) {
      return new Response(JSON.stringify({ error: "Datos inválidos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Implementar lógica de base de datos para likes de análisis
    let success = false;
    if (action === "like" || action === "add") {
      success = await incrementAnalysisLikes(id);
    } else if (action === "unlike" || action === "remove") {
      success = await decrementAnalysisLikes(id);
    }

    if (success) {
      return new Response(
        JSON.stringify({
          success: true,
          message:
            action === "like" || action === "add"
              ? "Like agregado"
              : "Like removido",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Error actualizando likes" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error en API analysis-likes:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
