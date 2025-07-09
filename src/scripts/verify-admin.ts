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

async function verifyAdmin() {
  try {
    await connectMongoDB();

    const User = mongoose.models.User;
    if (!User) {
      console.error("❌ Modelo User no encontrado");
      return;
    }

    // Buscar el usuario admin específico
    const admin = await User.findOne({ username: "seriesadmin" });

    if (!admin) {
      console.log("❌ Usuario seriesadmin no encontrado");
      return;
    }

    console.log("✅ Usuario admin encontrado:");
    console.log("Username:", admin.username);
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("Hash almacenado:", admin.password);
    console.log("Longitud del hash:", admin.password.length);

    // La contraseña que proporcionaste
    const adminPassword = "0v6nK2e2131eUH+C1ZUnFw==";

    console.log(
      "\n🔍 Probando verificaciones con la contraseña proporcionada:"
    );

    // Probar con bcrypt
    try {
      const bcryptResult = await verifyPassword(adminPassword, admin.password);
      console.log("Bcrypt result:", bcryptResult);
    } catch (error) {
      console.log("Bcrypt error:", (error as Error).message);
    }

    // Probar con método antiguo
    const oldResult = verifyOldPassword(adminPassword, admin.password);
    console.log("Old method result:", oldResult);

    // Determinar qué método se está usando
    if (
      admin.password.startsWith("$2b$") ||
      admin.password.startsWith("$2a$")
    ) {
      console.log("🔐 Este usuario usa BCRYPT");
    } else if (admin.password.length === 64) {
      console.log("🔑 Este usuario usa HASH ANTIGUO (crypto + salt)");
    } else {
      console.log("❓ Formato de hash desconocido");
    }

    // Generar hash con la contraseña para comparar
    const testHash = crypto
      .createHash("sha256")
      .update(adminPassword + "salt-series-guide")
      .digest("hex");

    console.log("\n🔧 Comparación de hashes:");
    console.log("Hash almacenado:", admin.password);
    console.log("Hash generado:  ", testHash);
    console.log("¿Coinciden?    ", admin.password === testHash);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyAdmin();
}

export { verifyAdmin };
