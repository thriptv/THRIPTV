import React, { useState, useEffect } from 'react';
import SpatialNavigation from 'spatial-navigation-js';
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

  useEffect(() => {
    // Detectar si estamos en un PC de escritorio (Chrome, Edge, Electron, Mac, Windows)
    const isTV = /Tizen|Web0S|WebOS|SMART-TV|SmartTV/i.test(navigator.userAgent);
    const isAndroid = /android/i.test(navigator.userAgent.toLowerCase());
    const isIOS = /ipad|iphone|ipod/i.test(navigator.userAgent.toLowerCase());
    
    // Si no es ni TV, ni Android, ni iOS, asumimos que es un PC (Escritorio / Electron)
    const isDesktopPC = !isTV && !isAndroid && !isIOS;

    // Inicializar navegación espacial SOLO si NO estamos en PC
    if (!isDesktopPC) {
      document.body.classList.add('tv-navigation-active');
      SpatialNavigation.init();
      SpatialNavigation.add({
        selector: '.focusable'
      });
      SpatialNavigation.makeFocusable();
      SpatialNavigation.focus();
    }

    const handleKeyDown = (e) => {
      // Tizen Return (10009), WebOS Back (461), PC Escape (27)
      if (e.keyCode === 10009 || e.keyCode === 461 || e.key === 'Escape' || e.key === 'Backspace') {
        window.dispatchEvent(new CustomEvent('tv-back-button'));
      }
      
      // Simular click con Enter/OK en elementos que no son botones nativos (divs, imágenes)
      if (e.key === 'Enter' || e.keyCode === 13) {
        if (document.activeElement && document.activeElement.tagName !== 'BUTTON') {
          e.preventDefault();
          document.activeElement.click();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Atajo inteligente: Si intentas subir más allá del techo, saltas a la barra inferior, y viceversa.
    const handleSnNavigateFailed = (e) => {
      if (e.detail.direction === 'up') {
        const bottomNavFirst = document.querySelector('.bottom-nav .focusable.active') || document.querySelector('.bottom-nav .focusable');
        if (bottomNavFirst) bottomNavFirst.focus();
      } else if (e.detail.direction === 'down') {
        const topElement = document.querySelector('.drawer-menu .focusable.active') || document.querySelector('.drawer-menu .focusable') || document.querySelector('.search-input-wrapper input');
        if (topElement) topElement.focus();
      }
    };

    let observer;
    if (!isDesktopPC) {
      window.addEventListener('sn:navigatefailed', handleSnNavigateFailed);

      // Observador para elementos dinámicos de React
      observer = new MutationObserver(() => {
        SpatialNavigation.makeFocusable();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (!isDesktopPC) {
        window.removeEventListener('sn:navigatefailed', handleSnNavigateFailed);
        if (observer) observer.disconnect();
        SpatialNavigation.uninit();
      }
    };
  }, []);

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
