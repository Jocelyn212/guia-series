import 'dotenv/config';
import mongoose from 'mongoose';

// Configurar las series que tienen contenido LGBTIQ+
// Enfoque híbrido: campo lgbtqContent + géneros específicos
// Esto permite escalabilidad para subtipos específicos en el futuro

const lgbtqSeriesConfig = [
  // Series con contenido LGBTIQ+ general
  { slug: 'heartstopper', genres: ['LGBTIQ+'] },
  { slug: 'orange-is-the-new-black', genres: ['LGBTIQ+'] },
  { slug: 'pose', genres: ['LGBTIQ+ Trans'] },
  { slug: 'the-l-word', genres: ['LGBTIQ+ Lésbico'] },
  { slug: 'queer-as-folk', genres: ['LGBTIQ+ Gay'] },
  { slug: 'euphoria', genres: ['LGBTIQ+'] },
  { slug: 'sex-education', genres: ['LGBTIQ+'] },
  { slug: 'tales-of-the-city', genres: ['LGBTIQ+'] },
  { slug: 'sense8', genres: ['LGBTIQ+'] },
  { slug: 'the-umbrella-academy', genres: ['LGBTIQ+'] }, // Klaus
  { slug: 'elite', genres: ['LGBTIQ+'] }, // Varios personajes
  { slug: 'young-royals', genres: ['LGBTIQ+ Gay'] },
  { slug: 'i-am-not-okay-with-this', genres: ['LGBTIQ+'] },
  { slug: 'special', genres: ['LGBTIQ+ Gay'] },
  { slug: 'genera+ion', genres: ['LGBTIQ+'] },
  { slug: 'it-s-a-sin', genres: ['LGBTIQ+ Gay'] },
  { slug: 'hacks', genres: ['LGBTIQ+'] },
  { slug: 'the-boys-in-the-band', genres: ['LGBTIQ+ Gay'] },
  { slug: 'love-victor', genres: ['LGBTIQ+ Gay'] },
  { slug: 'one-day-at-a-time', genres: ['LGBTIQ+'] },
  { slug: 'schitts-creek', genres: ['LGBTIQ+'] },
  { slug: 'brooklyn-nine-nine', genres: ['LGBTIQ+ Gay'] }, // Holt y Kevin
  { slug: 'glee', genres: ['LGBTIQ+'] },
  { slug: 'modern-family', genres: ['LGBTIQ+ Gay'] }, // Mitchell y Cameron
  { slug: 'american-horror-story', genres: ['LGBTIQ+'] },
  { slug: 'drag-race', genres: ['LGBTIQ+ Drag'] },
  { slug: 'rupauls-drag-race', genres: ['LGBTIQ+ Drag'] }
];

// Lista simple para compatibilidad con el campo lgbtqContent
const lgbtqSeries = lgbtqSeriesConfig.map(config => config.slug);

async function addLgbtqHybridField() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Conectado a MongoDB');

        // Paso 1: Agregar el campo lgbtqContent a todas las series con valor false por defecto
        const updateAllResult = await mongoose.connection.db.collection('series').updateMany(
            { lgbtqContent: { $exists: false } },
            { $set: { lgbtqContent: false } }
        );

        console.log(`✅ ${updateAllResult.matchedCount} series encontradas`);
        console.log(`✅ ${updateAllResult.modifiedCount} series actualizadas con lgbtqContent: false`);

        // Paso 2: Marcar como true las series con contenido LGBTIQ+ (compatibilidad)
        const updateLgbtqResult = await mongoose.connection.db.collection('series').updateMany(
            { slug: { $in: lgbtqSeries } },
            { $set: { lgbtqContent: true } }
        );

        console.log(`🏳️‍🌈 ${updateLgbtqResult.matchedCount} series LGBTIQ+ encontradas`);
        console.log(`🏳️‍🌈 ${updateLgbtqResult.modifiedCount} series marcadas como LGBTIQ+`);

        // Paso 3: ENFOQUE HÍBRIDO - Agregar géneros LGBTIQ+ específicos
        let genresUpdated = 0;
        for (const config of lgbtqSeriesConfig) {
            const serie = await mongoose.connection.db.collection('series').findOne({ slug: config.slug });
            
            if (serie) {
                // Agregar los géneros LGBTIQ+ a los géneros existentes (sin duplicar)
                const currentGenres = serie.genre || [];
                const newGenres = [...new Set([...currentGenres, ...config.genres])];
                
                if (newGenres.length > currentGenres.length) {
                    await mongoose.connection.db.collection('series').updateOne(
                        { slug: config.slug },
                        { $set: { genre: newGenres } }
                    );
                    
                    console.log(`🏷️  ${serie.title}: Agregados géneros ${config.genres.join(', ')}`);
                    genresUpdated++;
                }
            }
        }

        console.log(`\n🏷️  ${genresUpdated} series actualizadas con géneros LGBTIQ+ específicos`);

        // Verificación y estadísticas
        const allSeries = await mongoose.connection.db.collection('series').find({}).limit(10).toArray();
        console.log('\n🔍 Series verificadas:');
        allSeries.forEach(serie => {
            const lgbtqStatus = serie.lgbtqContent ? '🏳️‍🌈 Campo SÍ' : '❌ Campo NO';
            const hasLgbtqGenre = serie.genre && serie.genre.some(g => g.toLowerCase().includes('lgbtiq')) ? '🏷️ Género SÍ' : '🏷️ Género NO';
            console.log(`- ${serie.title}: ${lgbtqStatus} | ${hasLgbtqGenre}`);
        });

        // Estadísticas finales
        const totalSeries = await mongoose.connection.db.collection('series').countDocuments();
        const lgbtqFieldCount = await mongoose.connection.db.collection('series').countDocuments({ lgbtqContent: true });
        const lgbtqGenreCount = await mongoose.connection.db.collection('series').countDocuments({ 
            genre: { $regex: /lgbtiq/i } 
        });
        
        // Total híbrido (campo OR género)
        const lgbtqHybridCount = await mongoose.connection.db.collection('series').countDocuments({
            $or: [
                { lgbtqContent: true },
                { genre: { $regex: /lgbtiq/i } }
            ]
        });
        
        console.log('\n📊 Estadísticas LGBTIQ+:');
        console.log(`- Total de series: ${totalSeries}`);
        console.log(`- Series con campo lgbtqContent: ${lgbtqFieldCount}`);
        console.log(`- Series con género LGBTIQ+: ${lgbtqGenreCount}`);
        console.log(`- Total LGBTIQ+ (híbrido): ${lgbtqHybridCount}`);
        console.log(`- Porcentaje LGBTIQ+: ${((lgbtqHybridCount / totalSeries) * 100).toFixed(1)}%`);

        console.log('\n✨ Enfoque híbrido implementado:');
        console.log('- Campo lgbtqContent para compatibilidad');
        console.log('- Géneros específicos para escalabilidad');
        console.log('- Filtro captura ambos automáticamente');
        console.log('- Futuro: Subtipos como "LGBTIQ+ Trans", "LGBTIQ+ Lésbico", etc.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔚 Conexión cerrada');
    }
}

// Ejecutar la migración híbrida
console.log('🚀 Iniciando migración híbrida LGBTIQ+...\n');
addLgbtqHybridField();
