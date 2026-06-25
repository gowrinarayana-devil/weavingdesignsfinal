import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import axios from 'axios'

let apiURL = import.meta.env.VITE_API_URL || ''
if (apiURL) {
  apiURL = apiURL.trim().replace(/\/+$/, '')
  if (!/^https?:\/\//i.test(apiURL)) {
    apiURL = `https://${apiURL}`
  }
}
axios.defaults.baseURL = apiURL

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
