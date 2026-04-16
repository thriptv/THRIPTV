import React, { useState, useEffect } from 'react';
import { Globe, User, Lock, Eye, EyeOff, Link, LogIn, Tv, FileText } from 'lucide-react';
import { parseM3UString } from '../services/iptvParser';
import { fetchXtreamData } from '../services/xtreamService';
import { translations } from '../i18n/translations';
import './LoginScreen.css';

const LoginScreen = ({ onLogin, appLanguage }) => {
  const t = translations[appLanguage].login;
  const [activeTab, setActiveTab] = useState('xtream'); // 'xtream' | 'm3u'
  const [showPassword, setShowPassword] = useState(false);
  
  const [xtUrl, setXtUrl] = useState('');
  const [xtUser, setXtUser] = useState('');
  const [xtPass, setXtPass] = useState('');
  
  const [m3uUrl, setM3uUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const savedUrl = localStorage.getItem('thriptv_xtUrl');
    const savedUser = localStorage.getItem('thriptv_xtUser');
    const savedPass = localStorage.getItem('thriptv_xtPass');
    if (savedUrl && savedUser && savedPass) {
      setXtUrl(savedUrl);
      setXtUser(savedUser);
      setXtPass(savedPass);
      
      const autoConnect = async () => {
        setIsLoading(true);
        try {
          const xtreamData = await fetchXtreamData(savedUrl, savedUser, savedPass);
          if (xtreamData.channels.length === 0 && xtreamData.movies.length === 0 && xtreamData.series.length === 0) {
            setErrorMsg(t.errorNoChannels);
            setIsLoading(false);
            return;
          }
          onLogin({ type: 'xtream', data: xtreamData });
        } catch (err) {
          setErrorMsg("Error reconectando automáticamete: " + err.message);
          setIsLoading(false);
        }
      };
      autoConnect();
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const fileContent = event.target.result;
        const parsedData = parseM3UString(fileContent);
        
        if (parsedData.channels.length === 0 && parsedData.movies.length === 0 && parsedData.series.length === 0) {
          throw new Error('El archivo M3U parece estar vacío o no tiene un formato soportado.');
        }

        // Simula mini carga
        setTimeout(() => {
          onLogin({ type: 'm3u', data: parsedData });
        }, 800);
      } catch (err) {
        console.error(err);
        setErrorMsg('Error al leer el archivo M3U: ' + err.message);
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Error al intentar leer el archivo desde el disco.');
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const handleUrlLogin = async () => {
    if (activeTab === 'xtream') {
       if (!xtUrl || !xtUser || !xtPass) {
          setErrorMsg(t.errorFillXtream);
          return;
       }
       
       setIsLoading(true);
       setErrorMsg('');
       try {
         const xtreamData = await fetchXtreamData(xtUrl, xtUser, xtPass);
         if (xtreamData.channels.length === 0 && xtreamData.movies.length === 0 && xtreamData.series.length === 0) {
           setErrorMsg(t.errorNoChannels);
           setIsLoading(false);
           return;
         }
         localStorage.setItem('thriptv_xtUrl', xtUrl);
         localStorage.setItem('thriptv_xtUser', xtUser);
         localStorage.setItem('thriptv_xtPass', xtPass);
         onLogin({ type: 'xtream', data: xtreamData });
       } catch (err) {
         setErrorMsg(err.message);
         setIsLoading(false);
       }
       return;
    }

    if (activeTab === 'm3u' && !m3uUrl) {
       setErrorMsg(t.errorFillM3U);
       return;
    }
    setErrorMsg(t.warningM3U);
  };

  return (
    <div className="login-container fade-in">
      {/* SECCIÓN DEL LOGO OFICIAL */}
      <div className="logo-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px' }}>
        <img src="/Logo.png" alt="THRIPTV Oficial Logo" style={{ maxWidth: '300px', maxHeight: '140px', objectFit: 'contain', marginBottom: '10px' }} />
        <p className="subtitle" style={{ opacity: 0.8 }}>{t.selectMode}</p>
      </div>

      {/* TARJETA DEL FORMULARIO */}
      <div className="login-card">


        {/* FORMULARIO DINÁMICO */}
        <div className="fade-in">
          <div className="form-group">
            <label>{t.username}</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input 
                type="text" 
                className="input-field" 
                placeholder={t.usernamePlaceholder} 
                value={xtUser}
                onChange={(e) => setXtUser(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t.password}</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-field" 
                placeholder={t.passwordPlaceholder} 
                value={xtPass}
                onChange={(e) => setXtPass(e.target.value)}
              />
              <button 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>{t.serverUrl}</label>
            <div className="input-wrapper">
              <Globe className="input-icon" size={20} />
              <input 
                type="text" 
                className="input-field" 
                placeholder={t.serverUrlPlaceholder} 
                value={xtUrl}
                onChange={(e) => setXtUrl(e.target.value)}
              />
            </div>
          </div>

        </div>

        {errorMsg && <div style={{ color: '#ff4d4d', marginTop: '12px', fontSize: '14px', textAlign: 'center' }}>{errorMsg}</div>}

        {/* BOTÓN CONECTAR */}
        <button className="submit-btn" type="button" onClick={handleUrlLogin} disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
          <LogIn className="submit-icon" size={20} />
          {isLoading ? t.btnDecoding : t.btnConnect}
        </button>


      </div>
    </div>
  );
};

export default LoginScreen;
