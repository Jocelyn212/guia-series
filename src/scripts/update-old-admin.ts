import { getUserByCredentials, updateUserPassword } from "../lib/mongo";
import crypto from "node:crypto";

// Función para hashear contraseñas
function hashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + "salt-series-guide")
    .digest("hex");
}

async function updateOldAdminPassword() {
  try {
    console.log("Buscando usuario admin antiguo...");

    // Buscar el usuario admin antiguo
    const oldAdmin = await getUserByCredentials("admin");

    if (!oldAdmin) {
      console.log("❌ Usuario 'admin' no encontrado");
      return;
    }

    console.log("✅ Usuario 'admin' encontrado");
    console.log("ID:", oldAdmin._id);
    console.log("Username:", oldAdmin.username);
    console.log("Email:", oldAdmin.email);
    console.log("Role:", oldAdmin.role);
    console.log("Contraseña actual:", oldAdmin.password);

    // Hashear la contraseña antigua
    const hashedPassword = hashPassword("admin123");
    console.log("Nueva contraseña hasheada:", hashedPassword);

    // Actualizar la contraseña en la base de datos
    const updated = await updateUserPassword(
      (oldAdmin._id as any).toString(),
      hashedPassword
    );

    if (updated) {
      console.log("✅ Contraseña actualizada exitosamente");
      console.log(
        "� El usuario 'admin' ahora puede usar 'admin123' como contraseña"
      );
    } else {
      console.log("❌ Error al actualizar la contraseña");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  updateOldAdminPassword();
}

export { updateOldAdminPassword };
