import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './src/App.tsx'
import { ErrorBoundary } from './src/components/ErrorBoundary'
// import './src/index.css' // Using portal's shared styles instead
import '../../shared/styles/errlDesignSystem.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

