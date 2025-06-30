import type { ReactElement } from 'react'
import { useState } from 'react'

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
  platforms: Array<{
    name: string
    available: boolean
    isPremium: boolean
  }>
  slug: string
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
  platforms,
  slug
}: SerieCardProps): ReactElement {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

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

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsBookmarked(!isBookmarked)
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
          ⭐ {imdbRating}
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleLike}
            className={`p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
              isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-red-50'
            }`}
          >
            <svg className={`w-4 h-4 ${isLiked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
              isBookmarked ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'
            }`}
          >
            <svg className={`w-4 h-4 ${isBookmarked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
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

        {/* Platforms */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Disponible en:</p>
          <div className="flex flex-wrap gap-2">
            {platforms.slice(0, 3).map((platform, index) => {
              // URLs de las plataformas principales
              const platformUrls: Record<string, string> = {
                'Netflix': 'https://www.netflix.com',
                'HBO Max': 'https://www.hbomax.com',
                'Prime Video': 'https://www.primevideo.com',
                'Amazon Prime Video': 'https://www.primevideo.com',
                'Disney+': 'https://www.disneyplus.com',
                'Apple TV+': 'https://tv.apple.com',
                'FOX': 'https://www.fox.com',
                'Showtime': 'https://www.showtime.com',
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
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 hover:scale-105 hover:shadow-md ${
                    platform.isPremium 
                      ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                  onClick={(e) => e.stopPropagation()} // Prevenir que se active el clic del card
                  title={`Ver en ${platform.name}`}
                >
                  {platform.name}
                  {platform.isPremium && ' 💎'}
                </a>
              ) : (
                <span 
                  key={index}
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    platform.isPremium 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {platform.name}
                  {platform.isPremium && ' 💎'}
                </span>
              )
            })}
            {platforms.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{platforms.length - 3} más
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <a 
          href={`/series/${slug}`}
          className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-center py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
        >
          Ver Análisis 📖
        </a>
      </div>
    </article>
  )
}
