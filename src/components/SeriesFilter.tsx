import { useState } from 'react'
import type { Serie } from '../lib/mongo'

interface SeriesFilterProps {
  series: Serie[]
  onFilteredSeriesChange: (filteredSeries: Serie[]) => void
}

type FilterType = 'all' | 'ongoing' | 'ended' | 'cancelled' | string

export default function SeriesFilter({ series, onFilteredSeriesChange }: SeriesFilterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  // Obtener géneros únicos de todas las series
  const allGenres = Array.from(
    new Set(series.flatMap(serie => serie.genre))
  ).sort()

  // Obtener plataformas únicas
  const allPlatforms = Array.from(
    new Set(series.flatMap(serie => serie.platforms.map(p => p.name)))
  ).sort()

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter)
    
    let filteredSeries = series

    switch (filter) {
      case 'all':
        filteredSeries = series
        break
      case 'ongoing':
        filteredSeries = series.filter(serie => serie.status === 'ongoing')
        break
      case 'ended':
        filteredSeries = series.filter(serie => serie.status === 'ended')
        break
      case 'cancelled':
        filteredSeries = series.filter(serie => serie.status === 'cancelled')
        break
      default:
        // Filtrar por género
        if (allGenres.includes(filter)) {
          filteredSeries = series.filter(serie => 
            serie.genre.some(g => g.toLowerCase() === filter.toLowerCase())
          )
        }
        // Filtrar by plataforma
        else if (allPlatforms.includes(filter)) {
          filteredSeries = series.filter(serie =>
            serie.platforms.some(p => p.name === filter)
          )
        }
        break
    }

    onFilteredSeriesChange(filteredSeries)
  }

  const filters = [
    { key: 'all', label: 'Todas', count: series.length },
    { key: 'ongoing', label: 'En Emisión', count: series.filter(s => s.status === 'ongoing').length },
    { key: 'ended', label: 'Finalizadas', count: series.filter(s => s.status === 'ended').length },
    { key: 'cancelled', label: 'Canceladas', count: series.filter(s => s.status === 'cancelled').length },
  ]

  // Agregar géneros principales como filtros
  const mainGenres = ['Drama', 'Sci-Fi', 'Fantasy', 'Crime', 'Comedy', 'Horror', 'Thriller']
  const genreFilters = mainGenres
    .filter(genre => allGenres.some(g => g.toLowerCase().includes(genre.toLowerCase())))
    .map(genre => ({
      key: genre,
      label: genre,
      count: series.filter(s => 
        s.genre.some(g => g.toLowerCase().includes(genre.toLowerCase()))
      ).length
    }))
    .filter(filter => filter.count > 0)

  // Agregar principales plataformas como filtros
  const mainPlatforms = ['Netflix', 'HBO Max', 'Prime Video', 'Disney+', 'Apple TV+']
  const platformFilters = mainPlatforms
    .filter(platform => allPlatforms.includes(platform))
    .map(platform => ({
      key: platform,
      label: platform,
      count: series.filter(s => 
        s.platforms.some(p => p.name === platform)
      ).length
    }))
    .filter(filter => filter.count > 0)

  const allFilters = [...filters, ...genreFilters, ...platformFilters]

  return (
    <div className="mb-8">
      {/* Filter Categories */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Filtrar Series</h3>
        
        {/* Status Filters */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-3">Por Estado:</h4>
          <div className="flex flex-wrap gap-2 justify-center">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => handleFilterChange(filter.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilter === filter.key
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                }`}
              >
                {filter.label}
                <span className="ml-1 text-xs opacity-75">({filter.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Genre Filters */}
        {genreFilters.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Por Género:</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {genreFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => handleFilterChange(filter.key)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeFilter === filter.key
                      ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200 hover:shadow-md'
                  }`}
                >
                  {filter.label}
                  <span className="ml-1 text-xs opacity-75">({filter.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Platform Filters */}
        {platformFilters.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Por Plataforma:</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {platformFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => handleFilterChange(filter.key)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeFilter === filter.key
                      ? 'bg-green-600 text-white shadow-lg transform scale-105'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-md'
                  }`}
                >
                  {filter.label}
                  <span className="ml-1 text-xs opacity-75">({filter.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Indicador de resultados */}
      {activeFilter !== 'all' && (
        <div className="text-center mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm text-blue-700">
            📊 Mostrando series filtradas por: <span className="font-semibold text-blue-800">
              {allFilters.find(f => f.key === activeFilter)?.label}
            </span>
          </span>
          <button
            onClick={() => handleFilterChange('all')}
            className="ml-3 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}
