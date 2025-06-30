import type { Serie } from '../lib/mongo'

interface StatsDisplayProps {
  series: Serie[]
}

export default function StatsDisplay({ series }: StatsDisplayProps) {
  const ongoingSeries = series.filter(s => s.status === 'ongoing').length
  const totalPlatforms = new Set(series.flatMap(s => s.platforms.map(p => p.name))).size
  const averageRating = series.length > 0 
    ? (series.reduce((sum, s) => sum + s.imdbRating, 0) / series.length).toFixed(1)
    : '0.0'
  const totalGenres = new Set(series.flatMap(s => s.genre)).size

  const stats = [
    {
      value: series.length,
      label: 'Series Analizadas',
      icon: '🎬',
      color: 'bg-blue-500'
    },
    {
      value: ongoingSeries,
      label: 'En Emisión',
      icon: '📺',
      color: 'bg-green-500'
    },
    {
      value: totalPlatforms,
      label: 'Plataformas',
      icon: '🎯',
      color: 'bg-purple-500'
    },
    {
      value: averageRating,
      label: 'Rating Promedio',
      icon: '⭐',
      color: 'bg-yellow-500'
    },
    {
      value: totalGenres,
      label: 'Géneros',
      icon: '🎭',
      color: 'bg-pink-500'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-center"
        >
          <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center text-white text-xl mx-auto mb-2`}>
            {stat.icon}
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">
            {stat.value}
          </div>
          <div className="text-gray-600 text-sm">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}
