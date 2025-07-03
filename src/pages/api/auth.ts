import type { APIRoute } from "astro";
import jwt from "jsonwebtoken";

// Simplificar las constantes
const JWT_SECRET = "mi-super-secreto-jwt-para-desarrollo-cambiar-en-produccion";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Leer el body de forma segura
    const body = await request.json();

    const username = body?.username;
    const password = body?.password;

    if (!username || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Username and password are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar credenciales
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Crear token simple
      const token = jwt.sign(
        {
          userId: "admin-001",
          username,
          role: "admin",
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Limpiar cualquier sesión de usuario público antes de configurar admin
      cookies.delete("public-auth-token");

      // Configurar cookie de admin
      cookies.set("auth-token", token, {
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid credentials",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Auth error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// Manejar logout de admin (DELETE)
export const DELETE: APIRoute = async ({ cookies }) => {
  try {
    // Limpiar la cookie de autenticación de admin
    cookies.delete("auth-token");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Logout error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
