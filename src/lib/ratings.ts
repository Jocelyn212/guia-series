import mongoose from "mongoose";
import { connectMongoDB } from "./mongo";

const { Schema, model } = mongoose;

// Interfaz para valoraciones de series
export interface Rating {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  serieSlug: string;
  rating: number; // 1-5
  review?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interfaz para estadísticas de valoraciones
export interface RatingStats {
  serieSlug: string;
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    [key: number]: number; // rating: count
  };
}

// Schema para valoraciones
const RatingSchema = new Schema<Rating>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serieSlug: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "ratings",
  }
);

// Índices únicos para evitar múltiples valoraciones del mismo usuario para la misma serie
RatingSchema.index({ userId: 1, serieSlug: 1 }, { unique: true });

// Crear modelo si no existe
const RatingModel =
  mongoose.models.Rating || model<Rating>("Rating", RatingSchema);

// Variable para evitar múltiples ejecuciones de la limpieza de índices
let indexesFixed = false;

// Función para limpiar índices antiguos
async function ensureCorrectIndexes() {
  if (indexesFixed) return;

  try {
    await connectMongoDB();
    if (RatingModel) {
      // Intentar eliminar índices antiguos que pueden estar causando conflictos
      try {
        await RatingModel.collection.dropIndex("userId_1_serieId_1");
      } catch (error) {
        // Es normal que falle si el índice no existe
      }

      // Asegurar que el índice correcto existe
      await RatingModel.collection.createIndex(
        { userId: 1, serieSlug: 1 },
        { unique: true }
      );
      indexesFixed = true;
    }
  } catch (error) {
    console.error("Error al configurar índices:", error);
  }
}

// Funciones para manejar valoraciones
export async function createOrUpdateRating(
  userId: string,
  serieSlug: string,
  rating: number,
  review?: string
): Promise<Rating | null> {
  try {
    await connectMongoDB();

    // Asegurar que los índices están correctos
    await ensureCorrectIndexes();

    if (!RatingModel) {
      return null;
    }

    const ratingData = {
      userId: new mongoose.Types.ObjectId(userId),
      serieSlug,
      rating,
      review,
      updatedAt: new Date(),
    };

    const existingRating = await RatingModel.findOneAndUpdate(
      { userId: ratingData.userId, serieSlug: ratingData.serieSlug },
      ratingData,
      { upsert: true, new: true }
    );

    return existingRating ? existingRating.toObject() : null;
  } catch (error) {
    console.error("Error creating/updating rating:", error);
    return null;
  }
}

export async function getUserRating(
  userId: string,
  serieSlug: string
): Promise<Rating | null> {
  try {
    await connectMongoDB();
    if (!RatingModel) return null;

    const rating = await RatingModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      serieSlug,
    });

    return rating ? rating.toObject() : null;
  } catch (error) {
    console.error("Error getting user rating:", error);
    return null;
  }
}

export async function getSerieRatings(
  serieSlug: string,
  limit = 20,
  page = 1
): Promise<Rating[]> {
  try {
    await connectMongoDB();
    if (!RatingModel) return [];

    const skip = (page - 1) * limit;
    const ratings = await RatingModel.find({
      serieSlug,
    })
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return ratings.map((rating: any) => rating.toObject());
  } catch (error) {
    console.error("Error getting serie ratings:", error);
    return [];
  }
}

export async function getSerieRatingStats(
  serieSlug: string
): Promise<RatingStats | null> {
  try {
    await connectMongoDB();
    if (!RatingModel) return null;

    const stats = await RatingModel.aggregate([
      { $match: { serieSlug } },
      {
        $group: {
          _id: "$serieSlug",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
          ratings: { $push: "$rating" },
        },
      },
    ]);

    if (!stats || stats.length === 0) return null;

    const stat = stats[0];

    // Calcular distribución de ratings
    const ratingDistribution: { [key: number]: number } = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = 0;
    }

    stat.ratings.forEach((rating: number) => {
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    });

    return {
      serieSlug: stat._id,
      averageRating: Math.round(stat.averageRating * 10) / 10, // 1 decimal
      totalRatings: stat.totalRatings,
      ratingDistribution,
    };
  } catch (error) {
    console.error("Error getting serie rating stats:", error);
    return null;
  }
}

export async function getUserRatings(
  userId: string,
  limit = 20,
  page = 1
): Promise<Rating[]> {
  try {
    await connectMongoDB();
    if (!RatingModel) return [];

    const skip = (page - 1) * limit;
    const ratings = await RatingModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    return ratings.map((rating: any) => rating.toObject());
  } catch (error) {
    console.error("Error getting user ratings:", error);
    return [];
  }
}

export async function deleteRating(
  userId: string,
  serieSlug: string
): Promise<boolean> {
  try {
    await connectMongoDB();
    if (!RatingModel) return false;

    const result = await RatingModel.findOneAndDelete({
      userId: new mongoose.Types.ObjectId(userId),
      serieSlug,
    });

    return result !== null;
  } catch (error) {
    console.error("Error deleting rating:", error);
    return false;
  }
}

// Función para obtener top series por rating
export async function getTopRatedSeries(limit = 10): Promise<any[]> {
  try {
    await connectMongoDB();
    if (!RatingModel) return [];

    const topSeries = await RatingModel.aggregate([
      {
        $group: {
          _id: "$serieSlug",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
      { $match: { totalRatings: { $gte: 5 } } }, // Mínimo 5 valoraciones
      { $sort: { averageRating: -1 } },
      { $limit: limit },
    ]);

    return topSeries;
  } catch (error) {
    console.error("Error getting top rated series:", error);
    return [];
  }
}

// Función para obtener usuarios más activos valorando
export async function getTopReviewers(limit = 10): Promise<any[]> {
  try {
    await connectMongoDB();
    if (!RatingModel) return [];

    const topReviewers = await RatingModel.aggregate([
      {
        $group: {
          _id: "$userId",
          totalRatings: { $sum: 1 },
          averageRating: { $avg: "$rating" },
        },
      },
      { $sort: { totalRatings: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ]);

    return topReviewers;
  } catch (error) {
    console.error("Error getting top reviewers:", error);
    return [];
  }
}
