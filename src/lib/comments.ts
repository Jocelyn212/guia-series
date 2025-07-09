import mongoose from "mongoose";
import { connectMongoDB } from "./mongo";

const { Schema, model } = mongoose;

// Interfaz para comentarios
export interface Comment {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  serieId: mongoose.Types.ObjectId;
  content: string;
  parentId?: mongoose.Types.ObjectId; // Para respuestas a comentarios
  likes: mongoose.Types.ObjectId[]; // Array de IDs de usuarios que dieron like
  createdAt?: Date;
  updatedAt?: Date;
}

// Interfaz para comentarios con información de usuario
export interface CommentWithUser extends Comment {
  user: {
    _id: string;
    username: string;
    email?: string;
  };
  replies?: CommentWithUser[];
  isLiked?: boolean;
  likesCount: number;
}

// Schema para comentarios
const CommentSchema = new Schema<Comment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serieId: { type: Schema.Types.ObjectId, ref: "Serie", required: true },
    content: { type: String, required: true, maxlength: 1000 },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "comments",
  }
);

// Índices para optimizar consultas
CommentSchema.index({ serieId: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1 });

// Crear modelo si no existe
const CommentModel =
  mongoose.models.Comment || model<Comment>("Comment", CommentSchema);

// Funciones para manejar comentarios
export async function createComment(
  userId: string,
  serieId: string,
  content: string,
  parentId?: string
): Promise<Comment | null> {
  try {
    await connectMongoDB();
    if (!CommentModel) return null;

    const commentData = {
      userId: new mongoose.Types.ObjectId(userId),
      serieId: new mongoose.Types.ObjectId(serieId),
      content,
      parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null,
      likes: [],
    };

    const comment = new CommentModel(commentData);
    await comment.save();
    return comment.toObject();
  } catch (error) {
    console.error("Error creating comment:", error);
    return null;
  }
}

export async function getSerieComments(
  serieId: string,
  limit = 20,
  page = 1,
  currentUserId?: string
): Promise<CommentWithUser[]> {
  try {
    await connectMongoDB();
    if (!CommentModel) return [];

    const skip = (page - 1) * limit;

    // Obtener comentarios principales (sin parentId)
    const comments = await CommentModel.find({
      serieId: new mongoose.Types.ObjectId(serieId),
      parentId: null,
    })
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Para cada comentario, obtener sus respuestas
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await CommentModel.find({
          parentId: comment._id,
        })
          .populate("userId", "username email")
          .sort({ createdAt: 1 });

        const commentObj = comment.toObject();

        return {
          ...commentObj,
          user: (comment as any).userId,
          replies: replies.map((reply) => {
            const replyObj = reply.toObject();
            return {
              ...replyObj,
              user: (reply as any).userId,
              likesCount: replyObj.likes.length,
              isLiked: currentUserId
                ? replyObj.likes.includes(
                    new mongoose.Types.ObjectId(currentUserId)
                  )
                : false,
            };
          }),
          likesCount: commentObj.likes.length,
          isLiked: currentUserId
            ? commentObj.likes.includes(
                new mongoose.Types.ObjectId(currentUserId)
              )
            : false,
        };
      })
    );

    return commentsWithReplies;
  } catch (error) {
    console.error("Error getting serie comments:", error);
    return [];
  }
}

export async function toggleCommentLike(
  commentId: string,
  userId: string
): Promise<boolean> {
  try {
    await connectMongoDB();
    if (!CommentModel) return false;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const comment = await CommentModel.findById(commentId);

    if (!comment) return false;

    const isLiked = comment.likes.includes(userObjectId);

    if (isLiked) {
      // Remover like
      comment.likes = comment.likes.filter(
        (id: mongoose.Types.ObjectId) => !id.equals(userObjectId)
      );
    } else {
      // Agregar like
      comment.likes.push(userObjectId);
    }

    await comment.save();
    return true;
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return false;
  }
}

export async function updateComment(
  commentId: string,
  userId: string,
  content: string
): Promise<Comment | null> {
  try {
    await connectMongoDB();
    if (!CommentModel) return null;

    const comment = await CommentModel.findOneAndUpdate(
      { _id: commentId, userId: new mongoose.Types.ObjectId(userId) },
      { content, updatedAt: new Date() },
      { new: true }
    );

    return comment ? comment.toObject() : null;
  } catch (error) {
    console.error("Error updating comment:", error);
    return null;
  }
}

export async function deleteComment(
  commentId: string,
  userId: string
): Promise<boolean> {
  try {
    await connectMongoDB();
    if (!CommentModel) return false;

    // Eliminar el comentario y todas sus respuestas
    await CommentModel.deleteMany({
      $or: [
        { _id: commentId, userId: new mongoose.Types.ObjectId(userId) },
        { parentId: commentId },
      ],
    });

    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
}

export async function getUserComments(
  userId: string,
  limit = 20,
  page = 1
): Promise<CommentWithUser[]> {
  try {
    await connectMongoDB();
    if (!CommentModel) return [];

    const skip = (page - 1) * limit;
    const comments = await CommentModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .populate("serieId", "title slug posterUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return comments.map((comment: any) => {
      const commentObj = comment.toObject();
      return {
        ...commentObj,
        user: { _id: userId, username: "", email: "" },
        likesCount: commentObj.likes.length,
        isLiked: false,
      };
    });
  } catch (error) {
    console.error("Error getting user comments:", error);
    return [];
  }
}

export async function getCommentById(
  commentId: string
): Promise<Comment | null> {
  try {
    await connectMongoDB();
    if (!CommentModel) return null;

    const comment = await CommentModel.findById(commentId).populate(
      "userId",
      "username email"
    );

    return comment ? comment.toObject() : null;
  } catch (error) {
    console.error("Error getting comment by ID:", error);
    return null;
  }
}

export async function getCommentsCount(serieId: string): Promise<number> {
  try {
    await connectMongoDB();
    if (!CommentModel) return 0;

    return await CommentModel.countDocuments({
      serieId: new mongoose.Types.ObjectId(serieId),
    });
  } catch (error) {
    console.error("Error counting comments:", error);
    return 0;
  }
}

// Función para moderar comentarios (admin)
export async function moderateComment(
  commentId: string,
  action: "approve" | "delete"
): Promise<boolean> {
  try {
    await connectMongoDB();
    if (!CommentModel) return false;

    if (action === "delete") {
      await CommentModel.findByIdAndDelete(commentId);
    }

    return true;
  } catch (error) {
    console.error("Error moderating comment:", error);
    return false;
  }
}
