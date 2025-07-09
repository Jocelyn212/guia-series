import { connectMongoDB } from "./src/lib/mongo.ts";
import mongoose from "mongoose";

async function checkAdminUser() {
    try {
        console.log('🔍 Verificando usuarios administrativos...\n');

        // Conectar usando la función del proyecto
        await connectMongoDB();
        console.log('✅ Conectado a MongoDB');

        // Obtener el modelo User del proyecto
        const User = mongoose.models.User;
        if (!User) {
            console.error("❌ Modelo User no encontrado");
            return;
        }

        // Contar usuarios admin
        const totalUsers = await User.countDocuments();
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const activeAdminUsers = await User.countDocuments({
            role: 'admin',
            isActive: true
        });

        console.log('📊 Estadísticas de usuarios:');
        console.log(`   Total usuarios: ${totalUsers}`);
        console.log(`   Usuarios admin: ${adminUsers}`);
        console.log(`   Usuarios admin activos: ${activeAdminUsers}`);

        if (activeAdminUsers === 0) {
            console.log('\n❌ No hay usuarios administradores activos');
            console.log('💡 Necesitas crear un usuario administrador para acceder al panel');
        } else {
            console.log('\n✅ Hay usuarios administradores disponibles');

            // Mostrar solo usernames de admins activos (sin información sensible)
            const activeAdmins = await User.find({
                role: 'admin',
                isActive: true
            }).select('username email').lean();

            console.log('\n👑 Usuarios administradores activos:');
            activeAdmins.forEach((admin, index) => {
                console.log(`   ${index + 1}. ${admin.username} (${admin.email || 'sin email'})`);
            });
        }

    } catch (error) {
        console.error('❌ Error al verificar usuarios:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexión cerrada');
    }
}

// Ejecutar la verificación
checkAdminUser().catch(console.error);
