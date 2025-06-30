import type { ReactElement } from 'react'
import { useState } from 'react'

interface FringeCardProps {
  title: string
  excerpt?: string
  description: string
  universe: 'blue' | 'red'
  author?: {
    name: string
    avatar?: string
  }
  readTime?: number
  views: number
  likes: number
  publishedAt?: Date
  slug?: string
}

export default function FringeCard({
  title,
  excerpt,
  description,
  universe,
  author,
  readTime,
  views: initialViews,
  likes: initialLikes,
  publishedAt,
  slug
}: FringeCardProps): ReactElement {
  const [views, setViews] = useState(initialViews)
  const [likes, setLikes] = useState(initialLikes)
  const [hasLiked, setHasLiked] = useState(false)
  const [hasViewed, setHasViewed] = useState(false)

  const bgColor = universe === 'blue' ? 'bg-blue-600' : 'bg-red-600'
  const badgeColor = universe === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
  
  // Simular incremento de vista al hacer clic en la tarjeta
  const handleCardClick = () => {
    if (!hasViewed) {
      setViews(prev => prev + 1)
      setHasViewed(true)
    }
  }

  // Manejar like/unlike
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevenir que se active el clic de la tarjeta
    
    if (hasLiked) {
      setLikes(prev => prev - 1)
      setHasLiked(false)
    } else {
      setLikes(prev => prev + 1)
      setHasLiked(true)
    }
  }
  
  return (
    <article 
      className={`${bgColor} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold leading-tight">{title}</h2>
        <span className={`${badgeColor} px-3 py-1 rounded-full text-sm font-medium`}>
          {universe === 'blue' ? 'Universo Azul' : 'Universo Rojo'}
        </span>
      </div>
      
      {/* Excerpt */}
      {excerpt && (
        <p className="text-gray-200 text-sm mb-3 italic">{excerpt}</p>
      )}
      
      {/* Content */}
      <p className="text-gray-100 leading-relaxed mb-4 line-clamp-4">{description}</p>
      
      {/* Footer with metadata */}
      <div className="flex justify-between items-center text-sm text-gray-300 border-t border-white/20 pt-4">
        <div className="flex items-center space-x-4">
          {author && (
            <div className="flex items-center space-x-2">
              {author.avatar ? (
                <img 
                  src={author.avatar} 
                  alt={author.name}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    // Si la imagen falla, mostrar un avatar con iniciales
                    e.currentTarget.style.display = 'none';
                    const initials = e.currentTarget.nextElementSibling as HTMLElement;
                    if (initials) initials.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold"
                style={{ display: author.avatar ? 'none' : 'flex' }}
              >
                {author.name.charAt(0).toUpperCase()}
              </div>
              <span>{author.name}</span>
            </div>
          )}
          {readTime && <span>{readTime} min lectura</span>}
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <span>👁</span>
            <span className={hasViewed ? 'font-bold' : ''}>{views.toLocaleString()}</span>
          </span>
          
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-1 transition-all duration-200 hover:scale-110 ${
              hasLiked ? 'text-red-300' : 'text-gray-300 hover:text-red-300'
            }`}
          >
            <svg 
              className={`w-4 h-4 ${hasLiked ? 'fill-red-400 text-red-400' : 'fill-none text-gray-300'}`}
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
            <span className={hasLiked ? 'font-bold' : ''}>{likes}</span>
          </button>
          
          {publishedAt && (
            <span>{publishedAt.toLocaleDateString('es-ES')}</span>
          )}
        </div>
      </div>
    </article>
  )
}