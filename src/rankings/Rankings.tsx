import { Link } from 'react-router-dom'
import logoUrl from '../assets/joly-roger.png'
import './Rankings.css'

function Rankings() {
  // Sample data - replace with actual data from your database
  const rankings = [
    { rank: 1, name: "Monkey D. Luffy", elo: 1850, change: "+25" },
    { rank: 2, name: "Roronoa Zoro", elo: 1820, change: "+15" },
    { rank: 3, name: "Sanji", elo: 1790, change: "+10" },
    { rank: 4, name: "Jinbe", elo: 1750, change: "-5" },
    { rank: 5, name: "Franky", elo: 1720, change: "+8" },
    { rank: 6, name: "Brook", elo: 1690, change: "+12" },
    { rank: 7, name: "Nico Robin", elo: 1660, change: "+3" },
    { rank: 8, name: "Usopp", elo: 1630, change: "-2" },
    { rank: 9, name: "Nami", elo: 1600, change: "+7" },
    { rank: 10, name: "Tony Tony Chopper", elo: 1570, change: "+5" },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className='flex flex-row justify-center items-center py-4 bg-white shadow-sm'>
        <Link to="/" className='flex flex-row items-center gap-3 hover:opacity-80 transition-opacity'>
          <img src={logoUrl} className='h-12' alt="Strawhat joly roger" />
          <h1 className='font-bold text-xl'>One Piece Elo</h1>
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Current Elo Rankings</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Community-driven power rankings of One Piece characters based on public opinion and matchup results.
          </p>
        </div>

        {/* Rankings Table */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Top 10 Characters</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {rankings.map((character, index) => (
                <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-600">#{character.rank}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">{character.name}</h4>
                        <p className="text-sm text-gray-500">Straw Hat Pirates</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-800">{character.elo}</div>
                        <div className="text-sm text-gray-500">Elo Rating</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${
                          character.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {character.change}
                        </div>
                        <div className="text-xs text-gray-500">This Week</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
              <div className="text-gray-600">Total Matchups</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">89</div>
              <div className="text-gray-600">Active Contributors</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">42</div>
              <div className="text-gray-600">Characters Ranked</div>
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
              Start Voting
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Rankings
