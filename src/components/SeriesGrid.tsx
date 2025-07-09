import { useState, useEffect } from 'react'
import SerieCard from './SerieCard'
import SeriesFilter from './SeriesFilter'
import SearchBar from './SearchBar'
import type { Serie } from '../lib/mongo'

interface SeriesGridProps {
  initialSeries: Serie[]
  userFavorites?: string[]
  userWatchlist?: string[]
  isAuthenticated?: boolean
}

interface SerieRatings {
  userRating: number
  averageRating: number
  totalRatings: number
}

type RatingsMap = Record<string, SerieRatings>

export default function SeriesGrid({ initialSeries, userFavorites = [], userWatchlist = [], isAuthenticated = false }: SeriesGridProps) {
  const [filteredSeries, setFilteredSeries] = useState<Serie[]>(initialSeries)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentFilter, setCurrentFilter] = useState<Serie[]>(initialSeries)
  
  // Estado local para favoritos y watchlist
  const [localFavorites, setLocalFavorites] = useState<string[]>(userFavorites)
  const [localWatchlist, setLocalWatchlist] = useState<string[]>(userWatchlist)
  
  // Estado para valoraciones
  const [ratingsMap, setRatingsMap] = useState<RatingsMap>({})
  const [ratingsLoaded, setRatingsLoaded] = useState(false)

  // Función para manejar cambios en favoritos
  const handleFavoriteChange = (slug: string, isFavorite: boolean) => {
    setLocalFavorites(prev => 
      isFavorite 
        ? [...prev, slug]
        : prev.filter(s => s !== slug)
    )
  }

  // Función para manejar cambios en watchlist
  const handleWatchlistChange = (slug: string, isInWatchlist: boolean) => {
    setLocalWatchlist(prev => 
      isInWatchlist 
        ? [...prev, slug]
        : prev.filter(s => s !== slug)
    )
  }

  // Función para manejar cambios en valoraciones
  const handleRatingChange = (slug: string, userRating: number, averageRating: number, totalRatings: number) => {
    setRatingsMap(prev => ({
      ...prev,
      [slug]: {
        userRating,
        averageRating,
        totalRatings
      }
    }))
  }

  // Aplicar búsqueda sobre las series filtradas
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSeries(currentFilter)
      return
    }

    const searchResults = currentFilter.filter(serie =>
      (serie.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (serie.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (serie.genre || []).some(g => (g || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
      (serie.network || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    setFilteredSeries(searchResults)
  }, [searchQuery, currentFilter])

  const handleFilteredSeriesChange = (series: Serie[]) => {
    setCurrentFilter(series)
    // Si hay búsqueda activa, aplicarla sobre los nuevos resultados filtrados
    if (searchQuery.trim()) {
      const searchResults = series.filter(serie =>
        (serie.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (serie.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (serie.genre || []).some(g => (g || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
        (serie.network || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSeries(searchResults)
    } else {
      setFilteredSeries(series)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Función para cargar valoraciones de todas las series
  const loadAllRatings = async () => {
    if (ratingsLoaded) return
    
    try {
      // Crear lista de slugs de todas las series
      const seriesSlugs = initialSeries.map(serie => serie.slug)
      
      // Hacer una sola llamada a la API batch
      const response = await fetch(`/api/ratings-batch?serieSlug=${seriesSlugs.join(',')}`)
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.ratings) {
          setRatingsMap(result.ratings)
        } else {
          console.error('Error in batch ratings response:', result)
        }
      } else {
        console.error('Error loading batch ratings:', response.status)
      }
      
      setRatingsLoaded(true)
    } catch (error) {
      console.error('Error loading ratings:', error)
      setRatingsLoaded(true)
    }
  }

  // Cargar valoraciones cuando el componente se monta
  useEffect(() => {
    if (!ratingsLoaded) {
      loadAllRatings()
    }
  }, [ratingsLoaded])

  // Actualizar valoraciones del usuario cuando cambie el estado de autenticación
  useEffect(() => {
    if (isAuthenticated && ratingsLoaded) {
      // Recargar valoraciones para incluir las del usuario
      setRatingsLoaded(false) // Resetear para permitir recarga
    }
  }, [isAuthenticated])

  return (
    <>
      <SearchBar onSearch={handleSearch} placeholder="Buscar por título, género, cadena..." />
      
      <SeriesFilter 
        series={initialSeries} 
        onFilteredSeriesChange={handleFilteredSeriesChange}
      />
      
      {/* Results Info */}
      {(searchQuery || filteredSeries.length !== initialSeries.length) && (
        <div className="mb-6 text-center">
          <p className="text-gray-600">
            Mostrando <span className="font-semibold text-blue-600">{filteredSeries.length}</span> de <span className="font-semibold">{initialSeries.length}</span> series
            {searchQuery && (
              <span className="text-sm text-gray-500 block mt-1">
                Resultados para: "<span className="italic">{searchQuery}</span>"
              </span>
            )}
          </p>
        </div>
      )}
      
      {/* Series Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSeries.map((serie) => {
          const ratings = ratingsMap[serie.slug] || { userRating: 0, averageRating: 0, totalRatings: 0 }
          
          return (
            <SerieCard
              key={serie.slug}
              title={serie.title}
              description={serie.description}
              genre={serie.genre}
              network={serie.network}
              startYear={serie.startYear}
              endYear={serie.endYear}
              status={serie.status}
              imdbRating={serie.imdbRating}
              posterUrl={serie.posterUrl}
              trailerUrl={serie.trailerUrl}
              platforms={serie.platforms}
              slug={serie.slug}
              isFavorite={localFavorites.includes(serie.slug)}
              isInWatchlist={localWatchlist.includes(serie.slug)}
              isAuthenticated={isAuthenticated}
              onFavoriteChange={handleFavoriteChange}
              onWatchlistChange={handleWatchlistChange}
              onRatingChange={handleRatingChange}
              userRating={ratings.userRating}
              averageRating={ratings.averageRating}
              totalRatings={ratings.totalRatings}
            />
          )
        })}
      </div>

      {/* Empty State */}
      {filteredSeries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            {searchQuery ? '🔍' : '📺'}
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchQuery ? 'No se encontraron resultados' : 'No hay series disponibles'}
          </h3>
          <p className="text-gray-500">
            {searchQuery 
              ? 'Prueba con otros términos de búsqueda o ajusta los filtros.'
              : 'Prueba con otros filtros para ver más resultados.'
            }
          </p>
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}
    </>
  )
}
