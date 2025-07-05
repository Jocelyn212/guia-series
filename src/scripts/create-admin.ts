/* import { createUser } from "../lib/mongo";
import { hashPassword } from "../lib/password";

async function createAdminUser() {
  try {
    // Credenciales fijas para el admin inicial
    const adminUsername = "seriesadmin";
    const adminPassword = "0v6nK2e2131eUH+C1ZUnFw==";

    console.log("Creando usuario administrador...");
    console.log("Username:", adminUsername);

    // Hashear contraseña con bcrypt
    const hashedPassword = await hashPassword(adminPassword);

    const adminUser = {
      username: adminUsername,
      email: `${adminUsername}@seriesguide.com`,
      password: hashedPassword,
      role: "admin" as const,
      isActive: true,
      favoritesSeries: [],
      watchedSeries: [],
      likedAnalysis: [],
    };

    const result = await createUser(adminUser);

    if (result) {
      console.log("✅ Usuario administrador creado exitosamente");
      console.log("ID:", result._id);
      console.log("Username:", result.username);
      console.log("Email:", result.email);
      console.log("Role:", result.role);
      console.log("📋 Credenciales de login:");
      console.log("   Username:", adminUsername);
      console.log("   Password:", adminPassword);
    } else {
      console.log("❌ Error al crear el usuario administrador");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createAdminUser();
}

export { createAdminUser };
 */