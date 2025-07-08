import type { APIRoute } from 'astro';
import { 
  getAllBlogPosts, 
  getBlogPostBySlug, 
  getBlogPostById,
  createBlogPost, 
  updateBlogPost, 
  deleteBlogPost 
} from '../../lib/blog';
import { getAuthUser } from '../../lib/auth';

// GET - Obtener posts o post específico
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const searchParams = new URL(url).searchParams;
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (slug) {
      const post = await getBlogPostBySlug(slug);
      if (!post) {
        return new Response(JSON.stringify({ error: 'Post no encontrado' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify(post), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (id) {
      const post = await getBlogPostById(id);
      if (!post) {
        return new Response(JSON.stringify({ error: 'Post no encontrado' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify(post), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const posts = await getAllBlogPosts(limit, page);
    return new Response(JSON.stringify(posts), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in GET /api/blog:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST - Crear nuevo post (solo admin)
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Verificar autenticación de admin
    const authUser = getAuthUser({ request, cookies } as any);
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const postData = await request.json();
    
    // Validar datos requeridos
    if (!postData.title || !postData.slug || !postData.content || !postData.excerpt) {
      return new Response(JSON.stringify({ error: 'Datos faltantes' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Crear el post
    const newPost = await createBlogPost({
      title: postData.title,
      slug: postData.slug,
      excerpt: postData.excerpt,
      content: postData.content,
      author: postData.author || { name: 'Administrador' },
      category: postData.category || 'editorial',
      tags: postData.tags || [],
      featuredImage: postData.featuredImage,
      published: postData.published || false,
      publishedAt: postData.published ? new Date() : undefined
    });

    if (!newPost) {
      return new Response(JSON.stringify({ error: 'Error al crear el post' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(newPost), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in POST /api/blog:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT - Actualizar post (solo admin)
export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    // Verificar autenticación de admin
    const authUser = getAuthUser({ request, cookies } as any);
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updateData = await request.json();
    
    if (!updateData.id) {
      return new Response(JSON.stringify({ error: 'ID del post requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Si se está publicando, agregar fecha de publicación
    if (updateData.published && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updatedPost = await updateBlogPost(updateData.id, updateData);

    if (!updatedPost) {
      return new Response(JSON.stringify({ error: 'Error al actualizar el post' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(updatedPost), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in PUT /api/blog:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE - Eliminar post (solo admin)
export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    // Verificar autenticación de admin
    const authUser = getAuthUser({ request, cookies } as any);
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = await request.json();
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID del post requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const success = await deleteBlogPost(id);

    if (!success) {
      return new Response(JSON.stringify({ error: 'Error al eliminar el post' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in DELETE /api/blog:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
