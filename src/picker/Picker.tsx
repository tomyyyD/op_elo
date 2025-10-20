import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import logoUrl from '../assets/joly-roger.png'
import type { Character } from '../types'
import { getApiUrl } from '../utility/api'
import CharacterCard from './CharacterCard'
import './Picker.css'

const ELO_FACTOR = 50;

function calculateElo(winner: Character, loser: Character): [number, number] {
  const pWinner = (1.0 / (1.0 + 10**((loser.elo - winner.elo) / 400)));
  const pLoser = (1.0 / (1.0 + 10**((winner.elo - loser.elo) / 400)));

  const winnerElo = winner.elo + ELO_FACTOR * (1 - pWinner);
  const loserElo = loser.elo + ELO_FACTOR * (0 - pLoser);

  return [winnerElo, loserElo];
}

function calculateChange(character: Character, new_elo: number): number {
  // if recent change and the elo change are the same sign
  // then we keep adding otherwise we set recent change to be
  // the change in elo
  
  const eloChange = new_elo - character.elo;
  const recentChange = character.recent_change;
  
  // Check if both changes have the same sign (both positive, both negative, or one is zero)
  if ((eloChange >= 0 && recentChange >= 0) || (eloChange <= 0 && recentChange <= 0)) {
    return recentChange + eloChange;
  } else {
    return eloChange;
  }
}

function Picker() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentCharacters, setCurrentCharacters] = useState<Character[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [matchupsCompleted, setMatchupsCompleted] = useState(0)
  const [correctPredictions, setCorrectPredictions] = useState(0)
  const isInitializedRef = useRef(false)
  
  // Cache for optimized character lookups
  const charactersMapRef = useRef<Map<string, Character>>(new Map())

  // Update the characters map when characters array changes
  useEffect(() => {
    const newMap = new Map<string, Character>()
    characters.forEach(char => newMap.set(char.id, char))
    charactersMapRef.current = newMap
  }, [characters])

  // Optimized shuffle that doesn't copy entire array - just picks random indices
  const getRandomCharacter = (excludeIds: Set<string> = new Set()): Character | null => {
    const availableChars = characters.filter(char => !excludeIds.has(char.id))
    if (availableChars.length === 0) return null
    return availableChars[Math.floor(Math.random() * availableChars.length)]
  }

  // Optimized character filtering with early exit
  const findSimilarEloCharacter = (targetElo: number, excludeIds: Set<string>): Character | null => {
    const eloRange = 100
    const minElo = targetElo - eloRange
    const maxElo = targetElo + eloRange
    
    // First pass: look for characters in ELO range
    const candidates: Character[] = []
    for (const char of characters) {
      if (excludeIds.has(char.id)) continue
      if (char.elo >= minElo && char.elo <= maxElo) {
        candidates.push(char)
      }
    }
    
    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)]
    }
    
    // Fallback: any character not in excludeIds
    return getRandomCharacter(excludeIds)
  }

  const loadNewMatchup = (charactersArray: Character[]) => {
    if (charactersArray.length < 2) return

    // Get a completely random character C
    const characterC = getRandomCharacter()
    if (!characterC) return

    // Find a character with similar ELO to C
    const excludeIds = new Set([characterC.id])
    const characterD = findSimilarEloCharacter(characterC.elo, excludeIds)
    if (!characterD) return

    setCurrentCharacters([characterC, characterD])
  }

  // Optimized character update using Map for O(1) lookups
  const updateCharactersOptimized = (selectedChar: Character, otherChar: Character, winnerElo: number, loserElo: number, winnerChange: number, loserChange: number) => {
    setCharacters(prevCharacters => {
      // Only update the two characters that changed
      return prevCharacters.map(char => {
        if (char.id === selectedChar.id) {
          return {
            ...char,
            wins: char.wins + 1,
            elo: Math.round(winnerElo),
            recent_change: Math.round(winnerChange)
          }
        } else if (char.id === otherChar.id) {
          return {
            ...char,
            losses: char.losses + 1,
            elo: Math.round(loserElo),
            recent_change: Math.round(loserChange)
          }
        }
        return char
      })
    })
  }

  useEffect(() => {
    const initializeMatchup = (data: Character[]) => {
      if (data.length < 2) return
      
      if (isInitializedRef.current) {
        console.log('Preventing double initialization due to React StrictMode')
        return
      }

      console.log('Initializing matchup with characters:', data.length)
      
      // Get a completely random character C
      const characterC = data[Math.floor(Math.random() * data.length)]

      // Find a character with similar ELO to C
      const excludeIds = new Set([characterC.id])
      const eloRange = 100
      const minElo = characterC.elo - eloRange
      const maxElo = characterC.elo + eloRange
      
      // Find characters within ELO range, excluding C
      const candidateCharacters = data.filter(char => 
        !excludeIds.has(char.id) && 
        char.elo >= minElo && 
        char.elo <= maxElo
      )
      
      let characterD
      if (candidateCharacters.length === 0) {
        // Fallback: if no characters in range, get any available character except C
        const fallbackCandidates = data.filter(char => !excludeIds.has(char.id))
        characterD = fallbackCandidates[Math.floor(Math.random() * fallbackCandidates.length)]
      } else {
        // Randomly select from candidates within ELO range
        characterD = candidateCharacters[Math.floor(Math.random() * candidateCharacters.length)]
      }

      console.log('Selected characters:', characterC.first_name, 'vs', characterD.first_name)
      setCurrentCharacters([characterC, characterD])
      isInitializedRef.current = true
    }

    const fetchCharacters = async () => {
      try {
        setLoading(true)
        const response = await fetch(getApiUrl('/characters'))
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setCharacters(data)
        setError(null)
        
        // Initialize with first random matchup
        if (data.length >= 2) {
          initializeMatchup(data)
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

  const handleCharacterSelection = async (selectedIndex: number) => {
    if (isProcessing || isAnimating) return
  
    const startTime = performance.now()
    console.log('Starting character selection...')
    
    setIsProcessing(true)
    setIsAnimating(true) // Start fade out immediately
    setMatchupsCompleted(prev => prev + 1)

    const selectedChar = currentCharacters[selectedIndex]
    const otherChar = currentCharacters[selectedIndex === 0 ? 1 : 0]

    // Calculate new ELOs
    const [winnerElo, loserElo] = calculateElo(selectedChar, otherChar);
    const winnerChange = calculateChange(selectedChar, winnerElo);
    const loserChange = calculateChange(otherChar, loserElo);

    // Check if prediction was correct (user picked higher ELO character)
    if (selectedChar.elo >= otherChar.elo) {
      setCorrectPredictions(prev => prev + 1)
    }

    // Start processing immediately (parallel with fade out)
    const apiStartTime = performance.now()
    const processingPromise = (async () => {
      try {
        // Run API calls in parallel for better performance
        await Promise.all([
          fetch(getApiUrl(`/characters/${selectedChar.id}/elo`), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              wins_change: 1,
              losses_change: 0,
              elo_change: Math.round(winnerElo - selectedChar.elo),
              recent_change: Math.round(selectedChar.recent_change)
            })
          }),
          fetch(getApiUrl(`/characters/${otherChar.id}/elo`), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              wins_change: 0,
              losses_change: 1,
              elo_change: Math.round(loserElo - otherChar.elo),
              recent_change: Math.round(otherChar.recent_change)
            })
          })
        ]);

        const apiEndTime = performance.now()
        console.log(`API calls completed in ${(apiEndTime - apiStartTime).toFixed(2)}ms`)

        const updateStartTime = performance.now()
        // Use optimized character update
        updateCharactersOptimized(selectedChar, otherChar, winnerElo, loserElo, winnerChange, loserChange)
        
        // Load completely new matchup
        loadNewMatchup(characters)
        
        const totalTime = performance.now() - startTime
        console.log(`Character update completed in ${(performance.now() - updateStartTime).toFixed(2)}ms`)
        console.log(`Total processing time: ${totalTime.toFixed(2)}ms`)

      } catch (err) {
        console.error('Error updating character Elos:', err);
        // Even if API fails, load new matchup
        loadNewMatchup(characters)
      }
    })()

    // Wait for either fade out animation (300ms) OR processing to complete, whichever is longer
    const fadeOutDelay = new Promise(resolve => setTimeout(resolve, 300))
    
    await Promise.all([fadeOutDelay, processingPromise])
    
    // Now start fade in animation
    setIsAnimating(false)
    setIsProcessing(false)
    
    const totalTime = performance.now() - startTime
    console.log(`Total operation time (including animations): ${totalTime.toFixed(2)}ms`)
  }
  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <div className='flex flex-row justify-center items-center py-4 px-4'>
        <Link to="/" className='flex flex-row items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity'>
          <img src={logoUrl} className='h-10 md:h-12' alt="Strawhat joly roger" />
          <h1 className='font-bold text-lg md:text-xl'>One Piece Elo</h1>
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-6 md:mb-8 px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">Character Matchup Picker</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            Help contribute to the community rankings by choosing the winner in randomly selected matchups 
            between One Piece's strongest characters.
          </p>
        </div>

        {/* Matchup Card */}
        <div className="max-w-4xl mx-auto px-2 md:px-0">
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 lg:p-8">
            <h3 className="text-black text-xl font-semibold text-center my-3">
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span>Processing your choice...</span>
                </div>
              ) : (
                'Who would win?'
              )}
            </h3>
            
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
              <div className="relative" style={{ minHeight: '500px' }}>
                {/* Desktop Layout - Horizontal */}
                <div className="hidden md:block relative w-full h-full flex justify-center items-center" style={{ minHeight: '500px' }}>
                  
                  {/* Left Character Card */}
                  {currentCharacters[0] && (
                    <div className={`absolute transition-all duration-200 ease-in-out ${
                      isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    }`} style={{ left: '8%', width: '40%' }}>
                      <CharacterCard
                        key={`left-${currentCharacters[0].id}`}
                        character={currentCharacters[0]}
                        onSelect={() => handleCharacterSelection(0)}
                        disabled={isProcessing}
                        buttonColor="blue"
                        className=""
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}

                  {/* Right Character Card */}
                  {currentCharacters[1] && (
                    <div className={`absolute transition-all duration-200 ease-in-out ${
                      isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    }`} style={{ left: '52%', width: '40%' }}>
                      <CharacterCard
                        key={`right-${currentCharacters[1].id}`}
                        character={currentCharacters[1]}
                        onSelect={() => handleCharacterSelection(1)}
                        disabled={isProcessing}
                        buttonColor="red"
                        className=""
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}

                  {/* VS Divider - Desktop horizontal layout */}
                  <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 transition-opacity duration-200 ${
                    isAnimating ? 'opacity-30' : 'opacity-100'
                  }`}>
                    <div className="bg-white px-4 py-2 rounded-full border-2 border-gray-300 font-bold text-gray-600 shadow-lg text-base">
                      VS
                    </div>
                  </div>
                </div>

                {/* Mobile Layout - Vertical Stack */}
                <div className="md:hidden relative w-full flex flex-col items-center justify-center py-4" style={{ minHeight: '500px' }}>
                  
                  {/* First Character Card */}
                  {currentCharacters[0] && (
                    <div className={`w-full max-w-xs transition-all duration-200 ease-in-out ${
                      isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    }`}>
                      <CharacterCard
                        key={`mobile-left-${currentCharacters[0].id}`}
                        character={currentCharacters[0]}
                        onSelect={() => handleCharacterSelection(0)}
                        disabled={isProcessing}
                        buttonColor="blue"
                        className=""
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}

                  {/* VS Divider - Mobile vertical layout */}
                  <div className={`z-10 transition-opacity duration-200 ${
                    isAnimating ? 'opacity-30' : 'opacity-100'
                  }`}>
                    <div className="bg-white px-3 py-1 rounded-full border-2 border-gray-300 font-bold text-gray-600 shadow-lg text-sm">
                      VS
                    </div>
                  </div>

                  {/* Second Character Card */}
                  {currentCharacters[1] && (
                    <div className={`w-full max-w-xs transition-all duration-200 ease-in-out ${
                      isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    }`}>
                      <CharacterCard
                        key={`mobile-right-${currentCharacters[1].id}`}
                        character={currentCharacters[1]}
                        onSelect={() => handleCharacterSelection(1)}
                        disabled={isProcessing}
                        buttonColor="red"
                        className=""
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}
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
                <div className="text-gray-600">Agreed Predictions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {matchupsCompleted > 0 ? Math.round((correctPredictions / matchupsCompleted) * 100) : 0}%
                </div>
                <div className="text-gray-600">Agreement Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Picker
