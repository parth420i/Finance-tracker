import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!clientId) {
  console.error("❌ ERROR: VITE_GOOGLE_CLIENT_ID is undefined. Check your .env file or Vercel dashboard.");
} else {
  console.log("✅ GOOGLE CLIENT ID LOADED:", clientId);
}

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={clientId || ""}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>,
)

