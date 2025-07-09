import type { ReactElement } from 'react'

interface PlatformLogoProps {
  platform: {
    name: string
    available: boolean
    isPremium: boolean
  }
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}

const PlatformLogo = ({ platform, size = 'md', showName = true }: PlatformLogoProps): ReactElement => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  }

  // Función para obtener el logo específico de cada plataforma
  const getPlatformLogo = (platformName: string) => {
    switch (platformName.toLowerCase()) {
      case 'netflix':
        return (
          <div className="bg-red-600 text-white rounded-md p-1 font-bold text-center">
            <span className="text-xs">N</span>
          </div>
        )
      case 'prime video':
      case 'amazon prime':
      case 'amazon':
        return (
          <div className="bg-blue-500 text-white rounded-md p-1 font-bold text-center">
            <span className="text-xs">P</span>
          </div>
        )
      case 'hbo max':
      case 'hbo':
      case 'max':
        return (
          <div className="bg-purple-600 text-white rounded-md p-1 font-bold text-center">
            <span className="text-xs">H</span>
          </div>
        )
      case 'disney+':
      case 'disney':
        return (
          <div className="bg-blue-700 text-white rounded-md p-1 font-bold text-center">
            <span className="text-xs">D+</span>
          </div>
        )
      case 'apple tv+':
      case 'apple tv':
        return (
          <div className="bg-black text-white rounded-md p-1 font-bold text-center">
            <span className="text-xs">A</span>
          </div>
        )
      case 'paramount+':
      case 'paramount':
        return (
          <div className="bg-blue-600 text-white rounded-md p-1 font-bold text-center">
            <span className="text-xs">P+</span>
          </div>
        )
      case 'hulu':
        return (
          <div className="bg-green-500 text-white rounded-md p-1 font-bold text-center">
            <span className="text-xs">H</span>
          </div>
        )
      case 'starz':
        return (
          <div className="bg-black text-white rounded-md p-1 font-bold text-center">
            <span className="text-xs">S</span>
          </div>
        )
      case 'showtime':
        return (
          <div className="bg-red-700 text-white rounded-md p-1 font-bold text-center">
            <span className="text-xs">ST</span>
          </div>
        )
      case 'peacock':
        return (
          <div className="bg-yellow-500 text-white rounded-md p-1 font-bold text-center">
            <span className="text-xs">P</span>
          </div>
        )
      default:
        return (
          <div className="bg-gray-500 text-white rounded-md p-1 font-bold text-center">
            <span className="text-xs">TV</span>
          </div>
        )
    }
  }

  const sizeClass = sizeClasses[size]

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${sizeClass} rounded-lg flex items-center justify-center bg-white shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200`}
        title={platform.name}
      >
        {getPlatformLogo(platform.name)}
      </div>
      {showName && (
        <span className="text-base font-semibold text-gray-800">
          {platform.name}
          {platform.isPremium && ' 💎'}
        </span>
      )}
    </div>
  )
}

export default PlatformLogo
