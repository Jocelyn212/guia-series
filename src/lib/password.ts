import bcrypt from "bcrypt";

// Número de rounds para bcrypt (10 es bueno para producción)
const SALT_ROUNDS = 10;

/**
 * Hashea una contraseña usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifica una contraseña contra su hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Verifica contraseña con migración automática desde método antiguo
 */
export async function verifyPasswordWithMigration(
  password: string,
  hash: string
): Promise<{ isValid: boolean; needsUpdate: boolean; newHash?: string }> {
  // Primero intentar con bcrypt
  try {
    const isValidBcrypt = await bcrypt.compare(password, hash);
    if (isValidBcrypt) {
      return { isValid: true, needsUpdate: false };
    }
  } catch (error) {
    // Si bcrypt falla, puede ser formato antiguo
  }

  // Si bcrypt falla, intentar con método antiguo
  if (hash.length === 64 && !hash.startsWith("$2")) {
    const crypto = await import("node:crypto");
    const oldHash = crypto
      .createHash("sha256")
      .update(password + "salt-series-guide")
      .digest("hex");

    if (oldHash === hash) {
      // Contraseña correcta con método antiguo, generar nuevo hash
      const newHash = await hashPassword(password);
      return { isValid: true, needsUpdate: true, newHash };
    }
  }

  return { isValid: false, needsUpdate: false };
}
