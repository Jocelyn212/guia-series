import jwt from "jsonwebtoken";
import type { APIContext } from "astro";

const JWT_SECRET = "your-jwt-secret-key"; // En producción, usar variable de entorno

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
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);

  const token = cookies["auth-token"];

  if (!token) {
    return null;
  }

  return verifyToken(token);
}
