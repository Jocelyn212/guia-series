import bcrypt from "bcrypt";

// Función para hashear contraseñas
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Función para verificar contraseñas
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Función legacy para verificar contraseñas con migración automática
export async function verifyPasswordWithMigration(
  password: string,
  storedPassword: string
): Promise<{
  isValid: boolean;
  needsUpdate: boolean;
  newHash?: string;
}> {
  // Primero intentar verificar con bcrypt (formato actual)
  try {
    const isValidBcrypt = await bcrypt.compare(password, storedPassword);
    if (isValidBcrypt) {
      return { isValid: true, needsUpdate: false };
    }
  } catch (error) {
    // Si falla, puede ser que sea un hash legacy
  }

  // Si no es bcrypt válido, verificar si es un hash legacy (MD5 o similar)
  // Para compatibilidad con contraseñas antiguas
  const crypto = await import("crypto");
  const md5Hash = crypto.createHash("md5").update(password).digest("hex");

  if (md5Hash === storedPassword) {
    // La contraseña es correcta pero está en formato legacy
    // Generar nuevo hash con bcrypt
    const newHash = await hashPassword(password);
    return { isValid: true, needsUpdate: true, newHash };
  }

  // También verificar SHA256 por si acaso
  const sha256Hash = crypto.createHash("sha256").update(password).digest("hex");
  if (sha256Hash === storedPassword) {
    const newHash = await hashPassword(password);
    return { isValid: true, needsUpdate: true, newHash };
  }

  return { isValid: false, needsUpdate: false };
}

// Función para generar contraseñas aleatorias
export function generateRandomPassword(length: number = 12): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Función para validar la fuerza de una contraseña
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("La contraseña debe tener al menos 6 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una mayúscula");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una minúscula");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("La contraseña debe contener al menos un número");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
