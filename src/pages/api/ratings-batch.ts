import type { APIRoute } from "astro";
import { getPublicAuthUser } from "../../lib/publicAuth";
import { getUserRating, getSerieRatingStats } from "../../lib/ratings";

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const url = new URL(request.url);
    const serieSlugParam = url.searchParams.get("serieSlug");

    if (!serieSlugParam) {
      return new Response(
        JSON.stringify({ error: "Missing serieSlug parameter" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Convertir el parámetro a array de slugs
    const serieSlugs = serieSlugParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (serieSlugs.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid series slugs provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Obtener información del usuario si está autenticado
    const user = getPublicAuthUser(request);

    // Preparar el resultado
    const result: Record<
      string,
      {
        userRating: number;
        averageRating: number;
        totalRatings: number;
      }
    > = {};

    // Procesar cada serie
    for (const serieSlug of serieSlugs) {
      try {
        // Obtener estadísticas de la serie
        const stats = await getSerieRatingStats(serieSlug);

        // Obtener valoración del usuario si está autenticado
        let userRating = 0;
        if (user) {
          const userRatingData = await getUserRating(user.id, serieSlug);
          userRating = userRatingData?.rating || 0;
        }

        result[serieSlug] = {
          userRating,
          averageRating: stats?.averageRating || 0,
          totalRatings: stats?.totalRatings || 0,
        };
      } catch (error) {
        console.error(`Error processing ratings for ${serieSlug}:`, error);
        // En caso de error, usar valores por defecto
        result[serieSlug] = {
          userRating: 0,
          averageRating: 0,
          totalRatings: 0,
        };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        ratings: result,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in batch ratings API:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
