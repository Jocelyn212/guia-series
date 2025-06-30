# 📺 Guía de Series - SeriesGuide

Una aplicación web moderna para explorar series de televisión, leer análisis detallados y mantenerse al día con las mejores producciones. Construida con **Astro**, **React**, **TypeScript**, **Tailwind CSS** y **MongoDB Atlas**.

## ✨ Características

- **🎬 Catálogo de Series**: Explora una colección curada de las mejores series de televisión
- **📝 Análisis Detallados**: Lee análisis profundos de episodios y temporadas
- **🔍 Búsqueda Avanzada**: Encuentra series por título, género, red o descripción
- **📊 Estadísticas**: Visualiza estadísticas de la colección de series
- **📱 Diseño Responsivo**: Experiencia optimizada para todos los dispositivos
- **⚡ Rendimiento Optimizado**: Carga rápida con Astro y SSR

## 🛠️ Tecnologías

- **Frontend**: [Astro](https://astro.build/) + [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Base de Datos**: [MongoDB Atlas](https://www.mongodb.com/atlas)
- **ODM**: [Mongoose](https://mongoosejs.com/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Deployment**: Configurado para [Vercel](https://vercel.com/), [Netlify](https://netlify.com/) y otros

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- pnpm (recomendado) o npm
- Una cuenta de MongoDB Atlas

### Instalación

1. **Clona el repositorio**

   ```bash
   git clone <tu-repo-url>
   cd guia-series
   ```

2. **Instala las dependencias**

   ```bash
   pnpm install
   ```

3. **Configura las variables de entorno**

   Crea un archivo `.env` en la raíz del proyecto:

   ```env
   # MongoDB Atlas Connection String
   MONGODB_URI=mongodb+srv://tu-usuario:tu-password@cluster.mongodb.net/seriesAnalysisDB?retryWrites=true&w=majority

   # JWT Secret para autenticación
   JWT_SECRET=tu-secreto-jwt-super-seguro

   # Configuración de admin (opcional)
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=tu-password-admin
   ```

4. **Ejecuta el servidor de desarrollo**

   ```bash
   pnpm dev
   ```

5. **Abre tu navegador**

   Visita `http://localhost:4323`

## 🧞 Comandos

| Comando                | Acción                                               |
| :--------------------- | :--------------------------------------------------- |
| `pnpm install`         | Instala las dependencias                             |
| `pnpm dev`             | Inicia el servidor de desarrollo en `localhost:4323` |
| `pnpm build`           | Construye el sitio para producción en `./dist/`      |
| `pnpm preview`         | Vista previa del build localmente antes de desplegar |
| `pnpm astro ...`       | Ejecuta comandos CLI como `astro add`, `astro check` |
| `pnpm astro -- --help` | Obtén ayuda usando el CLI de Astro                   |

## � Estructura del Proyecto

```
src/
├── components/          # Componentes React reutilizables
│   ├── SeriesGrid.tsx   # Grid de series con filtros
│   ├── SerieCard.tsx    # Tarjeta individual de serie
│   ├── FringeCard.tsx   # Tarjeta de análisis
│   └── ...
├── lib/
│   └── mongo.ts         # Configuración y funciones de MongoDB
├── pages/               # Páginas de Astro
│   ├── index.astro      # Página principal
│   ├── series.astro     # Catálogo de series
│   ├── analisis.astro   # Página de análisis
│   ├── series/
│   │   └── [slug].astro # Páginas dinámicas de series
│   └── api/             # API endpoints
├── styles/
│   └── global.css       # Estilos globales
└── ...
```

## 👀 ¿Quieres saber más?

Echa un vistazo a [nuestra documentación](https://docs.astro.build) o únete a nuestro [servidor de Discord](https://astro.build/chat).

---

⭐ ¡Si te gusta este proyecto, dale una estrella en GitHub!
