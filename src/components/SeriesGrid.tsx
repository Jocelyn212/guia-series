import { useState, useEffect } from 'react'
import SerieCard from './SerieCard'
import SeriesFilter from './SeriesFilter'
import SearchBar from './SearchBar'
import type { Serie } from '../lib/mongo'

interface SeriesGridProps {
  initialSeries: Serie[]
}

export default function SeriesGrid({ initialSeries }: SeriesGridProps) {
  const [filteredSeries, setFilteredSeries] = useState<Serie[]>(initialSeries)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentFilter, setCurrentFilter] = useState<Serie[]>(initialSeries)

  // Aplicar búsqueda sobre las series filtradas
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSeries(currentFilter)
      return
    }

    const searchResults = currentFilter.filter(serie =>
      serie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      serie.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      serie.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
      serie.network.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    setFilteredSeries(searchResults)
  }, [searchQuery, currentFilter])

  const handleFilteredSeriesChange = (series: Serie[]) => {
    setCurrentFilter(series)
    // Si hay búsqueda activa, aplicarla sobre los nuevos resultados filtrados
    if (searchQuery.trim()) {
      const searchResults = series.filter(serie =>
        serie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        serie.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        serie.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
        serie.network.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSeries(searchResults)
    } else {
      setFilteredSeries(series)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

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
        {filteredSeries.map((serie) => (
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
            platforms={serie.platforms}
            slug={serie.slug}
          />
        ))}
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
