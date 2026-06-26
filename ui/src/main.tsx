import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'
import { applyStoredTheme } from './lib/theme.ts'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

applyStoredTheme()

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
