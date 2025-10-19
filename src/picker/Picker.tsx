import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import logoUrl from '../assets/joly-roger.png'
import CharacterCard from './CharacterCard'
import './Picker.css'

interface Character {
  id: string
  first_name: string
  elo: number
  image_path: string | null
}

function Picker() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentCharacters, setCurrentCharacters] = useState<Character[]>([])
  const [nextCharacter, setNextCharacter] = useState<Character | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [matchupsCompleted, setMatchupsCompleted] = useState(0)
  const [correctPredictions, setCorrectPredictions] = useState(0)

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/characters')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setCharacters(data)
        setError(null)
        
        // Initialize with two random characters and prepare next one
        if (data.length >= 3) {
          const randomChars = getRandomCharacters(data, 3)
          setCurrentCharacters([randomChars[0], randomChars[1]])
          setNextCharacter(randomChars[2])
        }
      } catch (err) {
        console.error('Error fetching characters:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch characters')
      } finally {
        setLoading(false)
      }
    }

    fetchCharacters()
  }, [])

  const getRandomCharacters = (charList: Character[], count: number): Character[] => {
    const shuffled = [...charList].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  const handleCharacterSelection = (selectedIndex: number) => {
    if (isAnimating || !nextCharacter) return

    setIsAnimating(true)
    setMatchupsCompleted(prev => prev + 1)

    // Simple logic: if user picks the character with higher Elo, it's "correct"
    const selectedChar = currentCharacters[selectedIndex]
    const otherChar = currentCharacters[selectedIndex === 0 ? 1 : 0]
    
    if (selectedChar.elo > otherChar.elo) {
      setCorrectPredictions(prev => prev + 1)
    }

    // Start the carousel animation - the right character always moves to left position
    setTimeout(() => {
      // Always move the right character (currentCharacters[1]) to the left position
      // And the next character moves to the right position
      setCurrentCharacters([currentCharacters[1], nextCharacter])
      
      // Get a new next character
      const availableChars = characters.filter(char => 
        char.id !== currentCharacters[1].id && char.id !== nextCharacter.id
      )
      
      if (availableChars.length > 0) {
        const newNextChar = getRandomCharacters(availableChars, 1)[0]
        setNextCharacter(newNextChar)
      } else {
        setNextCharacter(null)
      }
      
      setIsAnimating(false)
    }, 500) // Match this with CSS animation duration
  }
  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <div className='flex flex-row justify-center items-center py-4'>
        <Link to="/" className='flex flex-row items-center gap-3 hover:opacity-80 transition-opacity'>
          <img src={logoUrl} className='h-12' alt="Strawhat joly roger" />
          <h1 className='font-bold text-xl'>One Piece Elo</h1>
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Character Matchup Picker</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Help contribute to the community rankings by choosing the winner in randomly selected matchups 
            between One Piece's strongest characters.
          </p>
        </div>

        {/* Matchup Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h3 className="text-black text-xl font-semibold text-center my-3">Who would win in a fight?</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Loading characters...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Characters</div>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="relative overflow-hidden" style={{ minHeight: '450px' }}>
                {/* Character Container with Carousel Animation */}
                <div className="relative w-full h-full flex justify-center items-center" style={{ minHeight: '450px' }}>
                  
                  {/* Left Character Card */}
                  {currentCharacters[0] && (
                    <CharacterCard
                      key={`left-${currentCharacters[0].id}`}
                      character={currentCharacters[0]}
                      onSelect={() => handleCharacterSelection(0)}
                      disabled={isAnimating}
                      buttonColor="blue"
                      className={`${
                        isAnimating ? '-translate-x-full opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'
                      }`}
                      style={{ 
                        left: '8%',
                        width: '40%',
                        zIndex: isAnimating ? 1 : 2
                      }}
                    />
                  )}

                  {/* Right Character Card (slides to left position during animation) */}
                  {currentCharacters[1] && (
                    <CharacterCard
                      key={`right-${currentCharacters[1].id}`}
                      character={currentCharacters[1]}
                      onSelect={() => handleCharacterSelection(1)}
                      disabled={isAnimating}
                      buttonColor="red"
                      className="translate-x-0"
                      style={{ 
                        left: isAnimating ? '8%' : '52%',
                        width: '40%',
                        zIndex: 2
                      }}
                    />
                  )}

                  {/* Next Character Card (slides in from right during animation) */}
                  {nextCharacter && (
                    <CharacterCard
                      key={`next-${nextCharacter.id}`}
                      character={nextCharacter}
                      onSelect={() => {}} // No action for next character
                      disabled={true}
                      buttonColor="gray"
                      className={`${
                        isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                      }`}
                      style={{ 
                        left: isAnimating ? '52%' : '120%',
                        width: '40%',
                        zIndex: 1
                      }}
                    />
                  )}
                </div>

                {/* VS Divider - positioned between the two visible cards */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-white px-3 md:px-4 py-1 md:py-2 rounded-full border-2 border-gray-300 font-bold text-gray-600 shadow-lg text-sm md:text-base">
                    VS
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Your Contribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{matchupsCompleted}</div>
                <div className="text-gray-600">Matchups Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{correctPredictions}</div>
                <div className="text-gray-600">Correct Predictions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {matchupsCompleted > 0 ? Math.round((correctPredictions / matchupsCompleted) * 100) : 0}%
                </div>
                <div className="text-gray-600">Accuracy Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Picker
