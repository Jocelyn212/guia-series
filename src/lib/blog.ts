import mongoose from 'mongoose';
import { connectMongoDB } from './mongo';

const { Schema, model } = mongoose;

// Interfaz para un post de blog
export interface BlogPost {
  _id?: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  category: 'news' | 'analysis' | 'interview' | 'editorial';
  tags: string[];
  featuredImage?: string;
  published: boolean;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Schema para posts de blog
const BlogPostSchema = new Schema<BlogPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      name: { type: String, required: true },
      avatar: { type: String }
    },
    category: { 
      type: String, 
      enum: ['news', 'analysis', 'interview', 'editorial'], 
      required: true 
    },
    tags: [{ type: String }],
    featuredImage: { type: String },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'blog_posts'
  }
);

// Crear modelo si no existe
const BlogPostModel = mongoose.models.BlogPost || model<BlogPost>('BlogPost', BlogPostSchema);

// Funciones para manejar posts de blog
export async function getAllBlogPosts(limit = 10, page = 1): Promise<BlogPost[]> {
  try {
    await connectMongoDB();
    if (!BlogPostModel) return [];

    const skip = (page - 1) * limit;
    const posts = await BlogPostModel.find({ published: true })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return posts.map((post: any) => post.toObject());
  } catch (error) {
    console.error('Error getting blog posts:', error);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    await connectMongoDB();
    if (!BlogPostModel) return null;

    const post = await BlogPostModel.findOne({ slug, published: true });
    return post ? post.toObject() : null;
  } catch (error) {
    console.error('Error getting blog post by slug:', error);
    return null;
  }
}

export async function getBlogPostsByCategory(category: BlogPost['category'], limit = 10): Promise<BlogPost[]> {
  try {
    await connectMongoDB();
    if (!BlogPostModel) return [];

    const posts = await BlogPostModel.find({ category, published: true })
      .sort({ publishedAt: -1 })
      .limit(limit);
    
    return posts.map((post: any) => post.toObject());
  } catch (error) {
    console.error('Error getting blog posts by category:', error);
    return [];
  }
}

export async function createBlogPost(postData: Omit<BlogPost, '_id' | 'createdAt' | 'updatedAt'>): Promise<BlogPost | null> {
  try {
    await connectMongoDB();
    if (!BlogPostModel) return null;

    const post = new BlogPostModel(postData);
    await post.save();
    return post.toObject();
  } catch (error) {
    console.error('Error creating blog post:', error);
    return null;
  }
}

export async function updateBlogPost(id: string, updateData: Partial<BlogPost>): Promise<BlogPost | null> {
  try {
    await connectMongoDB();
    if (!BlogPostModel) return null;

    const post = await BlogPostModel.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
    
    return post ? post.toObject() : null;
  } catch (error) {
    console.error('Error updating blog post:', error);
    return null;
  }
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  try {
    await connectMongoDB();
    if (!BlogPostModel) return false;

    const result = await BlogPostModel.findByIdAndDelete(id);
    return result !== null;
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return false;
  }
}

export async function getBlogPostsCount(): Promise<number> {
  try {
    await connectMongoDB();
    if (!BlogPostModel) return 0;

    return await BlogPostModel.countDocuments({ published: true });
  } catch (error) {
    console.error('Error counting blog posts:', error);
    return 0;
  }
}

// Función para admin - obtener todos los posts (publicados y borradores)
export async function getAllBlogPostsAdmin(limit = 50): Promise<BlogPost[]> {
  try {
    await connectMongoDB();
    if (!BlogPostModel) return [];

    const posts = await BlogPostModel.find({})
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return posts.map((post: any) => post.toObject());
  } catch (error) {
    console.error('Error getting admin blog posts:', error);
    return [];
  }
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  try {
    await connectMongoDB();
    if (!BlogPostModel) return null;

    const post = await BlogPostModel.findById(id);
    return post ? post.toObject() : null;
  } catch (error) {
    console.error('Error getting blog post by ID:', error);
    return null;
  }
}
