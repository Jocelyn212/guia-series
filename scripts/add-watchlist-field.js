import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function addWatchlistField() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Conectado a MongoDB');

        // Actualizar todos los usuarios que no tengan el campo watchlistSeries
        const result = await mongoose.connection.db.collection('users').updateMany(
            { watchlistSeries: { $exists: false } },
            { $set: { watchlistSeries: [] } }
        );

        console.log(`✅ ${result.matchedCount} usuarios encontrados`);
        console.log(`✅ ${result.modifiedCount} usuarios actualizados con watchlistSeries`);

        // Verificar algunos usuarios
        const users = await mongoose.connection.db.collection('users').find({}).limit(3).toArray();
        console.log('\n🔍 Usuarios verificados:');
        users.forEach(user => {
            console.log(`- ${user.username}: favoritesSeries=${user.favoritesSeries?.length || 0}, watchlistSeries=${user.watchlistSeries?.length || 0}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

addWatchlistField();
