import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import logoUrl from '../assets/joly-roger.png'
import type { Character } from '../types'
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
        
        // Initialize with fair matchups
        if (data.length >= 3) {
          const shuffled = shuffleArray(data)
          
          // Start with first character
          const firstChar = shuffled[0]
          
          // Helper function to find fair matchup (inline to avoid dependency issues)
          const findFairMatchup = (targetElo: number, excludeIds: string[]): Character => {
            const eloRange = 100
            const minElo = targetElo - eloRange
            const maxElo = targetElo + eloRange
            
            const candidates = data.filter((char: Character) => 
              char.elo >= minElo && 
              char.elo <= maxElo && 
              !excludeIds.includes(char.id)
            )
            
            if (candidates.length === 0) {
              // Fallback to any available character
              const fallbacks = data.filter((char: Character) => !excludeIds.includes(char.id))
              return fallbacks[Math.floor(Math.random() * fallbacks.length)]
            }
            
            return candidates[Math.floor(Math.random() * candidates.length)]
          }
          
          // Find a fair matchup for the second character
          const secondChar = findFairMatchup(firstChar.elo, [firstChar.id])
          
          // Find a fair matchup for the next character based on the second character
          const thirdChar = findFairMatchup(secondChar.elo, [firstChar.id, secondChar.id])
          
          setCurrentCharacters([firstChar, secondChar])
          setNextCharacter(thirdChar)
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

  // Fisher-Yates shuffle algorithm for better randomness
  const shuffleArray = (array: Character[]): Character[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const getFairMatchupCharacter = (targetElo: number, excludeIds: string[] = []): Character | null => {
    const eloRange = 100
    const minElo = targetElo - eloRange
    const maxElo = targetElo + eloRange
    
    // Find characters within ELO range, excluding specified IDs
    const candidateCharacters = characters.filter(char => 
      char.elo >= minElo && 
      char.elo <= maxElo && 
      !excludeIds.includes(char.id)
    )
    
    if (candidateCharacters.length === 0) {
      // Fallback: if no characters in range, expand the range or get any available character
      const fallbackCandidates = characters.filter(char => !excludeIds.includes(char.id))
      if (fallbackCandidates.length === 0) return null
      
      const randomIndex = Math.floor(Math.random() * fallbackCandidates.length)
      return fallbackCandidates[randomIndex]
    }
    
    // Randomly select from candidates within ELO range
    const randomIndex = Math.floor(Math.random() * candidateCharacters.length)
    return candidateCharacters[randomIndex]
  }



  const handleCharacterSelection = async (selectedIndex: number) => {
    if (isAnimating || !nextCharacter) return
  
    setIsAnimating(true)
    setMatchupsCompleted(prev => prev + 1)

    // Simple logic: if user picks the character with higher Elo, it's "correct"
    const selectedChar = currentCharacters[selectedIndex]
    const otherChar = currentCharacters[selectedIndex === 0 ? 1 : 0]

    // Store the characters that will be used after animation
    const upcomingRightChar = nextCharacter // Current nextCharacter becomes new right
    // Get a fair matchup character for the next queue based on the upcoming right character's ELO
    const excludeIds = [
      currentCharacters[0].id, 
      currentCharacters[1].id, 
      upcomingRightChar.id
    ]
    const upcomingNextChar = getFairMatchupCharacter(upcomingRightChar.elo, excludeIds)

    // update elos
    const [winnerElo, loserElo] = calculateElo(selectedChar, otherChar);
    const winnerChange = calculateChange(selectedChar, winnerElo);
    const loserChange = calculateChange(otherChar, loserElo);

    // Update winner's Elo and stats
    try {
      await fetch(`/api/characters/${selectedChar.id}/elo`, {
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
      });

      // Update loser's Elo and stats  
      await fetch(`/api/characters/${otherChar.id}/elo`, {
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
      });

      // Create updated character objects with new stats
      const updatedSelectedChar = {
        ...selectedChar,
        wins: selectedChar.wins + 1,
        elo: Math.round(winnerElo),
        recent_change: Math.round(winnerChange)
      };

      const updatedOtherChar = {
        ...otherChar,
        losses: otherChar.losses + 1,
        elo: Math.round(loserElo),
        recent_change: Math.round(loserChange)
      };

      // Create the updated currentCharacters array
      const updatedCurrentCharacters = [...currentCharacters];
      updatedCurrentCharacters[selectedIndex] = updatedSelectedChar;
      updatedCurrentCharacters[selectedIndex === 0 ? 1 : 0] = updatedOtherChar;
      
      // Update state immediately to show new values during animation
      setCurrentCharacters(updatedCurrentCharacters);

      // Start the carousel animation - use the updated character data
      setTimeout(() => {
        // Always move the right character (index 1) to the left position
        // Use the pre-calculated characters for the new state
        setCurrentCharacters([updatedCurrentCharacters[1], upcomingRightChar])
        setNextCharacter(upcomingNextChar)
        
        setIsAnimating(false)
      }, 500) // Match this with CSS animation duration

    } catch (err) {
      console.error('Error updating character Elos:', err);
      
      // Even if API fails, continue with animation using original data
      setTimeout(() => {
        setCurrentCharacters([currentCharacters[1], upcomingRightChar])
        setNextCharacter(upcomingNextChar)
        
        setIsAnimating(false)
      }, 500)
    }
    
    if (selectedChar.elo >= otherChar.elo) {
      setCorrectPredictions(prev => prev + 1)
    }
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
            <h3 className="text-black text-xl font-semibold text-center my-3">Who would win?</h3>
            
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
              <div className="relative overflow-hidden" style={{ minHeight: '500px' }}>
                {/* Character Container with Carousel Animation */}
                <div className="relative w-full h-full flex justify-center items-center" style={{ minHeight: '500px' }}>
                  
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
