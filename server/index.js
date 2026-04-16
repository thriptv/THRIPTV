import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

dotenv.config();

const CODES_FILE = path.join(process.cwd(), 'server', 'codes.json');
const SPORTS_FILE = path.join(process.cwd(), 'server', 'sports.json');

const getCodes = () => {
  try {
    return JSON.parse(fs.readFileSync(CODES_FILE, 'utf8'));
  } catch (e) { return []; }
};

const saveCodes = (data) => {
  fs.writeFileSync(CODES_FILE, JSON.stringify(data, null, 2));
};

const getSports = () => {
  try {
    return JSON.parse(fs.readFileSync(SPORTS_FILE, 'utf8'));
  } catch (e) { return []; }
};

const saveSports = (data) => {
  fs.writeFileSync(SPORTS_FILE, JSON.stringify(data, null, 2));
};

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// -------- AGENDA DEPORTIVA MANUAL (CMS) --------
app.get('/api/sports/schedule', (req, res) => {
  const sports = getSports();
  res.json({ success: true, schedule: sports });
});

app.post('/api/sports/schedule', (req, res) => {
  const { password, event } = req.body;
  
  if (password !== 'thrbek+76') return res.status(403).json({ error: 'Contraseña de administrador incorrecta' });
  
  const sports = getSports();
  const newEvent = {
    id: `match-live-${Date.now()}`,
    sportType: 'football',
    title: `${event.homeTeam || 'Local'} vs ${event.awayTeam || 'Visitante'}`,
    time: event.time || '20:00',
    tournament: event.tournament || 'Campeonato',
    tournamentLogo: event.tournamentLogo || '',
    channelsList: event.channelsList || [], 
    team1: event.homeLogo || 'https://placehold.co/100x100/101010/FFF.png?text=L',
    team2: event.awayLogo || 'https://placehold.co/100x100/101010/FFF.png?text=V',
    bgImage: event.bgImage || 'https://i.pinimg.com/1200x/c7/ab/3c/c7ab3c490ec9e59124fb442b58ea0b33.jpg',
    createdAt: new Date().toISOString()
  };
  
  sports.push(newEvent);
  saveSports(sports);
  res.json({ success: true, event: newEvent });
});

app.delete('/api/sports/schedule/:id', (req, res) => {
  const { password } = req.body;
  if (password !== 'thrbek+76') return res.status(403).json({ error: 'Contraseña de administrador incorrecta' });
  
  const eventId = req.params.id;
  let sports = getSports();
  sports = sports.filter(s => s.id !== eventId);
  saveSports(sports);
  
  res.json({ success: true });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Online', message: 'THR IPTV Backend Funciona' });
});

// -------- PROXY XTREAM CODES (Anti-CORS) --------
// Útil en producción para ocultar claves y saltar CORS.
app.post('/api/proxy/xtream', async (req, res) => {
  const { url, username, password, action } = req.body;
  try {
    const targetUrl = `${url}/player_api.php?username=${username}&password=${password}&action=${action}`;
    const response = await axios.get(targetUrl);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy Request Failed', details: error.message });
  }
});

// -------- SISTEMA DE PINES (TELEGRAM VIP) --------
app.post('/api/payments/verify', (req, res) => {
  const { pinCode } = req.body;

  if (pinCode && typeof pinCode === 'string') {
    const cleanedCode = pinCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    if (cleanedCode.length === 12) {
      const codes = getCodes();
      const codeIndex = codes.findIndex(c => c.pin === cleanedCode);

      if (codeIndex !== -1) {
        if (codes[codeIndex].status === 'used') {
          return res.status(400).json({ success: false, message: 'Este Pin ya ha sido utilizado.' });
        }

        // Quemar el pin en base de datos
        codes[codeIndex].status = 'used';
        codes[codeIndex].usedAt = new Date().toISOString();
        saveCodes(codes);
        console.log(`[PIN VERIFIED] Código de Activación Quemado: ${cleanedCode}`);
        
        const issueDate = new Date();
        const expirationDate = new Date();
        expirationDate.setFullYear(issueDate.getFullYear() + 1);

        return res.json({ 
          success: true, 
          license: {
            status: 'premium',
            expiresAt: expirationDate.toISOString(),
            pinUsed: cleanedCode
          }
        });
      } else {
         return res.status(400).json({ success: false, message: 'Código no encontrado en el sistema base.' });
      }
    }
  }

  return res.status(400).json({ success: false, message: 'Pin inválido. Debe contener exactamente 12 caracteres.' });
});

// -------- PANEL ADMIN (NUEVAS RUTAS) --------
app.post('/api/admin/generate-code', (req, res) => {
  const { password } = req.body;
  
  if (password !== 'thrbek+76') return res.status(403).json({ error: 'Contraseña de administrador incorrecta' });

  // Excluimos I, O, 0, 1 para evitar confusión en códigos de canjeo
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rawPin = '';
  for(let i=0; i<12; i++) {
    rawPin += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const codes = getCodes();
  codes.push({
    pin: rawPin,
    status: 'available',
    createdAt: new Date().toISOString()
  });
  saveCodes(codes);

  res.json({ success: true, pin: rawPin });
});

app.post('/api/admin/codes', (req, res) => {
  const { password } = req.body;
  if (password !== 'thrbek+76') return res.status(403).json({ error: 'Acceso Denegado' });
  res.json(getCodes());
});

// -------- SERVIR EL FRONTEND (REACT / VITE) --------
// Esto permite que el backend de Node sea también quien entregue la web al navegador
app.use(express.static(path.join(process.cwd(), 'dist')));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`🚀 SERVIDOR BACKEND ACTIVO EN PUERTO ${PORT}`);
  console.log(`========================================\n`);
});
