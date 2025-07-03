// Autenticación para usuarios públicos (NO ADMIN)
import jwt from "jsonwebtoken";
import { getUserByEmail } from "./mongo";

const JWT_SECRET =
  typeof process !== "undefined" && process.env
    ? process.env.JWT_SECRET
    : import.meta.env.JWT_SECRET ||
      "mi-super-secreto-jwt-para-desarrollo-cambiar-en-produccion";

export interface PublicUser {
  id: string;
  username: string;
  email: string;
  role: "user"; // Solo usuarios normales, NO admin
}

// Crear token para usuario público
export function createPublicUserToken(user: PublicUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

// Verificar token de usuario público
export function verifyPublicUserToken(token: string): PublicUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as PublicUser;
    // Asegurar que NO sea admin
    if (decoded.role !== "user") {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

// Obtener usuario autenticado desde las cookies (solo usuarios públicos)
export function getPublicAuthUser(request: Request): PublicUser | null {
  try {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return null;

    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((cookie) => {
        const [name, value] = cookie.split("=");
        return [name, decodeURIComponent(value)];
      })
    );

    const token = cookies["public-auth-token"];
    if (!token) return null;

    return verifyPublicUserToken(token);
  } catch (error) {
    return null;
  }
}

// Crear cookie de sesión para usuario público
export function createPublicAuthCookie(user: PublicUser): string {
  const token = createPublicUserToken(user);
  // Quitar HttpOnly temporalmente para debug - lo restauraremos después
  return `public-auth-token=${encodeURIComponent(
    token
  )}; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
}

// Cookie para cerrar sesión
export function clearPublicAuthCookie(): string {
  return `public-auth-token=; Path=/; SameSite=Lax; Max-Age=0`;
}
