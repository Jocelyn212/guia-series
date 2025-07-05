import { connectMongoDB } from "../lib/mongo";
import mongoose from "mongoose";
import { hashPassword } from "../lib/password";

async function fixSeriesAdminPassword() {
  try {
    await connectMongoDB();

    // Buscar el usuario seriesadmin
    const User = mongoose.models.User;
    if (!User) {
      console.error("❌ Modelo User no encontrado");
      return;
    }

    const adminUser = await User.findOne({ username: "seriesadmin" });

    if (!adminUser) {
      console.log("❌ Usuario 'seriesadmin' no encontrado en la base de datos");
      return;
    }

    console.log("✅ Usuario 'seriesadmin' encontrado");
    console.log("ID:", adminUser._id);
    console.log("Role:", adminUser.role);

    // Actualizar la contraseña con bcrypt
    const newPasswordHash = await hashPassword("0v6nK2e2131eUH+C1ZUnFw==");

    await User.findByIdAndUpdate(adminUser._id, {
      password: newPasswordHash,
      updatedAt: new Date(),
    });

    console.log(
      "✅ Contraseña del usuario 'seriesadmin' actualizada correctamente con bcrypt"
    );
    console.log("📋 Ahora puedes usar:");
    console.log("   Username: seriesadmin");
    console.log("   Password: 0v6nK2e2131eUH+C1ZUnFw==");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  fixSeriesAdminPassword();
}

export { fixSeriesAdminPassword };
