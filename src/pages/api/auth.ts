import type { APIRoute } from "astro";
import jwt from "jsonwebtoken";
import { getUserByCredentials } from "../../lib/mongo";
import crypto from "node:crypto";

// Obtener JWT_SECRET de las variables de entorno
const JWT_SECRET =
  typeof process !== "undefined" && process.env
    ? process.env.JWT_SECRET
    : import.meta.env.JWT_SECRET ||
      "mi-super-secreto-jwt-para-desarrollo-cambiar-en-produccion";

// Función para hashear contraseñas (igual que en user-auth)
function hashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + "salt-series-guide")
    .digest("hex");
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Debug: Log para verificar el entorno
    console.log("🔍 Debug - Auth endpoint called");
    console.log("🔍 JWT_SECRET existe:", !!JWT_SECRET);
    console.log("🔍 JWT_SECRET length:", JWT_SECRET.length);
    
    // Leer el body de forma segura
    const body = await request.json();

    const username = body?.username;
    const password = body?.password;

    console.log("🔍 Debug - Login attempt for username:", username);

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

    // Buscar usuario en la base de datos
    const user = await getUserByCredentials(username);
    console.log("🔍 Debug - User found:", !!user);
    console.log("🔍 Debug - User role:", user?.role);
    console.log("🔍 Debug - User isActive:", user?.isActive);

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Usuario no encontrado",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar que el usuario tenga rol de admin
    if (user.role !== "admin") {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Acceso no autorizado. Se requieren permisos de administrador.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar que la cuenta esté activa
    if (!user.isActive) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Cuenta desactivada",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar contraseña
    const hashedPassword = hashPassword(password);
    console.log("🔍 Debug - Password hash generated:", hashedPassword.substring(0, 20) + "...");
    console.log("🔍 Debug - Stored password hash:", user.password.substring(0, 20) + "...");
    console.log("🔍 Debug - Passwords match:", hashedPassword === user.password);
    
    if (hashedPassword !== user.password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Contraseña incorrecta",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Login exitoso - crear token
    const token = jwt.sign(
      {
        userId: (user._id as any).toString(),
        username: user.username,
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
