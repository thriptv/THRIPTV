import React, { useState, useEffect } from 'react';
import { KeySquare, ShieldCheck, Copy, PlusCircle, Unlock, ArrowLeft } from 'lucide-react';
import './AdminPanel.css';

const AdminPanel = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [codes, setCodes] = useState([]);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchCodes = async (pass) => {
    try {
      const resp = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
      });
      const data = await resp.json();
      if (resp.ok) {
        setCodes(data);
        setIsAuthenticated(true);
        setError('');
      } else {
        setError(data.error || 'Contraseña incorrecta');
      }
    } catch (err) {
      setError('Error conectando al servidor.');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetchCodes(password);
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const resp = await fetch('/api/admin/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await resp.json();
      if (data.success) {
        fetchCodes(password); // refrescar listado
      }
    } catch (err) {
      alert("Error generando código");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-layout">
        <div className="admin-login-card fade-in">
          <ShieldCheck size={48} className="shield-icon" />
          <h2>Acceso Clasificado</h2>
          <p>Panel de Administración y Cajero de Códigos</p>
          <form onSubmit={handleLogin} className="admin-login-form">
            <input 
              type="password" 
              placeholder="Contraseña Maestra" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
            />
            {error && <div className="admin-error">{error}</div>}
            <button type="submit" className="admin-btn-login">Desbloquear Bóveda</button>
            <button type="button" className="admin-btn-back" onClick={() => window.location.href = '/'}>Volver a la App</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-layout fade-in">
      <div className="admin-sidebar">
        <div className="admin-branding">
          <KeySquare size={32} color="#f1c40f" />
          <h2>THR Admin</h2>
        </div>
        <div className="admin-nav">
          <div className="admin-nav-item active"><Unlock size={20}/> Cajero de Licencias</div>
        </div>
        <div style={{marginTop: 'auto', padding: '20px'}}>
           <button className="admin-btn-logout" onClick={() => window.location.href = '/'}><ArrowLeft size={16}/> Salir del Panel</button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h1>Generador de Pines de Telegram</h1>
          <button className="admin-btn-generate bounce-in" onClick={handleGenerate} disabled={isGenerating}>
            <PlusCircle size={20} /> {isGenerating ? 'Fabricando...' : 'Crear Código VIP'}
          </button>
        </div>

        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <h3>Pines Generados</h3>
            <div className="admin-stat-num">{codes.length}</div>
          </div>
          <div className="admin-stat-card">
            <h3>Disponibles</h3>
            <div className="admin-stat-num" style={{color: '#2ecc71'}}>
              {codes.filter(c => c.status === 'available').length}
            </div>
          </div>
          <div className="admin-stat-card">
            <h3>Canjeados</h3>
            <div className="admin-stat-num" style={{color: '#e74c3c'}}>
              {codes.filter(c => c.status === 'used').length}
            </div>
          </div>
        </div>

        <div className="admin-table-container scroll-area">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código VIP</th>
                <th>Estado</th>
                <th>Fecha de Creación</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {codes.slice().reverse().map((c, idx) => (
                <tr key={idx} className={c.status === 'available' ? 'row-available' : 'row-used'}>
                  <td className="pin-text">{c.pin.substring(0, 4)}-{c.pin.substring(4, 8)}-{c.pin.substring(8, 12)}</td>
                  <td>
                    <span className={`status-badge ${c.status}`}>
                      {c.status === 'available' ? 'LIBRE' : 'QUEMADO'}
                    </span>
                  </td>
                  <td>{new Date(c.createdAt).toLocaleString()}</td>
                  <td>
                    {c.status === 'available' && (
                      <button className="base-btn btn-copy" onClick={() => copyToClipboard(c.pin)}>
                        <Copy size={16} /> Copiar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {codes.length === 0 && (
                <tr>
                  <td colSpan="4" style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                    Aún no se ha generado ningún código.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
