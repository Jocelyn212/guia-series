// API para manejar watchlist de usuarios
import type { APIRoute } from "astro";
import { getPublicAuthUser } from "../../lib/publicAuth";
import {
  addUserWatchlistSerie,
  removeUserWatchlistSerie,
} from "../../lib/mongo";

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

    const { serieSlug, action } = await request.json();

    if (!serieSlug || !action) {
      return new Response(JSON.stringify({ error: "Datos faltantes" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let success = false;

    if (action === "add") {
      success = await addUserWatchlistSerie(user.id, serieSlug);
    } else if (action === "remove") {
      success = await removeUserWatchlistSerie(user.id, serieSlug);
    }

    if (success) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({ error: "Error al actualizar watchlist" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error en API watchlist:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
