import type { ReactElement } from 'react'
import { useState, useEffect } from 'react'

interface SerieCardProps {
  title: string
  description: string
  genre: string[]
  network: string
  startYear: number
  endYear?: number
  status: "ongoing" | "ended" | "cancelled"
  imdbRating: number
  posterUrl?: string
  trailerUrl?: string
  platforms: Array<{
    name: string
    available: boolean
    isPremium: boolean
  }>
  slug: string
  isFavorite?: boolean
  isInWatchlist?: boolean
  isAuthenticated?: boolean
  onFavoriteChange?: (slug: string, isFavorite: boolean) => void
  onWatchlistChange?: (slug: string, isInWatchlist: boolean) => void
  // Nuevas props para valoraciones
  userRating?: number
  averageRating?: number
  totalRatings?: number
  onRatingChange?: (slug: string, userRating: number, averageRating: number, totalRatings: number) => void
}

export default function SerieCard({
  title,
  description,
  genre,
  network,
  startYear,
  endYear,
  status,
  imdbRating,
  posterUrl,
  trailerUrl,
  platforms,
  slug,
  isFavorite: initialIsFavorite = false,
  isInWatchlist: initialIsInWatchlist = false,
  isAuthenticated = false,
  onFavoriteChange,
  onWatchlistChange,
  userRating: initialUserRating = 0,
  averageRating: initialAverageRating = 0,
  totalRatings: initialTotalRatings = 0,
  onRatingChange
}: SerieCardProps): ReactElement {
  const [isLiked, setIsLiked] = useState(initialIsFavorite)
  const [isBookmarked, setIsBookmarked] = useState(initialIsInWatchlist)
  const [isLoading, setIsLoading] = useState(false)
  
  // Estados para valoraciones
  const [userRating, setUserRating] = useState(initialUserRating)
  const [averageRating, setAverageRating] = useState(initialAverageRating)
  const [totalRatings, setTotalRatings] = useState(initialTotalRatings)
  const [hoverRating, setHoverRating] = useState(0)
  const [isRatingLoading, setIsRatingLoading] = useState(false)

  // Sincronizar estados cuando las props cambien
  useEffect(() => {
    setIsLiked(initialIsFavorite)
  }, [initialIsFavorite])

  useEffect(() => {
    setIsBookmarked(initialIsInWatchlist)
  }, [initialIsInWatchlist])

  // Sincronizar valoraciones
  useEffect(() => {
    setUserRating(initialUserRating)
  }, [initialUserRating])

  useEffect(() => {
    setAverageRating(initialAverageRating)
  }, [initialAverageRating])

  useEffect(() => {
    setTotalRatings(initialTotalRatings)
  }, [initialTotalRatings])

  const statusColor = {
    ongoing: 'bg-green-500',
    ended: 'bg-gray-500', 
    cancelled: 'bg-red-500'
  }[status]

  const statusText = {
    ongoing: 'En emisión',
    ended: 'Finalizada',
    cancelled: 'Cancelada'
  }[status]

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para marcar como favorita')
      return
    }
    
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          serieSlug: slug,
          action: isLiked ? 'remove' : 'add'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const newState = !isLiked
          setIsLiked(newState)
          // Notificar al componente padre del cambio
          onFavoriteChange?.(slug, newState)
        } else {
          alert('Error al actualizar favoritos: ' + result.error)
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

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para agregar a tu lista')
      return
    }
    
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          serieSlug: slug,
          action: isBookmarked ? 'remove' : 'add'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const newState = !isBookmarked
          setIsBookmarked(newState)
          // Notificar al componente padre del cambio
          onWatchlistChange?.(slug, newState)
        } else {
          alert('Error al actualizar lista: ' + result.error)
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

  const handleTrailer = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!trailerUrl) return
    
    // Función para abrir modal de trailer (similar a la de series/[slug].astro)
    let videoId = ''
    
    // Extraer ID del video de YouTube
    if (trailerUrl.includes('youtube.com/watch?v=')) {
      videoId = trailerUrl.split('v=')[1].split('&')[0]
    } else if (trailerUrl.includes('youtu.be/')) {
      videoId = trailerUrl.split('youtu.be/')[1].split('?')[0]
    }
    
    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`
      
      // Crear modal
      const modal = document.createElement('div')
      modal.id = 'trailerModal'
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4'
      modal.innerHTML = `
        <div class="relative bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh]">
          <div class="flex justify-between items-center p-4 bg-gray-900 text-white">
            <h3 class="text-lg font-semibold">🎬 Trailer - ${title}</h3>
            <button id="closeTrailerModal" class="text-gray-300 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="aspect-video">
            <iframe
              src="${embedUrl}"
              class="w-full h-full"
              frameborder="0"
              allowfullscreen
              allow="autoplay; encrypted-media"
            ></iframe>
          </div>
        </div>
      `
      
      document.body.appendChild(modal)
      
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden'
      
      // Cerrar modal
      const closeBtn = modal.querySelector('#closeTrailerModal')
      function closeModal() {
        modal.remove()
        document.body.style.overflow = ''
      }
      
      closeBtn?.addEventListener('click', closeModal)
      
      // Cerrar al hacer clic fuera del modal
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          closeModal()
        }
      })
      
      // Cerrar con Escape
      const escapeListener = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && document.getElementById('trailerModal')) {
          closeModal()
          document.removeEventListener('keydown', escapeListener)
        }
      }
      document.addEventListener('keydown', escapeListener)
    } else {
      // Si no es un video de YouTube, abrir en nueva ventana
      window.open(trailerUrl, '_blank')
    }
  }

  // Función para manejar valoraciones
  const handleRating = async (rating: number) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para valorar series')
      return
    }
    
    if (isRatingLoading) return
    
    setIsRatingLoading(true)
    
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          serieSlug: slug,
          rating: rating
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setUserRating(rating)
          setAverageRating(result.data.averageRating)
          setTotalRatings(result.data.totalRatings)
          // Notificar al componente padre del cambio
          onRatingChange?.(slug, rating, result.data.averageRating, result.data.totalRatings)
        } else {
          alert('Error al valorar la serie: ' + result.error)
        }
      } else {
        const error = await response.json()
        alert('Error: ' + error.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error de conexión')
    } finally {
      setIsRatingLoading(false)
    }
  }

  // Función para renderizar estrellas
  const renderStars = (rating: number, interactive = false, size = 'w-4 h-4') => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= rating
      const isHovered = interactive && i <= hoverRating
      
      stars.push(
        <button
          key={i}
          onClick={interactive ? () => handleRating(i) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          disabled={!interactive || isRatingLoading}
          className={`${size} ${
            interactive 
              ? 'hover:scale-110 transition-transform cursor-pointer disabled:cursor-not-allowed' 
              : 'cursor-default'
          } ${
            isFilled || isHovered 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
      )
    }
    return stars
  }

  return (
    <article className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden group">
      {/* Poster Image */}
      <div className="relative h-64 bg-gray-200">
        {posterUrl ? (
          <img 
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-6xl">🎬</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 ${statusColor} text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg`}>
          {statusText}
        </div>
        
        {/* IMDB Rating */}
        <div className="absolute top-3 left-3 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg">
          IMDb ⭐ {imdbRating}
        </div>

        {/* User Rating */}
        {averageRating > 0 && (
          <div className="absolute top-16 left-3 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            <div className="flex items-center gap-1">
              <span className="text-yellow-300">✦</span>
              <span>{averageRating.toFixed(1)}</span>
              <span className="text-xs opacity-80">({totalRatings})</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100">
          {isAuthenticated && (
            <>
              <button
                onClick={handleLike}
                disabled={isLoading}
                title={isLiked ? "Quitar de favoritas" : "Marcar como favorita"}
                className={`p-3 sm:p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation ${
                  isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-red-50'
                }`}
              >
                <svg className={`w-5 h-5 sm:w-4 sm:h-4 ${isLiked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              
              <button
                onClick={handleBookmark}
                disabled={isLoading}
                title={isBookmarked ? "Quitar de mi lista" : "Agregar a mi lista"}
                className={`p-3 sm:p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation ${
                  isBookmarked ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'
                }`}
              >
                <svg className={`w-5 h-5 sm:w-4 sm:h-4 ${isBookmarked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Network */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">{title}</h3>
          <p className="text-sm text-gray-600">{network} • {startYear}{endYear ? `-${endYear}` : ''}</p>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-2 mb-4">
          {genre.slice(0, 3).map((g, index) => (
            <span 
              key={index}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium hover:bg-blue-200 transition-colors"
            >
              {g}
            </span>
          ))}
          {genre.length > 3 && (
            <span className="text-xs text-gray-500 px-2 py-1">
              +{genre.length - 3} más
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {description}
        </p>

        {/* User Rating Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Valoración de usuarios:</span>
            {averageRating > 0 && (
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)}/5 ({totalRatings} valoraciones)
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {renderStars(hoverRating || userRating, isAuthenticated, 'w-6 h-6')}
            </div>
            {isAuthenticated && (
              <span className="text-xs text-gray-500">
                {userRating > 0 ? `Tu valoración: ${userRating}/5` : 'Haz clic para valorar'}
              </span>
            )}
          </div>
          
          {!isAuthenticated && (
            <p className="text-xs text-gray-500 mt-1">
              Inicia sesión para valorar esta serie
            </p>
          )}
        </div>

        {/* Platforms */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Disponible en:</p>
          <div className="flex flex-wrap gap-2 items-center">
            {platforms.slice(0, 4).map((platform, index) => {
              // URLs de las plataformas principales
              const platformUrls: Record<string, string> = {
                'Netflix': 'https://www.netflix.com',
                'HBO Max': 'https://www.hbomax.com',
                'Prime Video': 'https://www.primevideo.com',
                'Amazon Prime Video': 'https://www.primevideo.com',
                'Disney+': 'https://www.disneyplus.com',
                'Apple TV+': 'https://tv.apple.com',
                'Paramount+': 'https://www.paramountplus.com',
                'Peacock': 'https://www.peacocktv.com',
                'Hulu': 'https://www.hulu.com',
                'Max': 'https://www.max.com',
                'Starz': 'https://www.starz.com',
                'Showtime': 'https://www.showtime.com',
                'FOX': 'https://www.fox.com',
                'FX': 'https://www.fxnetworks.com',
                'AMC': 'https://www.amc.com'
              }
              
              const platformUrl = platformUrls[platform.name]
              
              return platformUrl ? (
                <a
                  key={index}
                  href={platformUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md text-xs font-medium transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  title={`Ver en ${platform.name}${platform.isPremium ? ' (Premium)' : ''}`}
                >
                  {platform.name}
                  {platform.isPremium && ' 💎'}
                </a>
              ) : (
                <span 
                  key={index} 
                  className="bg-gray-100 px-2 py-1 rounded-md text-xs font-medium"
                  title={`${platform.name}${platform.isPremium ? ' (Premium)' : ''}`}
                >
                  {platform.name}
                  {platform.isPremium && ' 💎'}
                </span>
              )
            })}
            {platforms.length > 4 && (
              <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-md">
                +{platforms.length - 4} más
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* Trailer Button */}
          {trailerUrl && (
            <button
              onClick={handleTrailer}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-gray-600 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Ver Trailer 🎬
            </button>
          )}
          
          {/* Analysis Button */}
          <a 
            href={`/series/${slug}`}
            className="block w-full bg-gradient-to-r from-gray-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-center py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
          >
            Ver Análisis 📖
          </a>
        </div>
      </div>
    </article>
  )
}
