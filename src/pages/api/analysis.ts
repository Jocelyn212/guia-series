import type { APIRoute } from "astro";
import { requireAdmin } from "../../lib/auth";
import {
  insertAnalisis,
  updateAnalisis,
  deleteAnalisis,
  getAnalisisById,
} from "../../lib/mongo";

export const POST: APIRoute = async (context) => {
  try {
    // Verificar que el usuario sea admin
    requireAdmin(context);

    const data = await context.request.json();

    // Crear nuevo análisis
    const analisis = {
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      universe: data.universe,
      tags: data.tags || [],
      author: data.author || { name: "Admin" },
      status: data.status || "published",
      readTime: data.readTime || 5,
      views: 0,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: data.status === "published" ? new Date() : undefined,
    };

    const id = await insertAnalisis(analisis);

    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error creating analisis:", error);
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
    const { id, ...analisisData } = data;

    // Actualizar análisis existente
    const updateData = {
      ...analisisData,
      readTime: analisisData.readTime
        ? parseInt(analisisData.readTime)
        : undefined,
      updatedAt: new Date(),
    };

    // Si se está publicando, agregar publishedAt
    if (updateData.status === "published") {
      updateData.publishedAt = new Date();
    }

    // Remover campos undefined
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const success = await updateAnalisis(id, updateData);

    return new Response(JSON.stringify({ success }), {
      status: success ? 200 : 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error updating analisis:", error);
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

    const success = await deleteAnalisis(id);

    return new Response(JSON.stringify({ success }), {
      status: success ? 200 : 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error deleting analisis:", error);
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
