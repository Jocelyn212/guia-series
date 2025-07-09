import type { APIRoute } from "astro";
import { getPublicAuthUser } from "../../lib/publicAuth";
import {
  createOrUpdateRating,
  getUserRating,
  getSerieRatings,
  getSerieRatingStats,
  deleteRating,
} from "../../lib/ratings";

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = getPublicAuthUser(request);
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { serieSlug, rating, review } = await request.json();

    if (!serieSlug || !rating || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: "Datos inválidos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await createOrUpdateRating(
      session.id,
      serieSlug,
      rating,
      review
    );

    if (result) {
      // Obtener estadísticas actualizadas
      const stats = await getSerieRatingStats(serieSlug);

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            rating: result,
            averageRating: stats?.averageRating || 0,
            totalRatings: stats?.totalRatings || 0,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Error al guardar valoración" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error en POST /api/ratings:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const session = getPublicAuthUser(request);
    const serieSlug = url.searchParams.get("serieSlug");
    const action = url.searchParams.get("action");

    if (!serieSlug) {
      return new Response(JSON.stringify({ error: "SerieSlug requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "user" && session) {
      // Obtener valoración del usuario actual
      const userRating = await getUserRating(session.id, serieSlug);
      return new Response(JSON.stringify({ userRating }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "stats") {
      // Obtener estadísticas de la serie
      const stats = await getSerieRatingStats(serieSlug);
      return new Response(JSON.stringify({ stats }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      // Obtener lista de valoraciones
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const ratings = await getSerieRatings(serieSlug, limit, page);
      return new Response(JSON.stringify({ ratings }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Acción no válida" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error en GET /api/ratings:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const session = getPublicAuthUser(request);
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { serieSlug } = await request.json();

    if (!serieSlug) {
      return new Response(JSON.stringify({ error: "SerieSlug requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const success = await deleteRating(session.id, serieSlug);

    if (success) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({ error: "Error al eliminar valoración" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error en DELETE /api/ratings:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
