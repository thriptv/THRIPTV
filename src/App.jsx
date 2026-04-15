import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import DashboardLayout from './components/DashboardLayout';
import AdminPanel from './components/AdminPanel';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    this.setState({ error, info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#ff4d4d', background: '#111', height: '100vh', fontFamily: 'monospace' }}>
          <h2>🚨 CRASH EN REACT 🚨</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error && this.state.error.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '20px', color: '#888' }}>{this.state.info && this.state.info.componentStack}</pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px', marginTop: '20px' }}>Recargar Aplicación</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playlistData, setPlaylistData] = useState({ channels: [], movies: [], series: [], categories: [] });
  const [appLanguage, setAppLanguage] = useState('es');

  // RUTA SECRETA DEL PANEL DE ADMINISTRACIÓN
  if (window.location.pathname === '/admin') {
    return <AdminPanel />;
  }

  // Esta función captura un login exitoso.
  const handleLogin = (loginPayload) => {
    if (loginPayload && loginPayload.data) {
      setPlaylistData(loginPayload.data);
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('thriptv_xtUrl');
    localStorage.removeItem('thriptv_xtUser');
    localStorage.removeItem('thriptv_xtPass');
    setIsLoggedIn(false);
    setPlaylistData({ channels: [], movies: [], series: [], categories: [] });
  };

  return (
    <>
      {isLoggedIn ? (
        <ErrorBoundary>
          <DashboardLayout 
            onLogout={handleLogout} 
            playlistData={playlistData} 
            appLanguage={appLanguage} 
            setAppLanguage={setAppLanguage} 
          />
        </ErrorBoundary>
      ) : (
        <LoginScreen 
          onLogin={handleLogin} 
          appLanguage={appLanguage} 
          setAppLanguage={setAppLanguage} 
        />
      )}
    </>
  )
}

export default App;
