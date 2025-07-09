// Funciones de seguridad para páginas de administración
import { getServerAuthUser } from "./auth";
import { getPublicAuthUser } from "./publicAuth";

export function protectAdminPage(request: Request) {
  // Verificar autenticación de administrador
  const adminUser = getServerAuthUser(request);

  if (!adminUser || adminUser.role !== "admin") {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/login",
      },
    });
  }

  return adminUser;
}

// Función para verificar si una ruta es del admin
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname === "/login";
}

// Headers de seguridad para páginas admin
export const ADMIN_SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};
