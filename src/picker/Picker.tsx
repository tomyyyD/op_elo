import { Link } from 'react-router-dom'
import logoUrl from '../assets/joly-roger.png'
import './Picker.css'

function Picker() {
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
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Character Matchup Picker</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Help contribute to the community rankings by choosing the winner in randomly selected matchups 
            between One Piece's strongest characters.
          </p>
        </div>

        {/* Matchup Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold text-center mb-6">Who would win in a fight?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Character 1 */}
              <div className="text-center">
                <div className="bg-gray-200 rounded-lg p-6 mb-4">
                  <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Character Image</span>
                  </div>
                  <h4 className="text-lg font-semibold">Character Name</h4>
                  <p className="text-gray-600 text-sm">Current Elo: 1500</p>
                </div>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                  Choose This Character
                </button>
              </div>

              {/* VS Divider */}
              <div className="flex items-center justify-center md:col-span-2 md:row-span-1">
                <div className="bg-gray-300 h-px w-full md:w-px md:h-full"></div>
                <div className="bg-white px-4 py-2 rounded-full border-2 border-gray-300 font-bold text-gray-600">
                  VS
                </div>
                <div className="bg-gray-300 h-px w-full md:w-px md:h-full"></div>
              </div>

              {/* Character 2 */}
              <div className="text-center">
                <div className="bg-gray-200 rounded-lg p-6 mb-4">
                  <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Character Image</span>
                  </div>
                  <h4 className="text-lg font-semibold">Character Name</h4>
                  <p className="text-gray-600 text-sm">Current Elo: 1500</p>
                </div>
                <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                  Choose This Character
                </button>
              </div>
            </div>

            {/* Skip Button */}
            <div className="text-center mt-6">
              <button className="text-gray-500 hover:text-gray-700 underline">
                Skip this matchup
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Your Contribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-gray-600">Matchups Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-gray-600">Correct Predictions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">0</div>
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
