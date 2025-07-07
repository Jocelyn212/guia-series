import { connectMongoDB } from "../lib/mongo";
import mongoose from "mongoose";

async function searchSeriesAdminWithMongoose() {
    try {
        console.log('🔍 Iniciando búsqueda del usuario "seriesadmin" con Mongoose...\n');
        
        // Conectar usando la función del proyecto
        await connectMongoDB();
        console.log('✅ Conectado a MongoDB usando Mongoose');
        
        // Obtener el modelo User del proyecto
        const User = mongoose.models.User;
        if (!User) {
            console.error("❌ Modelo User no encontrado");
            return;
        }
        
        console.log('\n🔍 Buscando usuario "seriesadmin"...\n');
        
        // Buscar específicamente "seriesadmin" con type casting
        const seriesAdmin = await User.findOne({ username: 'seriesadmin' }).lean() as any;
        
        if (seriesAdmin) {
            console.log('✅ Usuario "seriesadmin" encontrado:');
            console.log('=======================================');
            console.log('ID:', seriesAdmin._id);
            console.log('Username:', seriesAdmin.username);
            console.log('Email:', seriesAdmin.email || 'No definido');
            console.log('Role:', seriesAdmin.role || 'No definido');
            console.log('IsActive:', seriesAdmin.isActive !== undefined ? seriesAdmin.isActive : 'No definido');
            console.log('Password Hash:', seriesAdmin.password ? seriesAdmin.password.substring(0, 30) + '...' : 'No definido');
            console.log('Longitud Hash:', seriesAdmin.password ? seriesAdmin.password.length : 0);
            console.log('Creado:', seriesAdmin.createdAt || 'No definido');
            console.log('Actualizado:', seriesAdmin.updatedAt || 'No definido');
            console.log('Último Login:', seriesAdmin.lastLogin || 'No definido');
            console.log('Favoritos:', seriesAdmin.favoritesSeries ? seriesAdmin.favoritesSeries.length : 0);
            console.log('Watchlist:', seriesAdmin.watchlistSeries ? seriesAdmin.watchlistSeries.length : 0);
            console.log('Series Vistas:', seriesAdmin.watchedSeries ? seriesAdmin.watchedSeries.length : 0);
            
        } else {
            console.log('❌ Usuario "seriesadmin" NO encontrado');
            
            // Buscar usuarios similares
            console.log('\n🔍 Buscando usuarios similares...');
            const similarUsers = await User.find({
                $or: [
                    { username: { $regex: 'admin', $options: 'i' } },
                    { username: { $regex: 'series', $options: 'i' } },
                    { role: 'admin' }
                ]
            }).lean() as any[];
            
            if (similarUsers && similarUsers.length > 0) {
                console.log(`✅ Encontrados ${similarUsers.length} usuarios similares:`);
                similarUsers.forEach((user: any, index: number) => {
                    console.log(`\n${index + 1}. Usuario:`);
                    console.log(`   ID: ${user._id}`);
                    console.log(`   Username: ${user.username}`);
                    console.log(`   Email: ${user.email || 'No definido'}`);
                    console.log(`   Role: ${user.role || 'No definido'}`);
                    console.log(`   IsActive: ${user.isActive !== undefined ? user.isActive : 'No definido'}`);
                });
            } else {
                console.log('❌ No se encontraron usuarios similares');
            }
        }
        
        // Mostrar estadísticas generales
        const totalUsers = await User.countDocuments();
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const activeUsers = await User.countDocuments({ isActive: true });
        
        console.log('\n📊 Estadísticas de usuarios:');
        console.log(`   Total usuarios: ${totalUsers}`);
        console.log(`   Usuarios admin: ${adminUsers}`);
        console.log(`   Usuarios activos: ${activeUsers}`);
        
        // Mostrar algunos usuarios para referencia
        console.log('\n👥 Primeros 5 usuarios en la base de datos:');
        const sampleUsers = await User.find({}).limit(5).lean() as any[];
        sampleUsers.forEach((user: any, index: number) => {
            console.log(`${index + 1}. ${user.username} (${user.role}) - ${user.email}`);
        });
        
    } catch (error) {
        console.error('❌ Error al buscar usuario:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexión cerrada');
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    searchSeriesAdminWithMongoose();
}

export { searchSeriesAdminWithMongoose };
