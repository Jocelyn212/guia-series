import mongoose, { Document, Schema, Model, Types } from "mongoose";

// Cargar variables de entorno explícitamente
if (typeof process !== "undefined" && !process.env.MONGODB_URI) {
  try {
    const { config } = await import("dotenv");
    config();
  } catch (e) {
    // dotenv no disponible, continuar sin él
  }
}

// Obtener la URI de MongoDB desde las variables de entorno
const MONGODB_URI =
  typeof process !== "undefined" && process.env
    ? process.env.MONGODB_URI
    : import.meta.env.MONGODB_URI;

// Interfaces para la base de datos (tipos limpios)
export interface Platform {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
  logo: string;
  website: string;
  color: string;
}

export interface Serie {
  _id?: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  genre: string[];
  network: string;
  startYear: number;
  endYear?: number;
  totalSeasons: number;
  totalEpisodes: number;
  status: "ongoing" | "ended" | "cancelled";
  imdbId: string;
  imdbRating: number;
  posterUrl?: string;
  backdropUrl?: string;
  platforms: Array<{
    name: string;
    available: boolean;
    isPremium: boolean;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Episode {
  _id?: Types.ObjectId;
  seriesId: Types.ObjectId;
  title: string;
  season: number;
  episode: number;
  airDate: Date;
  description: string;
  createdAt?: Date;
}

export interface Analisis {
  _id?: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  universe?: "blue" | "red";
  tags?: string[];
  serieSlug?: string; // Campo para vincular directamente con series
  author?: {
    name: string;
    avatar?: string;
  };
  status: "draft" | "published";
  readTime?: number;
  views: number;
  likes: number;
  createdAt?: Date;
  updatedAt?: Date;
  publishedAt?: Date;
}

export interface User {
  _id?: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
}

// Configuración de esquemas
const schemaOptions = {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true,
};

const PlatformSchema = new Schema<Platform>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String, required: true },
    website: { type: String, required: true },
    color: { type: String, required: true },
  },
  schemaOptions
);

const SerieSchema = new Schema<Serie>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    genre: [{ type: String, required: true }],
    network: { type: String, required: true },
    startYear: { type: Number, required: true },
    endYear: { type: Number },
    totalSeasons: { type: Number, required: true },
    totalEpisodes: { type: Number, required: true },
    status: {
      type: String,
      enum: ["ongoing", "ended", "cancelled"],
      required: true,
    },
    imdbId: { type: String, required: true },
    imdbRating: { type: Number, required: true },
    posterUrl: { type: String },
    backdropUrl: { type: String },
    platforms: [
      {
        name: { type: String, required: true },
        available: { type: Boolean, required: true },
        isPremium: { type: Boolean, required: true },
      },
    ],
  },
  {
    ...schemaOptions,
    collection: "series",
  }
);

const EpisodeSchema = new Schema<Episode>(
  {
    seriesId: { type: Schema.Types.ObjectId, ref: "Serie", required: true },
    title: { type: String, required: true },
    season: { type: Number, required: true },
    episode: { type: Number, required: true },
    airDate: { type: Date, required: true },
    description: { type: String, required: true },
  },
  schemaOptions
);

const AnalisisSchema = new Schema<Analisis>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String },
    universe: { type: String, enum: ["blue", "red"] },
    tags: [{ type: String }],
    serieSlug: { type: String }, // Campo para vincular con series
    author: {
      name: { type: String },
      avatar: { type: String },
    },
    status: { type: String, enum: ["draft", "published"], required: true },
    readTime: { type: Number },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    publishedAt: { type: Date },
  },
  {
    ...schemaOptions,
    collection: "analysis", // Forzar el nombre de la colección
  }
);

const UserSchema = new Schema<User>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  schemaOptions
);

// Modelos y conexión
let PlatformModel: Model<Platform>;
let SerieModel: Model<Serie>;
let EpisodeModel: Model<Episode>;
let AnalisisModel: Model<Analisis>;
let UserModel: Model<User>;

let isConnected = false;

export async function connectMongoDB() {
  if (isConnected) return;

  if (!MONGODB_URI) {
    console.warn("⚠️ MongoDB URI not configured, using mock data");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);

    // Solo crear modelos si no existen ya
    if (!mongoose.models.Platform) {
      PlatformModel = mongoose.model<Platform>(
        "Platform",
        PlatformSchema,
        "platforms"
      );
    } else {
      PlatformModel = mongoose.models.Platform as Model<Platform>;
    }

    if (!mongoose.models.Serie) {
      SerieModel = mongoose.model<Serie>("Serie", SerieSchema, "series");
    } else {
      SerieModel = mongoose.models.Serie as Model<Serie>;
    }

    if (!mongoose.models.Episode) {
      EpisodeModel = mongoose.model<Episode>(
        "Episode",
        EpisodeSchema,
        "episodes"
      );
    } else {
      EpisodeModel = mongoose.models.Episode as Model<Episode>;
    }

    if (!mongoose.models.Analisis) {
      // Forzar la eliminación del modelo si existe
      if (mongoose.models.Analisis) {
        delete mongoose.models.Analisis;
      }
      AnalisisModel = mongoose.model<Analisis>("Analisis", AnalisisSchema);
    } else {
      // Eliminar el modelo existente y recrearlo con la colección correcta
      delete mongoose.models.Analisis;
      AnalisisModel = mongoose.model<Analisis>("Analisis", AnalisisSchema);
    }

    if (!mongoose.models.User) {
      UserModel = mongoose.model<User>("User", UserSchema, "users");
    } else {
      UserModel = mongoose.models.User as Model<User>;
    }

    isConnected = true;
    console.log("✅ Connected to MongoDB Atlas successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

// Funciones de acceso a datos
// Series
export async function getSeries(): Promise<Serie[]> {
  try {
    await connectMongoDB();
    if (!SerieModel) return [];
    const result = await SerieModel.find()
      .sort({ startYear: -1 })
      .lean()
      .exec();
    return result;
  } catch (error) {
    console.error("Error fetching series:", error);
    return [];
  }
}

export async function getSerieBySlug(slug: string): Promise<Serie | null> {
  try {
    await connectMongoDB();
    if (!SerieModel) return null;
    const result = await SerieModel.findOne({ slug }).lean().exec();
    return result;
  } catch (error) {
    console.error("Error fetching serie:", error);
    return null;
  }
}

export async function getSerieById(id: string): Promise<Serie | null> {
  try {
    await connectMongoDB();
    if (!SerieModel) return null;
    const result = await SerieModel.findById(id).lean().exec();
    return result;
  } catch (error) {
    console.error("Error fetching serie:", error);
    return null;
  }
}

export async function insertSerie(
  serie: Omit<Serie, "_id">
): Promise<string | null> {
  try {
    await connectMongoDB();
    if (!SerieModel) return null;
    const newSerie = await SerieModel.create(serie);
    return (newSerie as any)._id.toString();
  } catch (error) {
    console.error("Error inserting serie:", error);
    return null;
  }
}

export async function updateSerie(
  id: string,
  serie: Partial<Serie>
): Promise<boolean> {
  try {
    await connectMongoDB();
    if (!SerieModel) return false;
    const result = await SerieModel.findByIdAndUpdate(id, serie, {
      new: true,
    }).exec();
    return !!result;
  } catch (error) {
    console.error("Error updating serie:", error);
    return false;
  }
}

export async function deleteSerie(id: string): Promise<boolean> {
  try {
    await connectMongoDB();
    if (!SerieModel) return false;
    const result = await SerieModel.findByIdAndDelete(id).exec();
    return !!result;
  } catch (error) {
    console.error("Error deleting serie:", error);
    return false;
  }
}

// Episodes
export async function getEpisodesBySeries(
  seriesId: string
): Promise<Episode[]> {
  try {
    await connectMongoDB();
    if (!EpisodeModel) return [];
    const result = await EpisodeModel.find({ seriesId }).lean().exec();
    return result;
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return [];
  }
}

// Análisis
export async function getAnalisis(): Promise<Analisis[]> {
  try {
    await connectMongoDB();
    if (!AnalisisModel) return [];
    const result = await AnalisisModel.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .lean()
      .exec();
    return result;
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return [];
  }
}

export async function getAnalisisBySlug(
  slug: string
): Promise<Analisis | null> {
  try {
    await connectMongoDB();
    if (!AnalisisModel) return null;
    const result = await AnalisisModel.findOne({ slug, status: "published" })
      .lean()
      .exec();
    return result;
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return null;
  }
}

export async function insertAnalisis(
  analisis: Omit<Analisis, "_id">
): Promise<string | null> {
  try {
    await connectMongoDB();
    if (!AnalisisModel) return null;
    const newAnalisis = await AnalisisModel.create(analisis);
    return (newAnalisis as any)._id.toString();
  } catch (error) {
    console.error("Error inserting analysis:", error);
    return null;
  }
}

// Función para obtener análisis por serie
export async function getAnalisisBySerie(
  serieSlug: string
): Promise<Analisis[]> {
  try {
    await connectMongoDB();
    if (!AnalisisModel) {
      return [];
    }

    // Crear la consulta de búsqueda más amplia
    const searchQuery = {
      status: "published",
      $or: [
        { serieSlug: serieSlug },
        { tags: { $in: [serieSlug] } },
        { tags: { $regex: serieSlug, $options: "i" } },
        { title: { $regex: serieSlug, $options: "i" } },
        { content: { $regex: serieSlug, $options: "i" } },
      ],
    };

    const result = await AnalisisModel.find(searchQuery)
      .sort({ publishedAt: -1 })
      .lean()
      .exec();

    return result;
  } catch (error) {
    console.error("Error fetching analysis by serie:", error);
    return [];
  }
}

// Búsquedas
export async function searchSeries(query: string): Promise<Serie[]> {
  try {
    await connectMongoDB();
    if (!SerieModel) return [];
    const result = await SerieModel.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .lean()
      .exec();
    return result;
  } catch (error) {
    console.error("Error searching series:", error);
    return [];
  }
}

// Usuarios
export async function createUser(userData: User): Promise<User | null> {
  try {
    await connectMongoDB();
    if (!UserModel) return null;

    const existingUser = await UserModel.findOne({
      $or: [{ username: userData.username }, { email: userData.email }],
    });
    if (existingUser) throw new Error("User already exists");

    const newUser = await UserModel.create(userData);
    return newUser.toObject();
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function getUserByCredentials(
  identifier: string
): Promise<User | null> {
  try {
    await connectMongoDB();
    if (!UserModel) return null;
    const result = await UserModel.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    })
      .lean()
      .exec();
    return result;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

// Funciones adicionales
export async function getPlatforms(): Promise<Platform[]> {
  try {
    await connectMongoDB();
    if (!PlatformModel) return [];
    const result = await PlatformModel.find().lean().exec();
    return result;
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return [];
  }
}

export async function updateLastLogin(userId: string): Promise<boolean> {
  try {
    await connectMongoDB();
    if (!UserModel) return false;
    const result = await UserModel.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() },
      { new: true }
    ).exec();
    return !!result;
  } catch (error) {
    console.error("Error updating last login:", error);
    return false;
  }
}

// Funciones adicionales para completar la funcionalidad
export async function updateAnalisis(
  id: string,
  analisis: Partial<Analisis>
): Promise<boolean> {
  try {
    await connectMongoDB();
    if (!AnalisisModel) return false;
    const result = await AnalisisModel.findByIdAndUpdate(id, analisis, {
      new: true,
    }).exec();
    return !!result;
  } catch (error) {
    console.error("Error updating analysis:", error);
    return false;
  }
}

export async function deleteAnalisis(id: string): Promise<boolean> {
  try {
    await connectMongoDB();
    if (!AnalisisModel) return false;
    const result = await AnalisisModel.findByIdAndDelete(id).exec();
    return !!result;
  } catch (error) {
    console.error("Error deleting analysis:", error);
    return false;
  }
}

export async function getAnalisisById(id: string): Promise<Analisis | null> {
  try {
    await connectMongoDB();
    if (!AnalisisModel) return null;
    const result = await AnalisisModel.findById(id).lean().exec();
    return result;
  } catch (error) {
    console.error("Error fetching analysis by ID:", error);
    return null;
  }
}

export async function searchAnalisis(query: string): Promise<Analisis[]> {
  try {
    await connectMongoDB();
    if (!AnalisisModel) return [];
    const result = await AnalisisModel.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { excerpt: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return result;
  } catch (error) {
    console.error("Error searching analysis:", error);
    return [];
  }
}
