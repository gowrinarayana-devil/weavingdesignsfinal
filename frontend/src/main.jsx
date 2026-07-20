import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import axios from 'axios'
import { Capacitor } from '@capacitor/core'

// Global PWA Installation Event Hook
if (typeof window !== 'undefined') {
  window.deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
    console.log('Capture PWA beforeinstallprompt event');
    window.dispatchEvent(new CustomEvent('pwa-installable'));
  });
}

let apiURL = import.meta.env.VITE_API_URL || ''
if (apiURL) {
  apiURL = apiURL.trim().replace(/\/+$/, '')
  if (!/^https?:\/\//i.test(apiURL)) {
    apiURL = `https://${apiURL}`
  }
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    apiURL = apiURL.replace(/^http:\/\//i, 'https://')
  }
}

if (!apiURL && Capacitor.isNativePlatform()) {
  if (Capacitor.getPlatform() === 'android') {
    apiURL = 'http://10.0.2.2:5000'
  } else if (Capacitor.getPlatform() === 'ios') {
    apiURL = 'http://localhost:5000'
  }
}

axios.defaults.baseURL = apiURL
console.log(`[API BaseURL] Active API base URL is: "${apiURL || '(relative)'}"`);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

// Register PWA Service Worker in web environment
if ('serviceWorker' in navigator && !Capacitor.isNativePlatform()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('PWA Service Worker registered:', reg.scope))
      .catch((err) => console.error('PWA Service Worker registration failed:', err));
  });
}

