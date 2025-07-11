import jwt from "jsonwebtoken";
import type { APIContext } from "astro";

// Obtener JWT_SECRET de las variables de entorno (igual que en api/auth.ts)
const JWT_SECRET =
  typeof process !== "undefined" && process.env
    ? process.env.JWT_SECRET
    : import.meta.env.JWT_SECRET ||
      "mi-super-secreto-jwt-para-desarrollo-cambiar-en-produccion";

export interface AuthUser {
  userId: string;
  username: string;
  role: "admin" | "user";
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function getAuthUser(context: APIContext): AuthUser | null {
  const authCookie = context.cookies.get("auth-token");

  if (!authCookie) {
    return null;
  }

  return verifyToken(authCookie.value);
}

export function requireAuth(context: APIContext): AuthUser {
  const user = getAuthUser(context);

  if (!user) {
    throw new Response(
      JSON.stringify({
        success: false,
        message: "No autorizado",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return user;
}

export function requireAdmin(context: APIContext): AuthUser {
  const user = requireAuth(context);

  if (user.role !== "admin") {
    throw new Response(
      JSON.stringify({
        success: false,
        message: "Acceso denegado - Se requieren permisos de administrador",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return user;
}

// Función para usar en páginas Astro
export function getServerAuthUser(request: Request): AuthUser | null {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split("=");
    acc[name] = decodeURIComponent(value || "");
    return acc;
  }, {} as Record<string, string>);

  const token = cookies["auth-token"];

  if (!token) {
    return null;
  }

  const user = verifyToken(token);

  return user;
}
