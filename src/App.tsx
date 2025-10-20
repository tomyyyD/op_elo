import { Link } from 'react-router-dom'
import './App.css'
import logoUrl from './assets/joly-roger.png'
import kaidoUrl from './assets/kaido(1024).png'
import shanksUrl from './assets/shanks(1024).png'

function App() {

  return (
    <div style={{maxWidth: '1280px', margin: "0 auto"}}>
      <div>
        <p className="read-the-docs">
          art by <a href="https://x.com/ip2gdo">@ip2gdo</a> on twitter
        </p>
      </div>
      <div className='flex justify-center w-full'>
        <div className="flex flex-row justify-around w-7/10 gap-3 p-3">
          <Link to="/picker">
            <div className="relative group cursor-pointer overflow-hidden rounded-lg inline-block">
              <img src={kaidoUrl} className="logo kaido block object-cover grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-105" alt="rank tab" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-all duration-300">
                <h1 className="text-white font-bold text-xl text-center px-4">Contribute To Rankings</h1>
              </div>
            </div>
          </Link>
          <Link to="/rankings">
            <div className="relative group cursor-pointer overflow-hidden rounded-lg inline-block">
              <img src={shanksUrl} className="logo shanks block object-cover grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-105" alt="rank tab" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-transparent transition-all duration-300">
                <h1 className="text-white font-bold text-xl text-center px-4">Current Elo Rankings</h1>
              </div>
            </div>
          </Link>
        </div>
      </div>
      <div className='flex flex-row justify-center items-center'>
        <img src={logoUrl} className='h-32' alt="Strawhat joly roger" />
        <h1 className='font-bold'>One Piece Elo</h1>
      </div>
      <div className="flex flex-row items-center justify-center">
        <div className="card w-3/5">
          <p>
            This site is designed to create a consensus from the community on who the most
            powerful characters are by public opinion. You can contribute to the ranking by
            going to the ranking tab and choosing a winner in a series of randomly selected
            matchups from the generally accepted "strong" characters in One Piece.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
