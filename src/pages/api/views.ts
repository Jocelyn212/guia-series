// API para manejar visualizaciones de análisis
import type { APIRoute } from "astro";
import { incrementAnalysisViews } from "../../lib/mongo";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { analysisId, analysisSlug } = body;

    // Aceptar tanto analysisId como analysisSlug para compatibilidad
    const id = analysisId || analysisSlug;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID o slug de análisis requerido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Incrementar vistas en la base de datos
    const success = await incrementAnalysisViews(id);

    if (success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Vista registrada",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Error al registrar vista" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error en API views:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
