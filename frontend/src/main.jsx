import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Load DM Sans font from Google Fonts
const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap'
document.head.appendChild(link)

// Global reset styles
const style = document.createElement('style')
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0a; }
  input:focus { border-color: #C9F04D !important; box-shadow: 0 0 0 3px rgba(201,240,77,0.08); }
  button:hover:not(:disabled) { transform: translateY(-1px); }
  a { transition: opacity 0.2s; }
  a:hover { opacity: 0.8; }
`
document.head.appendChild(style)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)