import 'dotenv/config';
import mongoose from 'mongoose';

// Series LGBTIQ+ de demostración para probar el filtro híbrido
const lgbtqDemoSeries = [
  {
    title: 'Heartstopper',
    slug: 'heartstopper',
    genre: ['Drama', 'Romance', 'LGBTIQ+'],
    lgbtqContent: true,
    description: 'La historia de Charlie y Nick, dos estudiantes que se enamoran.',
    platforms: [{ name: 'Netflix', url: 'https://netflix.com' }],
    year: 2022,
    creator: 'Alice Oseman',
    imdbRating: 8.5,
    status: 'ongoing',
    seasons: 3,
    episodes: 24,
    image: 'https://example.com/heartstopper.jpg'
  },
  {
    title: 'Orange Is the New Black',
    slug: 'orange-is-the-new-black',
    genre: ['Drama', 'Comedia', 'LGBTIQ+ Lésbico'],
    lgbtqContent: true,
    description: 'La vida de las reclusas en una prisión federal femenina.',
    platforms: [{ name: 'Netflix', url: 'https://netflix.com' }],
    year: 2013,
    creator: 'Jenji Kohan',
    imdbRating: 8.1,
    status: 'ended',
    seasons: 7,
    episodes: 91,
    image: 'https://example.com/oitnb.jpg'
  },
  {
    title: 'Pose',
    slug: 'pose',
    genre: ['Drama', 'Musical', 'LGBTIQ+ Trans'],
    lgbtqContent: true,
    description: 'La escena ballroom de Nueva York en los años 80 y 90.',
    platforms: [{ name: 'Amazon Prime', url: 'https://primevideo.com' }],
    year: 2018,
    creator: 'Ryan Murphy',
    imdbRating: 8.6,
    status: 'ended',
    seasons: 3,
    episodes: 26,
    image: 'https://example.com/pose.jpg'
  }
];

async function addLgbtqDemoSeries() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Conectado a MongoDB');

        // Agregar series de demostración si no existen
        for (const serie of lgbtqDemoSeries) {
            const existing = await mongoose.connection.db.collection('series').findOne({ slug: serie.slug });
            
            if (!existing) {
                await mongoose.connection.db.collection('series').insertOne(serie);
                console.log(`✅ Serie agregada: ${serie.title} (${serie.genre.join(', ')})`);
            } else {
                // Actualizar serie existente para agregar contenido LGBTIQ+
                await mongoose.connection.db.collection('series').updateOne(
                    { slug: serie.slug },
                    { 
                        $set: { 
                            lgbtqContent: true,
                            genre: serie.genre
                        }
                    }
                );
                console.log(`🔄 Serie actualizada: ${existing.title} → LGBTIQ+`);
            }
        }

        // Verificar estadísticas
        const totalLgbtq = await mongoose.connection.db.collection('series').countDocuments({
            $or: [
                { lgbtqContent: true },
                { genre: { $regex: /lgbtiq/i } }
            ]
        });

        const totalSeries = await mongoose.connection.db.collection('series').countDocuments();
        
        console.log('\n📊 Estadísticas actualizadas:');
        console.log(`- Total series LGBTIQ+: ${totalLgbtq}`);
        console.log(`- Total series: ${totalSeries}`);
        console.log(`- Porcentaje LGBTIQ+: ${((totalLgbtq / totalSeries) * 100).toFixed(1)}%`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔚 Conexión cerrada');
    }
}

console.log('🏳️‍🌈 Agregando series LGBTIQ+ de demostración...\n');
addLgbtqDemoSeries();
