import type { APIRoute } from "astro";
import { connectMongoDB } from "../../lib/mongo";
import mongoose from "mongoose";

export const PUT: APIRoute = async ({ request }) => {
  try {
    await connectMongoDB();
    const data = await request.json();

    // Validar que el ID esté presente
    if (!data.id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "ID de serie requerido",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(data.id)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "ID de serie inválido",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Preparar datos para actualizar
    const updateData: any = {
      title: data.title,
      slug: data.slug,
      description: data.description,
      genre: Array.isArray(data.genre) ? data.genre : [],
      network: data.network,
      status: data.status,
      startYear: data.startYear ? parseInt(data.startYear) : null,
      endYear: data.endYear ? parseInt(data.endYear) : null,
      totalSeasons: data.totalSeasons ? parseInt(data.totalSeasons) : null,
      totalEpisodes: data.totalEpisodes ? parseInt(data.totalEpisodes) : null,
      imdbId: data.imdbId || "",
      imdbRating: data.imdbRating ? parseFloat(data.imdbRating) : 0,
      posterUrl: data.posterUrl || "",
      backdropUrl: data.backdropUrl || "",
      trailerUrl: data.trailerUrl || "",
      lgbtqContent: Boolean(data.lgbtqContent),
      platforms: Array.isArray(data.platforms) ? data.platforms : [],
      updatedAt: new Date(),
    };

    // Usar la conexión directa de mongoose
    const SerieModel =
      mongoose.models.Serie ||
      mongoose.model(
        "Serie",
        new mongoose.Schema({}, { collection: "series" })
      );

    // Actualizar la serie en la base de datos
    const result = await SerieModel.updateOne(
      { _id: new mongoose.Types.ObjectId(data.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Serie no encontrada",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Serie actualizada exitosamente",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error actualizando serie:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error interno del servidor",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    await connectMongoDB();
    const data = await request.json();

    // Validar que el ID esté presente
    if (!data.id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "ID de serie requerido",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(data.id)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "ID de serie inválido",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Usar la conexión directa de mongoose
    const SerieModel =
      mongoose.models.Serie ||
      mongoose.model(
        "Serie",
        new mongoose.Schema({}, { collection: "series" })
      );

    // Eliminar la serie de la base de datos
    const result = await SerieModel.deleteOne({
      _id: new mongoose.Types.ObjectId(data.id),
    });

    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Serie no encontrada",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Serie eliminada exitosamente",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error eliminando serie:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error interno del servidor",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const GET: APIRoute = async ({ url }) => {
  try {
    await connectMongoDB();

    // Obtener parámetros de consulta
    const searchParams = new URL(url).searchParams;
    const id = searchParams.get("id");

    // Usar la conexión directa de mongoose
    const SerieModel =
      mongoose.models.Serie ||
      mongoose.model(
        "Serie",
        new mongoose.Schema({}, { collection: "series" })
      );

    if (id) {
      // Validar ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "ID de serie inválido",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Obtener una serie específica
      const serie = await SerieModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
      });

      if (!serie) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Serie no encontrada",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: serie,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      // Obtener todas las series
      const series = await SerieModel.find({});

      return new Response(
        JSON.stringify({
          success: true,
          data: series,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error obteniendo series:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error interno del servidor",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
