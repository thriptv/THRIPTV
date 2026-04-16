import React, { useState, useEffect } from 'react';
import { KeySquare, ShieldCheck, Copy, PlusCircle, Unlock, ArrowLeft, Trophy, Calendar, Trash2 } from 'lucide-react';
import './AdminPanel.css';

const AdminPanel = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [codes, setCodes] = useState([]);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [activeTab, setActiveTab] = useState('codes'); // 'codes' | 'sports'
  const [sportsList, setSportsList] = useState([]);
  const [sportForm, setSportForm] = useState({
    homeTeam: '', homeLogo: '', awayTeam: '', awayLogo: '',
    day: '', time: '', tournament: '', tournamentLogo: '', channelsList: ''
  });

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

  const fetchSports = async () => {
    try {
        const resp = await fetch('/api/sports/schedule');
        const data = await resp.json();
        if (resp.ok) setSportsList(data.schedule || []);
    } catch (err) {}
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!sportForm.homeTeam || !sportForm.awayTeam) return;
    try {
      const obj = {
        password,
        event: {
          ...sportForm,
          channelsList: sportForm.channelsList.split(',').map(s => s.trim()).filter(Boolean)
        }
      };
      
      const resp = await fetch('/api/sports/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj)
      });
      if (resp.ok) {
        fetchSports();
        setSportForm({ homeTeam: '', homeLogo: '', awayTeam: '', awayLogo: '', day: '', time: '', tournament: '', tournamentLogo: '', channelsList: '' });
      }
    } catch (err) { alert("Error"); }
  };

  const handleDeleteEvent = async (id) => {
    // Alerta nativa retirada por bloqueos locales en el browser del usuario
    try {
      const resp = await fetch(`/api/sports/schedule/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (resp.ok) fetchSports();
    } catch (err) {}
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

  useEffect(() => {
    if (isAuthenticated) fetchSports();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="admin-login-layout">
        <div className="admin-login-card fade-in">
          <ShieldCheck size={48} className="shield-icon" />
          <h2>Acceso Clasificado</h2>
          <p>Panel de Administración VIP</p>
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
          <div className={`admin-nav-item ${activeTab === 'codes' ? 'active' : ''}`} onClick={() => setActiveTab('codes')}><Unlock size={20}/> Cajero de Licencias</div>
          <div className={`admin-nav-item ${activeTab === 'sports' ? 'active' : ''}`} onClick={() => setActiveTab('sports')}><Trophy size={20}/> Agenda Deportiva</div>
        </div>
        <div style={{marginTop: 'auto', padding: '20px'}}>
           <button className="admin-btn-logout" onClick={() => window.location.href = '/'}><ArrowLeft size={16}/> Salir del Panel</button>
        </div>
      </div>

      <div className="admin-content">
        
        {activeTab === 'codes' && (
          <>
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
          </>
        )}

        {activeTab === 'sports' && (
          <div className="fade-in" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            <div className="admin-header">
              <h1>Control de Agenda Deportiva</h1>
            </div>
            
            <div className="sports-admin-grid">
              
              <div className="sports-form-card">
                <h3><Calendar size={18} /> Programar Nuevo Partido</h3>
                <form onSubmit={handleCreateEvent}>
                  <div className="form-group row-group">
                    <div>
                      <label>Equipo Local</label>
                      <input type="text" className="admin-input" placeholder="Nombre (ej. Real Madrid)" value={sportForm.homeTeam} onChange={e => setSportForm({...sportForm, homeTeam: e.target.value})} required />
                    </div>
                    <div>
                      <label>Escudo Local (Url)</label>
                      <input type="text" className="admin-input" placeholder="https://..." value={sportForm.homeLogo} onChange={e => setSportForm({...sportForm, homeLogo: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="form-group row-group" style={{marginTop: '15px'}}>
                    <div>
                      <label>Equipo Visitante</label>
                      <input type="text" className="admin-input" placeholder="Nombre (ej. FC Barcelona)" value={sportForm.awayTeam} onChange={e => setSportForm({...sportForm, awayTeam: e.target.value})} required />
                    </div>
                    <div>
                      <label>Escudo Visitante (Url)</label>
                      <input type="text" className="admin-input" placeholder="https://..." value={sportForm.awayLogo} onChange={e => setSportForm({...sportForm, awayLogo: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="form-group row-group" style={{marginTop: '15px'}}>
                    <div>
                      <label>Día de Partido</label>
                      <input type="text" className="admin-input" placeholder="ej. HOY o DOMINGO" value={sportForm.day} onChange={e => setSportForm({...sportForm, day: e.target.value})} required />
                    </div>
                    <div>
                      <label>Hora Exacta</label>
                      <input type="text" className="admin-input" placeholder="ej. 21:00" value={sportForm.time} onChange={e => setSportForm({...sportForm, time: e.target.value})} required />
                    </div>
                  </div>
                  
                  <div className="form-group row-group" style={{marginTop: '15px'}}>
                    <div>
                      <label>Competición / Torneo</label>
                      <input type="text" className="admin-input" placeholder="ej. LaLiga EA Sports" value={sportForm.tournament} onChange={e => setSportForm({...sportForm, tournament: e.target.value})} required />
                    </div>
                    <div>
                      <label>Logo Competición (Url)</label>
                      <input type="text" className="admin-input" placeholder="https://..." value={sportForm.tournamentLogo} onChange={e => setSportForm({...sportForm, tournamentLogo: e.target.value})} />
                    </div>
                  </div>

                  <div className="form-group" style={{marginTop: '15px'}}>
                    <label>Canales de Transmisión (nombres separados por coma)</label>
                    <input type="text" className="admin-input" placeholder="ej. M LIGA DE CAMPEONES, DAZN F1, GOL PLAY" value={sportForm.channelsList} onChange={e => setSportForm({...sportForm, channelsList: e.target.value})} required />
                  </div>

                  <button type="submit" className="admin-btn-generate" style={{marginTop: '24px', width: '100%'}}>
                    <PlusCircle size={18} /> Registrar Evento en Cartelera
                  </button>
                </form>
              </div>

              
              <div className="sports-list-card">
                <h3>Partidos Activos</h3>
                <div className="sports-items-container scroll-area">
                  {sportsList.slice().reverse().map(event => (
                    <div key={event.id} className="sport-admin-row">
                      <div className="sp-team-info">
                        <strong>{event.title}</strong>
                        <span className="sp-sub">{event.tournament} - {event.time}</span>
                      </div>
                      <button className="base-btn btn-delete" onClick={() => handleDeleteEvent(event.id)}>
                        <Trash2 size={16} /> Borrar
                      </button>
                    </div>
                  ))}
                  {sportsList.length === 0 && (
                    <div style={{color: '#666', textAlign: 'center', marginTop: '40px'}}>
                      No hay partidos programados. Cartelera vacía.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;
