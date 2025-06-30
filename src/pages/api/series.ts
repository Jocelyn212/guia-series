import type { APIRoute } from "astro";
import { requireAdmin } from "../../lib/auth";
import {
  insertSerie,
  updateSerie,
  deleteSerie,
  getSerieById,
} from "../../lib/mongo";

export const POST: APIRoute = async (context) => {
  try {
    // Verificar que el usuario sea admin
    requireAdmin(context);

    const data = await context.request.json();

    // Crear nueva serie
    const serie = {
      title: data.title,
      slug: data.slug,
      description: data.description,
      genre: data.genre || [],
      network: data.network,
      startYear: parseInt(data.startYear),
      endYear: data.endYear ? parseInt(data.endYear) : undefined,
      totalSeasons: parseInt(data.totalSeasons),
      totalEpisodes: parseInt(data.totalEpisodes),
      status: data.status,
      imdbId: data.imdbId,
      imdbRating: parseFloat(data.imdbRating),
      posterUrl: data.posterUrl,
      backdropUrl: data.backdropUrl,
      platforms: data.platforms || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const id = await insertSerie(serie);

    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error creating serie:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

export const PUT: APIRoute = async (context) => {
  try {
    // Verificar que el usuario sea admin
    requireAdmin(context);

    const data = await context.request.json();
    const { id, ...serieData } = data;

    // Actualizar serie existente
    const updateData = {
      ...serieData,
      startYear: serieData.startYear
        ? parseInt(serieData.startYear)
        : undefined,
      endYear: serieData.endYear ? parseInt(serieData.endYear) : undefined,
      totalSeasons: serieData.totalSeasons
        ? parseInt(serieData.totalSeasons)
        : undefined,
      totalEpisodes: serieData.totalEpisodes
        ? parseInt(serieData.totalEpisodes)
        : undefined,
      imdbRating: serieData.imdbRating
        ? parseFloat(serieData.imdbRating)
        : undefined,
      updatedAt: new Date(),
    };

    // Remover campos undefined
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const success = await updateSerie(id, updateData);

    return new Response(JSON.stringify({ success }), {
      status: success ? 200 : 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error updating serie:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    // Verificar que el usuario sea admin
    requireAdmin(context);

    const { id } = await context.request.json();

    const success = await deleteSerie(id);

    return new Response(JSON.stringify({ success }), {
      status: success ? 200 : 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error deleting serie:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
