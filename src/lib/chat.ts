import mongoose from "mongoose";
import { connectMongoDB } from "./mongo";

const { Schema, model } = mongoose;

// Interfaz para mensajes de chat
export interface ChatMessage {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  username: string;
  message: string;
  type: "message" | "system" | "announcement";
  replyTo?: mongoose.Types.ObjectId; // Para responder a mensajes
  isEdited?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interfaz para usuarios online
export interface OnlineUser {
  userId: string;
  username: string;
  lastSeen: Date;
}

// Schema para mensajes de chat
const ChatMessageSchema = new Schema<ChatMessage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    message: { type: String, required: true, maxlength: 500 },
    type: {
      type: String,
      enum: ["message", "system", "announcement"],
      default: "message",
    },
    replyTo: { type: Schema.Types.ObjectId, ref: "ChatMessage", default: null },
    isEdited: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "chat_messages",
  }
);

// Índices para optimizar consultas
ChatMessageSchema.index({ createdAt: -1 });

// Crear modelo si no existe
const ChatMessageModel =
  mongoose.models.ChatMessage ||
  model<ChatMessage>("ChatMessage", ChatMessageSchema);

// Funciones para manejar chat
export async function createChatMessage(
  userId: string,
  username: string,
  message: string,
  type: "message" | "system" | "announcement" = "message",
  replyTo?: string
): Promise<ChatMessage | null> {
  try {
    await connectMongoDB();
    if (!ChatMessageModel) return null;

    const messageData = {
      userId: new mongoose.Types.ObjectId(userId),
      username,
      message,
      type,
      replyTo: replyTo ? new mongoose.Types.ObjectId(replyTo) : null,
    };

    const chatMessage = new ChatMessageModel(messageData);
    await chatMessage.save();
    return chatMessage.toObject();
  } catch (error) {
    console.error("Error creating chat message:", error);
    return null;
  }
}

export async function getChatMessages(
  limit = 50,
  before?: string
): Promise<ChatMessage[]> {
  try {
    await connectMongoDB();
    if (!ChatMessageModel) return [];

    let query = {};
    if (before) {
      query = { createdAt: { $lt: new Date(before) } };
    }

    const messages = await ChatMessageModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("replyTo", "username message");

    return messages.reverse().map((message: any) => message.toObject());
  } catch (error) {
    console.error("Error getting chat messages:", error);
    return [];
  }
}

export async function updateChatMessage(
  messageId: string,
  userId: string,
  newMessage: string
): Promise<ChatMessage | null> {
  try {
    await connectMongoDB();
    if (!ChatMessageModel) return null;

    const message = await ChatMessageModel.findOneAndUpdate(
      {
        _id: messageId,
        userId: new mongoose.Types.ObjectId(userId),
        type: "message", // Solo mensajes normales se pueden editar
      },
      {
        message: newMessage,
        isEdited: true,
        updatedAt: new Date(),
      },
      { new: true }
    );

    return message ? message.toObject() : null;
  } catch (error) {
    console.error("Error updating chat message:", error);
    return null;
  }
}

export async function deleteChatMessage(
  messageId: string,
  userId: string,
  isAdmin = false
): Promise<boolean> {
  try {
    await connectMongoDB();
    if (!ChatMessageModel) return false;

    let query: any = { _id: messageId };

    // Si no es admin, solo puede eliminar sus propios mensajes
    if (!isAdmin) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    const result = await ChatMessageModel.findOneAndDelete(query);
    return result !== null;
  } catch (error) {
    console.error("Error deleting chat message:", error);
    return false;
  }
}

export async function createSystemMessage(
  message: string
): Promise<ChatMessage | null> {
  try {
    await connectMongoDB();
    if (!ChatMessageModel) return null;

    const systemMessage = new ChatMessageModel({
      userId: new mongoose.Types.ObjectId(),
      username: "Sistema",
      message,
      type: "system",
    });

    await systemMessage.save();
    return systemMessage.toObject();
  } catch (error) {
    console.error("Error creating system message:", error);
    return null;
  }
}

export async function createAnnouncement(
  adminId: string,
  adminUsername: string,
  message: string
): Promise<ChatMessage | null> {
  try {
    await connectMongoDB();
    if (!ChatMessageModel) return null;

    const announcement = new ChatMessageModel({
      userId: new mongoose.Types.ObjectId(adminId),
      username: adminUsername,
      message,
      type: "announcement",
    });

    await announcement.save();
    return announcement.toObject();
  } catch (error) {
    console.error("Error creating announcement:", error);
    return null;
  }
}

// Función para limpiar mensajes antiguos (mantener solo los últimos 1000)
export async function cleanupOldMessages(): Promise<void> {
  try {
    await connectMongoDB();
    if (!ChatMessageModel) return;

    const totalMessages = await ChatMessageModel.countDocuments();
    const maxMessages = 1000;

    if (totalMessages > maxMessages) {
      const oldestMessages = await ChatMessageModel.find({})
        .sort({ createdAt: 1 })
        .limit(totalMessages - maxMessages);

      const idsToDelete = oldestMessages.map((msg) => msg._id);
      await ChatMessageModel.deleteMany({ _id: { $in: idsToDelete } });
    }
  } catch (error) {
    console.error("Error cleaning up old messages:", error);
  }
}

// Función para obtener estadísticas del chat
export async function getChatStats(): Promise<{
  totalMessages: number;
  messagesLast24h: number;
  activeUsers: number;
}> {
  try {
    await connectMongoDB();
    if (!ChatMessageModel)
      return { totalMessages: 0, messagesLast24h: 0, activeUsers: 0 };

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalMessages, messagesLast24h, activeUsersResult] =
      await Promise.all([
        ChatMessageModel.countDocuments(),
        ChatMessageModel.countDocuments({ createdAt: { $gte: last24h } }),
        ChatMessageModel.distinct("userId", { createdAt: { $gte: last24h } }),
      ]);

    return {
      totalMessages,
      messagesLast24h,
      activeUsers: activeUsersResult.length,
    };
  } catch (error) {
    console.error("Error getting chat stats:", error);
    return { totalMessages: 0, messagesLast24h: 0, activeUsers: 0 };
  }
}
