require('dotenv').config();
const mongoose = require('mongoose');

// Configurar las series que tienen contenido LGBTIQ+
// Lista de slugs de series con contenido LGBTIQ+ destacado
const lgbtqSeries = [
  'heartstopper',
  'orange-is-the-new-black', 
  'pose',
  'the-l-word',
  'queer-as-folk',
  'euphoria',
  'sex-education',
  'tales-of-the-city',
  'sense8',
  'the-umbrella-academy', // Klaus es LGTBI+
  'elite', // Varios personajes LGTBI+
  'young-royals',
  'i-am-not-okay-with-this',
  'special',
  'genera+ion',
  'it-s-a-sin',
  'hacks', // Personajes LGTBI+
  'the-boys-in-the-band',
  'love-victor',
  'one-day-at-a-time',
  'schitts-creek',
  'brooklyn-nine-nine', // Holt y Kevin
  'glee',
  'modern-family', // Mitchell y Cameron
  'american-horror-story', // Múltiples personajes LGTBI+
  'drag-race', // Si existe
  'rupauls-drag-race'
];

async function addLgbtqField() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Conectado a MongoDB');

        // Primero, agregar el campo lgbtqContent a todas las series con valor false por defecto
        const updateAllResult = await mongoose.connection.db.collection('series').updateMany(
            { lgbtqContent: { $exists: false } },
            { $set: { lgbtqContent: false } }
        );

        console.log(`✅ ${updateAllResult.matchedCount} series encontradas`);
        console.log(`✅ ${updateAllResult.modifiedCount} series actualizadas con lgbtqContent: false`);

        // Luego, marcar como true las series con contenido LGTBI+
        const updateLgbtqResult = await mongoose.connection.db.collection('series').updateMany(
            { slug: { $in: lgbtqSeries } },
            { $set: { lgbtqContent: true } }
        );

        console.log(`🏳️‍🌈 ${updateLgbtqResult.matchedCount} series LGBTIQ+ encontradas`);
        console.log(`🏳️‍🌈 ${updateLgbtqResult.modifiedCount} series marcadas como LGBTIQ+`);

        // Verificar algunas series
        const allSeries = await mongoose.connection.db.collection('series').find({}).limit(10).toArray();
        console.log('\n🔍 Series verificadas:');
        allSeries.forEach(serie => {
            const lgbtqStatus = serie.lgbtqContent ? '🏳️‍🌈 SÍ' : '❌ NO';
            console.log(`- ${serie.title}: LGBTIQ+ ${lgbtqStatus}`);
        });

        // Mostrar estadísticas
        const totalSeries = await mongoose.connection.db.collection('series').countDocuments();
        const lgbtqSeriesCount = await mongoose.connection.db.collection('series').countDocuments({ lgbtqContent: true });
        
        console.log('\n📊 Estadísticas:');
        console.log(`- Total de series: ${totalSeries}`);
        console.log(`- Series LGBTIQ+: ${lgbtqSeriesCount}`);
        console.log(`- Porcentaje LGBTIQ+: ${((lgbtqSeriesCount / totalSeries) * 100).toFixed(1)}%`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔚 Conexión cerrada');
    }
}

// Ejecutar la migración
console.log('🚀 Iniciando migración para agregar campo LGBTIQ+...\n');
addLgbtqField();
