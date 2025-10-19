import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import logoUrl from '../assets/joly-roger.png'
import './Rankings.css'

interface Character {
  first_name: string
  elo: number
  recent_change: number
}

function Rankings() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)

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
      } catch (err) {
        console.error('Error fetching characters:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch characters')
      } finally {
        setLoading(false)
      }
    }

    fetchCharacters()
  }, [])

  // Pagination calculations
  const totalPages = Math.ceil(characters.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCharacters = characters.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className='flex flex-row justify-center items-center py-4'>
        <Link to="/" className='flex flex-row items-center gap-3 hover:opacity-80 transition-opacity'>
          <img src={logoUrl} className='h-12' alt="Strawhat joly roger" />
          <h1 className='font-bold text-xl'>One Piece Elo</h1>
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Current Elo Rankings</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Community-driven power rankings of One Piece characters based on public opinion and matchup results.
          </p>
        </div>

        {/* Rankings Table */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  {loading ? 'Loading Rankings...' : `Character Rankings (${characters.length} total)`}
                </h3>
                {!loading && !error && (
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, characters.length)} of {characters.length}
                  </div>
                )}
              </div>
            </div>
            
            {loading ? (
              <div className="px-6 py-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Loading character data...</p>
              </div>
            ) : error ? (
              <div className="px-6 py-8 text-center">
                <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Data</div>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {currentCharacters
                  .sort((a, b) => b.elo - a.elo) // Sort by elo descending
                  .map((character, index) => (
                    <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-600">#{startIndex + index + 1}</span>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800">{character.first_name}</h4>
                            <p className="text-sm text-gray-500">One Piece Character</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-800">{character.elo}</div>
                            <div className="text-sm text-gray-500">Elo Rating</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-semibold ${
                              character.recent_change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {character.recent_change >= 0 ? '+' : ''}{character.recent_change}
                            </div>
                            <div className="text-xs text-gray-500">Recent Change</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        {!loading && !error && totalPages > 1 && (
          <div className="max-w-4xl mx-auto mt-6">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium border ${
                            currentPage === pageNum
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {loading ? '...' : characters.length}
              </div>
              <div className="text-gray-600">Characters Ranked</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {loading ? '...' : characters.length > 0 ? Math.round(characters.reduce((sum, char) => sum + char.elo, 0) / characters.length) : 0}
              </div>
              <div className="text-gray-600">Average Elo</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {loading ? '...' : characters.filter(char => char.recent_change > 0).length}
              </div>
              <div className="text-gray-600">Rising Characters</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Help Improve the Rankings!</h3>
            <p className="text-blue-600 mb-4">
              Your votes help make these rankings more accurate. Participate in matchups to influence the standings.
            </p>
            <Link 
              to="/picker" 
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              <p className='text-white'>Start Voting</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Rankings
