import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { preloadAssets } from './utils/preloadAssets.js'

// Kick off background downloads for all game videos immediately on page load
preloadAssets()

createRoot(document.getElementById('root')).render(<App />)
