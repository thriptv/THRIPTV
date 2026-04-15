import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

dotenv.config();

const CODES_FILE = path.join(process.cwd(), 'server', 'codes.json');

const getCodes = () => {
  try {
    return JSON.parse(fs.readFileSync(CODES_FILE, 'utf8'));
  } catch (e) { return []; }
};

const saveCodes = (data) => {
  fs.writeFileSync(CODES_FILE, JSON.stringify(data, null, 2));
};

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// -------- RUTAS DE PRUEBA Y SALUD --------
app.get('/api/sports/schedule', async (req, res) => {
  try {
    const r = await axios.get('https://www.partidos-de-hoy.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const $ = cheerio.load(r.data);
    const matches = [];

    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const jsonText = $(el).html();
        if (jsonText) {
          const data = JSON.parse(jsonText.trim());
          if (data['@type'] === 'SportsEvent' || (Array.isArray(data) && data[0]['@type'] === 'SportsEvent')) {
            const eventData = Array.isArray(data) ? data[0] : data;
            
            // Extraer canales
            let channels = [];
            if (eventData.location && Array.isArray(eventData.location)) {
              eventData.location.forEach(loc => {
                if (loc['@type'] === 'VirtualLocation' && loc.name) {
                  channels = Array.isArray(loc.name) ? loc.name : [loc.name];
                }
              });
            }

            // Formatear Hora
            let timeStr = 'HOY';
            if (eventData.startDate) {
                const dateObj = new Date(eventData.startDate);
                timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
            }

            if (eventData.homeTeam?.name && eventData.awayTeam?.name) {
               matches.push({
                 id: `match-live-${matches.length + 1}`,
                 sportType: 'football',
                 title: `${eventData.homeTeam.name} vs ${eventData.awayTeam.name}`,
                 time: timeStr,
                 tournament: eventData.description ? eventData.description.split(' de ')[1] || 'Torneo' : 'Fútbol',
                 channelsList: channels,
                 team1: eventData.homeTeam.image || '',
                 team2: eventData.awayTeam.image || '',
                 bgImage: "https://images.unsplash.com/photo-1518605368461-1e12d5ee581b?auto=format&fit=crop&q=80&w=500"
               });
            }
          }
        }
      } catch (e) {} 
    });

    res.json({ success: true, schedule: matches });
  } catch (err) {
    console.error("New Scraper Error:", err.message);
    res.status(500).json({ success: false, error: 'Error fetching schedule' });
  }
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
