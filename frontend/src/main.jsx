import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'
import axios from 'axios'
import { Capacitor } from '@capacitor/core'

let apiURL = import.meta.env.VITE_API_URL || ''

if (!apiURL && Capacitor.isNativePlatform()) {
  if (Capacitor.getPlatform() === 'android') {
    apiURL = 'http://10.0.2.2:5000'
  } else if (Capacitor.getPlatform() === 'ios') {
    apiURL = 'http://localhost:5000'
  }
}

axios.defaults.baseURL = apiURL
console.log(`[API BaseURL] Active API base URL is: "${apiURL || '(relative)'}"`);

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
