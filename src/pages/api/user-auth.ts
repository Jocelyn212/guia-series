import type { APIRoute } from "astro";
import {
  getUserByEmail,
  updateUserLastLogin,
  updateUserPassword,
} from "../../lib/mongo";
import { createPublicAuthCookie } from "../../lib/publicAuth";
import { verifyPasswordWithMigration } from "../../lib/password";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const email = body?.email;
    const password = body?.password;

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Email y contraseña son obligatorios",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const user = await getUserByEmail(email);

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

    if (user.role === "admin") {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Acceso no autorizado. Use el panel administrativo.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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

    // Verificar contraseña con migración automática
    console.log("🔍 Debug - Usuario encontrado:", user.username);
    console.log(
      "🔍 Debug - Hash almacenado:",
      user.password.substring(0, 20) + "..."
    );
    console.log("🔍 Debug - Longitud hash:", user.password.length);

    const passwordResult = await verifyPasswordWithMigration(
      password,
      user.password
    );
    console.log("🔍 Debug - Resultado verificación:", passwordResult);

    if (!passwordResult.isValid) {
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

    // Si necesita actualización, actualizar la contraseña en la base de datos
    if (passwordResult.needsUpdate && passwordResult.newHash) {
      console.log(
        "🔄 Migrando contraseña a bcrypt para usuario:",
        user.username
      );
      await updateUserPassword(
        (user._id as any).toString(),
        passwordResult.newHash
      );
      console.log(
        "✅ Contraseña migrada a bcrypt para usuario:",
        user.username
      );
    } else {
      console.log("ℹ️ Usuario ya usa bcrypt:", user.username);
    }

    // Login exitoso para usuario público
    const publicUserData = {
      id: (user._id as any).toString(),
      username: user.username,
      email: user.email,
      role: "user" as const,
    };

    // Actualizar último login
    await updateUserLastLogin(publicUserData.id);

    // Crear cookie de autenticación
    const authCookie = createPublicAuthCookie(publicUserData);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Login exitoso",
        user: {
          username: publicUserData.username,
          email: publicUserData.email,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": authCookie,
        },
      }
    );
  } catch (err) {
    console.error("Error en login de usuario:", err);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error del servidor",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
