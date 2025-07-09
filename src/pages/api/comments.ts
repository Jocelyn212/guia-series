import type { APIRoute } from "astro";
import { getPublicAuthUser } from "../../lib/publicAuth";
import {
  createComment,
  getSerieComments,
  toggleCommentLike,
  updateComment,
  deleteComment,
} from "../../lib/comments";

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = getPublicAuthUser(request);
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { serieId, content, parentId } = await request.json();

    if (!serieId || !content || content.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Datos inválidos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (content.length > 1000) {
      return new Response(
        JSON.stringify({ error: "El comentario es demasiado largo" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await createComment(
      session.id,
      serieId,
      content.trim(),
      parentId
    );

    if (result) {
      return new Response(JSON.stringify({ success: true, comment: result }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({ error: "Error al crear comentario" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error en POST /api/comments:", error);
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
    const serieId = url.searchParams.get("serieId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    if (!serieId) {
      return new Response(JSON.stringify({ error: "SerieId requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const comments = await getSerieComments(serieId, limit, page, session?.id);

    return new Response(JSON.stringify({ comments }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error en GET /api/comments:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const session = getPublicAuthUser(request);
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { commentId, content, action } = await request.json();

    if (!commentId) {
      return new Response(JSON.stringify({ error: "CommentId requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "like") {
      // Toggle like
      const success = await toggleCommentLike(commentId, session.id);
      if (success) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response(JSON.stringify({ error: "Error al dar like" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    if (action === "edit") {
      // Editar comentario
      if (!content || content.trim().length === 0) {
        return new Response(JSON.stringify({ error: "Contenido requerido" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (content.length > 1000) {
        return new Response(
          JSON.stringify({ error: "El comentario es demasiado largo" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const result = await updateComment(commentId, session.id, content.trim());
      if (result) {
        return new Response(
          JSON.stringify({ success: true, comment: result }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        return new Response(
          JSON.stringify({ error: "Error al actualizar comentario" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response(JSON.stringify({ error: "Acción no válida" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error en PUT /api/comments:", error);
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

    const { commentId } = await request.json();

    if (!commentId) {
      return new Response(JSON.stringify({ error: "CommentId requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const success = await deleteComment(commentId, session.id);

    if (success) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({ error: "Error al eliminar comentario" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error en DELETE /api/comments:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
