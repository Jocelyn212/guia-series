import type { APIRoute } from 'astro';
import { connectMongoDB, AnalisisModel } from '../../lib/mongo';

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'ID requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await connectMongoDB();
    
    if (!AnalisisModel) {
      return new Response(JSON.stringify({ success: false, error: 'Modelo no disponible' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await AnalisisModel.findByIdAndDelete(id);
    
    if (!result) {
      return new Response(JSON.stringify({ success: false, error: 'Análisis no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return new Response(JSON.stringify({ success: false, error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'ID requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await connectMongoDB();
    
    if (!AnalisisModel) {
      return new Response(JSON.stringify({ success: false, error: 'Modelo no disponible' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Actualizar análisis
    const result = await AnalisisModel.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!result) {
      return new Response(JSON.stringify({ success: false, error: 'Análisis no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, analysis: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating analysis:', error);
    return new Response(JSON.stringify({ success: false, error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
