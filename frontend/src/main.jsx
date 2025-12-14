import { StrictMode } from 'react'
import 'temporal-polyfill/global'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  //   <App />
  // </StrictMode>,

  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
