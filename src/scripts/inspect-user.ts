import { connectMongoDB } from "../lib/mongo";
import mongoose from "mongoose";
import { verifyPassword } from "../lib/password";
import crypto from "node:crypto";

// Función antigua para verificar
function verifyOldPassword(password: string, hash: string): boolean {
  const oldHash = crypto
    .createHash("sha256")
    .update(password + "salt-series-guide")
    .digest("hex");
  return oldHash === hash;
}

async function inspectUser() {
  try {
    await connectMongoDB();

    const User = mongoose.models.User;
    if (!User) {
      console.error("❌ Modelo User no encontrado");
      return;
    }

    // Buscar cualquier usuario con role "user"
    const user = await User.findOne({ role: "user" });

    if (!user) {
      console.log("❌ No hay usuarios comunes en la base de datos");
      return;
    }

    console.log("✅ Usuario común encontrado:");
    console.log("Username:", user.username);
    console.log("Email:", user.email);
    console.log("Hash almacenado:", user.password);
    console.log("Longitud del hash:", user.password.length);

    // Probar con una contraseña de ejemplo
    const testPassword = "123456"; // Cambia esto por una contraseña que sepas que funciona

    console.log("\n🔍 Probando verificaciones:");

    // Probar con bcrypt
    try {
      const bcryptResult = await verifyPassword(testPassword, user.password);
      console.log("Bcrypt result:", bcryptResult);
    } catch (error) {
      console.log("Bcrypt error:", (error as Error).message);
    }

    // Probar con método antiguo
    const oldResult = verifyOldPassword(testPassword, user.password);
    console.log("Old method result:", oldResult);

    // Determinar qué método se está usando
    if (user.password.startsWith("$2b$") || user.password.startsWith("$2a$")) {
      console.log("🔐 Este usuario usa BCRYPT");
    } else if (user.password.length === 64) {
      console.log("🔑 Este usuario usa HASH ANTIGUO (crypto + salt)");
    } else {
      console.log("❓ Formato de hash desconocido");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  inspectUser();
}

export { inspectUser };
