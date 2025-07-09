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
  analysisId?: string
  isLiked?: boolean
  isAuthenticated?: boolean
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
  slug,
  analysisId,
  isLiked: initialIsLiked = false,
  isAuthenticated = false
}: FringeCardProps): ReactElement {
  const [views, setViews] = useState(initialViews)
  const [likes, setLikes] = useState(initialLikes)
  const [hasLiked, setHasLiked] = useState(initialIsLiked)
  const [hasViewed, setHasViewed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Colores elegantes y profesionales en lugar de azul/rojo fuertes
  const bgColor = universe === 'blue' ? 'bg-slate-600' : 'bg-purple-600'
  const badgeColor = universe === 'blue' ? 'bg-slate-100 text-slate-700' : 'bg-purple-100 text-purple-700'
  
  // Función para limpiar markdown y obtener texto plano
  const cleanMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Quitar negritas
      .replace(/\*(.*?)\*/g, '$1')     // Quitar cursivas
      .replace(/#{1,6}\s*/g, '')       // Quitar headers
      .replace(/\n+/g, ' ')            // Convertir saltos de línea en espacios
      .trim()
  }

  // Navegar a la página de análisis individual
  const handleCardClick = () => {
    if (slug) {
      window.location.href = `/analisis/${slug}`;
    }
  }

  // Manejar like/unlike con API real
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevenir que se active el clic de la tarjeta
    
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para dar like a un análisis')
      return
    }
    
    if (!analysisId) {
      alert('Error: ID de análisis no disponible')
      return
    }
    
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          analysisId,
          action: hasLiked ? 'remove' : 'add'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setHasLiked(!hasLiked)
          setLikes(prev => hasLiked ? prev - 1 : prev + 1)
        } else {
          alert('Error al actualizar like: ' + result.error)
        }
      } else {
        const error = await response.json()
        alert('Error: ' + error.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <article 
      className={`group relative ${bgColor} rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden`}
      onClick={handleCardClick}
    >
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${badgeColor}`}>
              {universe === 'blue' ? 'Análisis Principal' : 'Análisis Alternativo'}
            </span>
            <div className="flex items-center text-xs text-white/70">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {views.toLocaleString()}
            </div>
          </div>
          <h2 className="text-2xl font-bold leading-tight group-hover:text-yellow-200 transition-colors">
            {title}
          </h2>
        </div>
        
        {/* Excerpt */}
        {excerpt && (
          <p className="text-white/90 text-sm mb-4 italic leading-relaxed">
            {cleanMarkdown(excerpt)}
          </p>
        )}
        
        {/* Content Preview */}
        <p className="text-white/80 leading-relaxed mb-6 line-clamp-3">
          {cleanMarkdown(description).substring(0, 150)}...
        </p>
        
        {/* Call to Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-white/70">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Leer análisis completo</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike}
              disabled={isLoading}
              className={`flex items-center gap-1 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                hasLiked ? 'text-red-300' : 'text-white/70 hover:text-red-300'
              }`}
            >
              <svg 
                className={`w-5 h-5 ${hasLiked ? 'fill-red-400 text-red-400' : 'fill-none text-white/70'}`}
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
              <span className={`font-medium ${hasLiked ? 'text-red-300' : ''}`}>
                {likes}
              </span>
            </button>
          </div>
        </div>
        
        {/* Footer metadata */}
        <div className="flex justify-between items-center text-xs text-white/60 border-t border-white/20 pt-4 mt-4">
          <div className="flex items-center gap-4">
            {author && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                  {author.avatar && !author.avatar.includes('placeholder.com') ? (
                    <img 
                      src={author.avatar} 
                      alt={author.name || 'Autor'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Error cargando avatar:', author.avatar);
                        e.currentTarget.style.display = 'none';
                        const initials = e.currentTarget.nextElementSibling as HTMLElement;
                        if (initials) initials.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-full flex items-center justify-center text-xs font-bold"
                    style={{ display: (author.avatar && !author.avatar.includes('placeholder.com')) ? 'none' : 'flex' }}
                  >
                    {author.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                </div>
                <span>{author.name || 'Anónimo'}</span>
              </div>
            )}
            {readTime && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {readTime} min
              </span>
            )}
          </div>
          
          {publishedAt && (
            <time dateTime={publishedAt.toISOString()}>
              {publishedAt.toLocaleDateString('es-ES', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </time>
          )}
        </div>
      </div>
    </article>
  )
}