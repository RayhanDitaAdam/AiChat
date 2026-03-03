import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './pages/App.jsx'
import './i18n';
import { UserProvider } from './context/UserContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import { SidebarProvider } from './context/SidebarContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { SystemProvider } from './context/SystemContext.jsx'

const GOOGLE_CLIENT_ID = "714314930440-2bt30ojbnh5ph9mvui822jcfu5jnn4gf.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <UserProvider>
        <SocketProvider>
          <ChatProvider>
            <SystemProvider>
              <SidebarProvider>
                <App />
              </SidebarProvider>
            </SystemProvider>
          </ChatProvider>
        </SocketProvider>
      </UserProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
