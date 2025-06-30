import type { ReactElement } from 'react'
import { useState } from 'react'

interface FullAnalysisCardProps {
  title: string
  excerpt?: string
  content: string
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

export default function FullAnalysisCard({
  title,
  excerpt,
  content,
  universe,
  author,
  readTime,
  views: initialViews,
  likes: initialLikes,
  publishedAt,
  slug
}: FullAnalysisCardProps): ReactElement {
  const [views, setViews] = useState(initialViews)
  const [likes, setLikes] = useState(initialLikes)
  const [hasLiked, setHasLiked] = useState(false)
  const [hasViewed, setHasViewed] = useState(false)

  const bgColor = universe === 'blue' ? 'bg-blue-600' : 'bg-red-600'
  const badgeColor = universe === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
  
  // Simular incremento de vista al cargar el componente
  useState(() => {
    if (!hasViewed) {
      setViews(prev => prev + 1)
      setHasViewed(true)
    }
  })

  // Manejar like/unlike
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (hasLiked) {
      setLikes(prev => prev - 1)
      setHasLiked(false)
    } else {
      setLikes(prev => prev + 1)
      setHasLiked(true)
    }
  }

  // Formatear el contenido para mostrar párrafos
  const formattedContent = content.split('\n\n').map((paragraph, index) => {
    // Detectar títulos (líneas que empiezan con **)
    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
      const title = paragraph.replace(/\*\*/g, '')
      return (
        <h3 key={index} className="text-xl font-bold text-gray-800 mt-8 mb-4 first:mt-0">
          {title}
        </h3>
      )
    }
    
    // Párrafos regulares
    return (
      <p key={index} className="text-gray-700 leading-relaxed mb-4">
        {paragraph}
      </p>
    )
  })
  
  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className={`${bgColor} p-6 text-white`}>
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold leading-tight pr-4">{title}</h1>
          <span className={`${badgeColor} px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap`}>
            {universe === 'blue' ? 'Universo Azul' : 'Universo Rojo'}
          </span>
        </div>
        
        {/* Excerpt */}
        {excerpt && (
          <p className="text-gray-200 text-lg italic">{excerpt}</p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-300">
          {author && (
            <div className="flex items-center space-x-2">
              {author.avatar ? (
                <img 
                  src={author.avatar} 
                  alt={author.name}
                  className="w-8 h-8 rounded-full border-2 border-white/20"
                  onError={(e) => {
                    // Si la imagen falla, mostrar un avatar con iniciales
                    e.currentTarget.style.display = 'none';
                    const initials = e.currentTarget.nextElementSibling as HTMLElement;
                    if (initials) initials.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-8 h-8 rounded-full border-2 border-white/20 bg-white/20 flex items-center justify-center text-sm font-bold"
                style={{ display: author.avatar ? 'none' : 'flex' }}
              >
                {author.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{author.name}</span>
            </div>
          )}
          {readTime && <span>📖 {readTime} min de lectura</span>}
          {publishedAt && (
            <span>📅 {publishedAt.toLocaleDateString('es-ES')}</span>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-8">
        <div className="prose max-w-none">
          {formattedContent}
        </div>
      </div>

      {/* Footer with stats and actions */}
      <div className="px-8 py-6 bg-gray-50 border-t">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className={hasViewed ? 'font-semibold text-blue-600' : ''}>{views.toLocaleString()} visualizaciones</span>
            </span>
          </div>
          
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 ${
              hasLiked 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <svg 
              className={`w-5 h-5 ${hasLiked ? 'fill-current' : 'fill-none'}`} 
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
            <span className={hasLiked ? 'font-semibold' : ''}>{likes} me gusta</span>
          </button>
        </div>
      </div>
    </article>
  )
}
