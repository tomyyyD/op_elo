import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Picker from './picker/Picker.tsx'
import Rankings from './rankings/Rankings.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/picker" element={<Picker />} />
        <Route path="/rankings" element={<Rankings />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
