import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'

import App from './App'
import './assets/index.css'
import './lib/i18n'
import { Providers } from './providers'

createRoot(document.getElementById('app')!).render(
  <BrowserRouter>
    <Providers>
      <App />
    </Providers>
  </BrowserRouter>
)
