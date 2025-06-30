import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserByCredentials, updateLastLogin } from "../../lib/mongo";

const JWT_SECRET = "your-jwt-secret-key"; // En producción, usar variable de entorno

export const POST: APIRoute = async ({ request }) => {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Username y password son requeridos",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar usuario
    const user = await getUserByCredentials(username);

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Credenciales inválidas",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Credenciales inválidas",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Usuario inactivo",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Actualizar último login
    if (user._id) {
      await updateLastLogin(user._id);
    }

    // Crear JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Preparar datos del usuario (sin contraseña)
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: "Login exitoso",
        user: userData,
        token,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `auth-token=${token}; HttpOnly; Path=/; Max-Age=${
            24 * 60 * 60
          }; SameSite=Strict`,
        },
      }
    );
  } catch (error) {
    console.error("Error en login:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error interno del servidor",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const DELETE: APIRoute = async () => {
  // Logout - limpiar cookie
  return new Response(
    JSON.stringify({
      success: true,
      message: "Logout exitoso",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie":
          "auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict",
      },
    }
  );
};
