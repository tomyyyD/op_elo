import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='flex flex-row justify-center'>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className='font-bold'>One Piece Elo</h1>
      <div className="flex flex-row items-center justify-center">
        <div className="card w-3/5">
          <p>
            This site is designed to create a consensus from the community on who the strongest
            characters are by public opinion. You can contribute to the ranking by going to the
            ranking tab and choosing a winner in a series of randomly selected matchups from
            the generally accepted "strong" characters in One Piece.
          </p>
        </div>
      </div>
    </>
  )
}

export default App
