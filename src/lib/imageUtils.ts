import type { SyntheticEvent } from "react";

// Utility para manejar errores de carga de imágenes
export function handleImageError(
  event: SyntheticEvent<HTMLImageElement, Event>
) {
  const img = event.target as HTMLImageElement;
  if (img) {
    // Ocultar la imagen que falló
    img.style.display = "none";

    // Mostrar el fallback si existe
    const fallback = img.nextElementSibling as HTMLElement;
    if (fallback) {
      fallback.style.display = "flex";
    }
  }
}

// Función para verificar si una URL de imagen es válida
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    // Verificar que no sea una URL de placeholder problemática
    if (
      urlObj.hostname.includes("placeholder.com") ||
      urlObj.hostname.includes("via.placeholder.com")
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Función para obtener URL de avatar segura
export function getSafeAvatarUrl(avatar?: string): string | null {
  if (!avatar || !isValidImageUrl(avatar)) {
    return null;
  }
  return avatar;
}
