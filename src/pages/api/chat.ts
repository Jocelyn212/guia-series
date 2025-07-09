import type { APIRoute } from "astro";
import { getPublicAuthUser } from "../../lib/publicAuth";
import {
  createChatMessage,
  getChatMessages,
  updateChatMessage,
  deleteChatMessage,
} from "../../lib/chat";

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = getPublicAuthUser(request);
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { message, replyTo } = await request.json();

    if (!message || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Mensaje requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (message.length > 500) {
      return new Response(
        JSON.stringify({ error: "El mensaje es demasiado largo" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await createChatMessage(
      session.id,
      session.username,
      message.trim(),
      "message",
      replyTo
    );

    if (result) {
      return new Response(JSON.stringify({ success: true, message: result }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({ error: "Error al enviar mensaje" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error en POST /api/chat:", error);
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
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const limit = parseInt(url.searchParams.get("limit") || "50");
    const before = url.searchParams.get("before");

    const messages = await getChatMessages(limit, before || undefined);

    return new Response(JSON.stringify({ messages }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error en GET /api/chat:", error);
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

    const { messageId, message } = await request.json();

    if (!messageId || !message || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Datos inválidos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (message.length > 500) {
      return new Response(
        JSON.stringify({ error: "El mensaje es demasiado largo" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await updateChatMessage(
      messageId,
      session.id,
      message.trim()
    );

    if (result) {
      return new Response(JSON.stringify({ success: true, message: result }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({ error: "Error al actualizar mensaje" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error en PUT /api/chat:", error);
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

    const { messageId } = await request.json();

    if (!messageId) {
      return new Response(JSON.stringify({ error: "MessageId requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // TODO: Verificar si el usuario es admin para poder eliminar mensajes de otros
    const success = await deleteChatMessage(messageId, session.id, false);

    if (success) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({ error: "Error al eliminar mensaje" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error en DELETE /api/chat:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
