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

async function checkAdmin() {
  try {
    await connectMongoDB();

    const User = mongoose.models.User;
    if (!User) {
      console.error("❌ Modelo User no encontrado");
      return;
    }

    // Buscar usuario admin
    const admin = await User.findOne({ role: "admin" });

    if (!admin) {
      console.log("❌ No hay usuario admin en la base de datos");
      
      // Buscar por username "admin" sin importar el role
      const userByName = await User.findOne({ username: "admin" });
      if (userByName) {
        console.log("❓ Usuario 'admin' encontrado con role:", userByName.role);
        console.log("   Username:", userByName.username);
        console.log("   Email:", userByName.email);
        console.log("   IsActive:", userByName.isActive);
      } else {
        console.log("❌ No hay usuario con username 'admin'");
      }
      return;
    }

    console.log("✅ Usuario admin encontrado:");
    console.log("Username:", admin.username);
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("IsActive:", admin.isActive);
    console.log("Hash almacenado:", admin.password);
    console.log("Longitud del hash:", admin.password.length);

    // Probar con contraseñas comunes
    const testPasswords = ["admin", "123456", "password", "seriesguide", "admin123", "0v6nK2e2131eUH+C1ZUnFw=="];

    console.log("\n🔍 Probando contraseñas:");

    for (const testPassword of testPasswords) {
      console.log(`\nProbando: "${testPassword}"`);
      
      // Probar con bcrypt
      try {
        const bcryptResult = await verifyPassword(testPassword, admin.password);
        console.log("  Bcrypt result:", bcryptResult);
        if (bcryptResult) {
          console.log(`  ✅ CONTRASEÑA ENCONTRADA: "${testPassword}"`);
          break;
        }
      } catch (error) {
        console.log("  Bcrypt error:", (error as Error).message);
      }

      // Probar con método antiguo
      const oldResult = verifyOldPassword(testPassword, admin.password);
      console.log("  Old method result:", oldResult);
      if (oldResult) {
        console.log(`  ✅ CONTRASEÑA ENCONTRADA (método antiguo): "${testPassword}"`);
        break;
      }
    }

    // Determinar qué método se está usando
    if (admin.password.startsWith("$2b$") || admin.password.startsWith("$2a$")) {
      console.log("\n🔐 Este admin usa BCRYPT");
    } else if (admin.password.length === 64) {
      console.log("\n🔑 Este admin usa HASH ANTIGUO (crypto + salt)");
    } else {
      console.log("\n❓ Formato de hash desconocido");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  checkAdmin();
}

export { checkAdmin };
