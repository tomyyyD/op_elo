import React from 'react'
import type { Character } from '../types'
import { getProxiedImageUrl } from '../utility/utility'

interface CharacterCardProps {
  character: Character
  onSelect: () => void
  disabled: boolean
  buttonColor: 'blue' | 'red' | 'gray'
  className?: string
  style?: React.CSSProperties
}

// // Utility function to get proxied image URL
// const getProxiedImageUrl = (originalUrl: string | null): string => {
//   if (!originalUrl) return '';
  
//   // If it's already a local URL, return as-is
//   if (originalUrl.startsWith('/') || originalUrl.startsWith(window.location.origin)) {
//     return originalUrl;
//   }
  
//   // Use query parameter to match backend implementation
//   const encodedUrl = encodeURIComponent(originalUrl);
//   return `/api/image-proxy?url=${encodedUrl}`;
// };

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onSelect,
  disabled,
  buttonColor,
  className = '',
  style
}) => {
  const getCardColorClasses = () => {
    if (disabled && buttonColor === 'gray') {
      return 'bg-gray-200 cursor-not-allowed'
    }
    
    switch (buttonColor) {
      case 'blue':
        return 'bg-gray-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
      case 'red':
        return 'bg-gray-200 hover:bg-red-50 hover:border-red-300 cursor-pointer'
      default:
        return 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
    }
  }

  const getTextColorClasses = () => {
    if (disabled && buttonColor === 'gray') {
      return 'text-gray-600'
    }
    return 'text-black'
  }

  return (
    <div 
      className={`absolute transition-all duration-500 ease-in-out ${className}`}
      style={style}
    >
      <button
        onClick={disabled ? undefined : onSelect}
        disabled={disabled}
        className="w-full text-center block"
      >
        <div className={`rounded-lg p-6 md:p-8 my-3 shadow-md border-2 border-transparent transition-all duration-200 ${getCardColorClasses()}`}>
          <div className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-6 flex items-center justify-center overflow-hidden rounded-lg">
            {character.image_path ? (
              <img 
                src={getProxiedImageUrl(character.image_path)} 
                alt={character.first_name}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-full h-full bg-gray-300 flex items-center justify-center ${character.image_path ? 'hidden' : ''}`}>
              <span className="text-gray-500 text-sm md:text-base">No Image</span>
            </div>
          </div>
          <h4 className={`text-xl md:text-2xl font-semibold mb-2 ${getTextColorClasses()}`} style={{ height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{character.first_name}</h4>
          <p className="text-gray-600 text-base md:text-lg mb-4">Elo: {character.elo}</p>
          <p className="text-gray-600 text-base md:text-lg mb-4">Record: {character.wins}-{character.losses}</p>
        </div>
      </button>
    </div>
  )
}

export default CharacterCard