/* import { connectMongoDB } from "../lib/mongo";
import mongoose from "mongoose";
import { hashPassword } from "../lib/password";

async function fixAdminPassword() {
  try {
    await connectMongoDB();

    // Buscar el usuario admin antiguo
    const User = mongoose.models.User;
    if (!User) {
      console.error("❌ Modelo User no encontrado");
      return;
    }

    const adminUser = await User.findOne({ username: "admin" });

    if (!adminUser) {
      console.log("❌ Usuario 'admin' no encontrado en la base de datos");
      return;
    }

    console.log("✅ Usuario 'admin' encontrado");
    console.log("ID:", adminUser._id);
    console.log("Role:", adminUser.role);

    // Actualizar la contraseña con bcrypt
    const newPasswordHash = await hashPassword("admin123");

    await User.findByIdAndUpdate(adminUser._id, {
      password: newPasswordHash,
      updatedAt: new Date(),
    });

    console.log(
      "✅ Contraseña del usuario 'admin' actualizada correctamente con bcrypt"
    );
    console.log("📋 Ahora puedes usar:");
    console.log("   Username: admin");
    console.log("   Password: admin123");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  fixAdminPassword();
}

export { fixAdminPassword }; */
