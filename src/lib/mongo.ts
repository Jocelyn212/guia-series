import mongoose, { Document, Schema, Model, Types } from "mongoose";

// Cargar variables de entorno explícitamente
if (typeof process !== 'undefined' && !process.env.MONGODB_URI) {
  try {
    const { config } = await import('dotenv');
    config();
  } catch (e) {
    // dotenv no disponible, continuar sin él
  }
}

// 1. Configuración inicial y tipos
// En Astro, las variables del servidor se acceden desde process.env en el servidor
// y desde import.meta.env en el cliente, pero en este caso estamos en servidor
const MONGODB_URI = typeof process !== 'undefined' && process.env 
  ? process.env.MONGODB_URI 
  : import.meta.env.MONGODB_URI;

// Debug de variables de entorno
console.log("🔍 MONGODB_URI:", MONGODB_URI ? "✅ Configurada" : "❌ No encontrada");
if (typeof process !== 'undefined' && process.env) {
  console.log("🔍 process.env.MONGODB_URI:", process.env.MONGODB_URI ? "✅ Disponible" : "❌ No disponible");
} else {
  console.log("🔍 import.meta.env.MONGODB_URI:", import.meta.env.MONGODB_URI ? "✅ Disponible" : "❌ No disponible");
}

// Tipos base (sin Document)
export interface PlatformBase {
  name: string;
  slug: string;
  logo: string;
  website: string;
  color: string;
}

export interface SerieBase {
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
}

export interface EpisodeBase {
  seriesId: Types.ObjectId;
  title: string;
  season: number;
  episode: number;
  airDate: Date;
  description: string;
}

export interface AnalisisBase {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  universe?: "blue" | "red";
  tags?: string[];
  author?: {
    name: string;
    avatar?: string;
  };
  status: "draft" | "published";
  readTime?: number;
  views: number;
  likes: number;
  publishedAt?: Date;
}

export interface UserBase {
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
  isActive: boolean;
  lastLogin?: Date;
}

// Tipos para documentos Mongoose
export interface Platform extends PlatformBase, Document {}
export interface Serie extends SerieBase, Document {}
export interface Episode extends EpisodeBase, Document {}
export interface Analisis extends AnalisisBase, Document {}
export interface User extends UserBase, Document {}

// Tipo limpio para el cliente
export type Clean<T> = Omit<T, keyof Document> & {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  seriesId?: string;
};

// 2. Configuración de esquemas
const schemaOptions = {
  toJSON: {
    virtuals: true,
    transform: function (doc: any, ret: any) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      if (ret.seriesId) ret.seriesId = ret.seriesId.toString();
      return ret;
    }
  },
  toObject: { virtuals: true },
  timestamps: true
};

const PlatformSchema = new Schema<Platform>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String, required: true },
  website: { type: String, required: true },
  color: { type: String, required: true }
}, schemaOptions);

const SerieSchema = new Schema<Serie>({
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
  ]
}, schemaOptions);

const EpisodeSchema = new Schema<Episode>({
  seriesId: { type: Schema.Types.ObjectId, ref: "Serie", required: true },
  title: { type: String, required: true },
  season: { type: Number, required: true },
  episode: { type: Number, required: true },
  airDate: { type: Date, required: true },
  description: { type: String, required: true }
}, schemaOptions);

const AnalisisSchema = new Schema<Analisis>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  universe: { type: String, enum: ["blue", "red"] },
  tags: [{ type: String }],
  author: {
    name: { type: String },
    avatar: { type: String },
  },
  status: { type: String, enum: ["draft", "published"], required: true },
  readTime: { type: Number },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  publishedAt: { type: Date }
}, schemaOptions);

const UserSchema = new Schema<User>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, schemaOptions);

// 3. Modelos y conexión
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
      PlatformModel = mongoose.model<Platform>("Platform", PlatformSchema);
    } else {
      PlatformModel = mongoose.models.Platform as Model<Platform>;
    }
    
    if (!mongoose.models.Serie) {
      SerieModel = mongoose.model<Serie>("Serie", SerieSchema);
    } else {
      SerieModel = mongoose.models.Serie as Model<Serie>;
    }
    
    if (!mongoose.models.Episode) {
      EpisodeModel = mongoose.model<Episode>("Episode", EpisodeSchema);
    } else {
      EpisodeModel = mongoose.models.Episode as Model<Episode>;
    }
    
    if (!mongoose.models.Analisis) {
      AnalisisModel = mongoose.model<Analisis>("Analisis", AnalisisSchema);
    } else {
      AnalisisModel = mongoose.models.Analisis as Model<Analisis>;
    }
    
    if (!mongoose.models.User) {
      UserModel = mongoose.model<User>("User", UserSchema);
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

// 4. Funciones de transformación
function toClean<T>(doc: any): Clean<T> {
  if (!doc) return doc;
  
  const obj = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, createdAt, updatedAt, seriesId, ...rest } = obj;
  
  return {
    ...rest,
    _id: _id?.toString() || obj.id?.toString(),
    createdAt: createdAt?.toISOString?.() || createdAt,
    updatedAt: updatedAt?.toISOString?.() || updatedAt,
    ...(seriesId && { seriesId: seriesId.toString() })
  } as Clean<T>;
}

// 5. Funciones de acceso a datos (completas)
// Series
export async function getSeries(): Promise<Clean<SerieBase>[]> {
  try {
    await connectMongoDB();
    if (!SerieModel) return [];
    const result = await SerieModel.find().sort({ startYear: -1 }).lean().exec();
    return result.map(doc => toClean<SerieBase>(doc));
  } catch (error) {
    console.error("Error fetching series:", error);
    return [];
  }
}

export async function getSerieBySlug(slug: string): Promise<Clean<SerieBase> | null> {
  try {
    await connectMongoDB();
    if (!SerieModel) return null;
    const result = await SerieModel.findOne({ slug }).lean().exec();
    return result ? toClean<SerieBase>(result) : null;
  } catch (error) {
    console.error("Error fetching serie:", error);
    return null;
  }
}

export async function getSerieById(id: string): Promise<Clean<SerieBase> | null> {
  try {
    await connectMongoDB();
    if (!SerieModel) return null;
    const result = await SerieModel.findById(id).lean().exec();
    return result ? toClean<SerieBase>(result) : null;
  } catch (error) {
    console.error("Error fetching serie:", error);
    return null;
  }
}

export async function insertSerie(serie: Omit<SerieBase, "_id">): Promise<string | null> {
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

export async function updateSerie(id: string, serie: Partial<SerieBase>): Promise<boolean> {
  try {
    await connectMongoDB();
    if (!SerieModel) return false;
    const result = await SerieModel.findByIdAndUpdate(id, serie, { new: true }).exec();
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
export async function getEpisodesBySeries(seriesId: string): Promise<Clean<EpisodeBase>[]> {
  try {
    await connectMongoDB();
    if (!EpisodeModel) return [];
    const result = await EpisodeModel.find({ seriesId }).lean().exec();
    return result.map(doc => toClean<EpisodeBase>(doc));
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return [];
  }
}

// Análisis
export async function getAnalisis(): Promise<Clean<AnalisisBase>[]> {
  try {
    await connectMongoDB();
    if (!AnalisisModel) return [];
    const result = await AnalisisModel.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .lean()
      .exec();
    return result.map(doc => toClean<AnalisisBase>(doc));
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return [];
  }
}

export async function getAnalisisBySlug(slug: string): Promise<Clean<AnalisisBase> | null> {
  try {
    await connectMongoDB();
    if (!AnalisisModel) return null;
    const result = await AnalisisModel.findOne({ slug, status: "published" }).lean().exec();
    return result ? toClean<AnalisisBase>(result) : null;
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return null;
  }
}

export async function insertAnalisis(analisis: Omit<AnalisisBase, "_id">): Promise<string | null> {
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
export async function getAnalisisBySerie(serieSlug: string): Promise<Clean<AnalisisBase>[]> {
  try {
    await connectMongoDB();
    if (!AnalisisModel) return [];
    
    const result = await AnalisisModel
      .find({
        status: "published",
        $or: [
          { tags: { $in: [serieSlug] } },
          { "serie.slug": serieSlug }
        ],
      })
      .sort({ publishedAt: -1 })
      .lean()
      .exec();
    return result.map(doc => toClean<AnalisisBase>(doc));
  } catch (error) {
    console.error("Error fetching analysis by serie:", error);
    return [];
  }
}

// Búsquedas
export async function searchSeries(query: string): Promise<Clean<SerieBase>[]> {
  try {
    await connectMongoDB();
    if (!SerieModel) return [];
    const result = await SerieModel.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } }
      ]
    })
    .lean()
    .exec();
    return result.map(doc => toClean<SerieBase>(doc));
  } catch (error) {
    console.error("Error searching series:", error);
    return [];
  }
}

// Usuarios
export async function createUser(userData: UserBase): Promise<Clean<UserBase> | null> {
  try {
    await connectMongoDB();
    if (!UserModel) return null;
    
    const existingUser = await UserModel.findOne({
      $or: [{ username: userData.username }, { email: userData.email }]
    });
    if (existingUser) throw new Error("User already exists");

    const newUser = await UserModel.create(userData);
    return toClean<UserBase>(newUser.toObject());
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function getUserByCredentials(identifier: string): Promise<Clean<UserBase> | null> {
  try {
    await connectMongoDB();
    if (!UserModel) return null;
    const result = await UserModel.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    }).lean().exec();
    return result ? toClean<UserBase>(result) : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

// 6. Funciones adicionales
export async function getPlatforms(): Promise<Clean<PlatformBase>[]> {
  try {
    await connectMongoDB();
    if (!PlatformModel) return [];
    const result = await PlatformModel.find().lean().exec();
    return result.map(doc => toClean<PlatformBase>(doc));
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
