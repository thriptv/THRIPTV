import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  RefreshCcw, 
  Tv, 
  Star, 
  History, 
  ChevronLeft, 
  ChevronRight,
  Film,
  Clapperboard,
  Settings,
  LogOut,
  Trophy,
  Music,
  Globe,
  Baby,
  Play,
  Search,
  Image as ImageIcon,
  ArrowLeft,
  PlayCircle,
  Calendar,
  Clock,
  Info,
  Shield,
  Key,
  Trash2,
  Home,
  PlusCircle
} from 'lucide-react';
import './DashboardLayout.css';
import VideoPlayer from './VideoPlayer';
import { translations } from '../i18n/translations';

// -- DATOS DEL SISTEMA (FIJOS) --
const SYSTEM_CATEGORIES = [
  { id: 'all', name: 'TODOS', icon: Tv },
  { id: 'fav', name: 'FAVORITOS', icon: Star },
  { id: 'hist', name: 'HISTORIAL', icon: History },
];

// -- GRUPOS EXTRAÍDOS SIMULADOS DE M3U (DINÁMICOS) --
const M3U_EXTRACTED_GROUPS = [
  { id: 'es-tv', name: '🇪🇸 ESPAÑA TV', icon: Globe },
  { id: 'latam-vip', name: '🌎 LATAM VIP', icon: Globe },
  { id: 'us-uk', name: '🇺🇸 USA / UK', icon: Globe },
  { id: 'vod-es', name: '🇪🇸 CINE ESPAÑOL', icon: Film },
  { id: 'vod-en', name: '🇺🇸 MOVIES (EN)', icon: Film },
];

// Unión temporal para facilitar recuentos
const STATIC_MOCK_CATEGORIES = [...SYSTEM_CATEGORIES, ...M3U_EXTRACTED_GROUPS];

const STATIC_MOCK_CHANNELS = [
  { id: 1, name: "HBO Premium HD", epg: "14:00 - Juego de Tronos", img: "https://api.dicebear.com/7.x/identicon/svg?seed=HBO&backgroundColor=4A00E0", groupId: 'us-uk' },
  { id: 2, name: "ESPN 1 HD", epg: "15:30 - Champions League", img: "https://api.dicebear.com/7.x/identicon/svg?seed=ESPN&backgroundColor=c31432", groupId: 'latam-vip' },
  { id: 3, name: "Fox Sports", epg: "Todo el día", img: "https://api.dicebear.com/7.x/identicon/svg?seed=Fox&backgroundColor=0f0c29", groupId: 'us-uk' },
  { id: 4, name: "CNN Español", epg: "14:00 - Noticias Internacionales", img: "https://api.dicebear.com/7.x/identicon/svg?seed=CNN&backgroundColor=cb2d3e", groupId: 'latam-vip' },
  { id: 5, name: "Disney Channel", epg: "16:00 - Toy Story 4", img: "https://api.dicebear.com/7.x/identicon/svg?seed=Disney&backgroundColor=1fa2ff", groupId: 'es-tv' },
  { id: 6, name: "MTV Hits", epg: "Top 20 Billboard", img: "https://api.dicebear.com/7.x/identicon/svg?seed=MTV&backgroundColor=ff0844", groupId: 'us-uk' },
  { id: 7, name: "Nat Geo Wild", epg: "18:00 - Planeta Tierra VIP", img: "https://api.dicebear.com/7.x/identicon/svg?seed=NatGeo&backgroundColor=f8b500", groupId: 'es-tv' },
  { id: 8, name: "TNT Series", epg: "The Mentalist - T5 E12", img: "https://api.dicebear.com/7.x/identicon/svg?seed=TNT&backgroundColor=141e30", groupId: 'latam-vip' },
];

const STATIC_MOCK_MOVIES = [
  { id: 101, title: "Duna: Parte Dos", imdb: 8.8, poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PB05AWbUP.jpg", groupId: 'vod-es', director: "Denis Villeneuve", genre: "Ciencia Ficción, Aventura", cast: "Timothée Chalamet, Zendaya, Rebecca Ferguson", synopsis: "Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia.", duration: "166 min", year: 2024, backdrop: "https://image.tmdb.org/t/p/original/8rpDcsfLJypbO6vtec005WdYQDE.jpg" },
  { id: 102, title: "Oppenheimer", imdb: 8.4, poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", groupId: 'vod-en', director: "Christopher Nolan", genre: "Drama, Historia", cast: "Cillian Murphy, Emily Blunt, Matt Damon", synopsis: "La historia del científico estadounidense J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica.", duration: "180 min", year: 2023, backdrop: "https://image.tmdb.org/t/p/original/rMvPXy8PUjj1oCGZqQdoeyZ3Sls.jpg" },
  { id: 103, title: "Spider-Man: Across the Spider-Verse", imdb: 8.6, poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", groupId: 'vod-en', director: "Joaquim Dos Santos", genre: "Animación, Acción", cast: "Shameik Moore, Hailee Steinfeld, Oscar Isaac", synopsis: "Miles Morales es catapultado a través del Multiverso, donde se encuentra con un equipo de Spider-Personas encargadas de proteger su propia existencia.", duration: "140 min", year: 2023, backdrop: "https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg" },
  { id: 104, title: "Película Rota (Test Fallback)", imdb: 5.0, poster: "https://link-roto-que-no-existe.com/cover.jpg", groupId: 'vod-es', director: "Director Falso", genre: "Test", cast: "Actor 1", synopsis: "Película de prueba para ver qué pasa cuando la portada falla.", duration: "90 min", year: 2024, backdrop: "" },
  { id: 105, title: "The Dark Knight", imdb: 9.0, poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", groupId: 'vod-en', director: "Christopher Nolan", genre: "Acción, Crimen, Drama", cast: "Christian Bale, Heath Ledger, Aaron Eckhart", synopsis: "Cuando la amenaza conocida como el Joker emerge de su pasado misterioso, causa estragos y caos en la gente de Gotham.", duration: "152 min", year: 2008, backdrop: "https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSfrkvQnA.jpg" },
  { id: 106, title: "Poor Things", imdb: 8.0, poster: "https://image.tmdb.org/t/p/w500/ckzIGvUhnT5NqF4K1a5hL91mR7u.jpg", groupId: 'vod-en', director: "Yorgos Lanthimos", genre: "Comedia, Fantasía", cast: "Emma Stone, Mark Ruffalo, Willem Dafoe", synopsis: "La increíble historia y la fantástica evolución de Bella Baxter, una joven devuelta a la vida por el brillante y poco ortodoxo científico Dr. Godwin Baxter.", duration: "141 min", year: 2023, backdrop: "https://image.tmdb.org/t/p/original/bQS43Zo51m8KDr1Gj6HqN3hI0R7.jpg" },
  { id: 107, title: "Godzilla x Kong", imdb: 6.5, poster: "https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg", groupId: 'vod-es', director: "Adam Wingard", genre: "Acción, Ciencia Ficción", cast: "Rebecca Hall, Brian Tyree Henry, Dan Stevens", synopsis: "Una aventura cinematográfica completamente nueva que enfrenta al todopoderoso Kong y al temible Godzilla contra una colosal amenaza no descubierta oculta dentro de nuestro mundo.", duration: "115 min", year: 2024, backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg" },
  { id: 108, title: "Kung Fu Panda 4", imdb: 7.1, poster: "https://image.tmdb.org/t/p/w500/kZ1hQ7c2d8290G5E2wN3AEM7H51.jpg", groupId: 'vod-es', director: "Mike Mitchell", genre: "Animación, Familia", cast: "Jack Black, Awkwafina, Viola Davis", synopsis: "Po debe entrenar a un nuevo Guerrero Dragón mientras se enfrenta a un nuevo villano capaz de convocar a villanos del pasado.", duration: "94 min", year: 2024, backdrop: "https://image.tmdb.org/t/p/original/kYgQzzjNis5jJalYtI62HapO1M2.jpg" }
];

const STATIC_MOCK_SERIES = [
  { 
    id: 201, 
    title: "Breaking Bad", 
    imdb: 9.5, 
    poster: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizwpB.jpg", 
    groupId: 'vod-es', 
    director: "Vince Gilligan", 
    genre: "Crimen, Drama", 
    cast: "Bryan Cranston, Aaron Paul, Anna Gunn", 
    synopsis: "Un profesor de química diagnosticado con cáncer de pulmón recurre a la fabricación y venta de metanfetamina para asegurar el futuro de su familia.",
    year: 2008, 
    backdrop: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { id: '201-s1e1', epNumber: 1, title: "Piloto", duration: "58 min", image: "https://image.tmdb.org/t/p/w500/rXmB0vTIfx7Sj6KxZ4Hj4Yv1tQf.jpg", synopsis: "Walter White, un profesor de química, decide cocinar metanfetamina." },
          { id: '201-s1e2', epNumber: 2, title: "El Gato está en la Bolsa...", duration: "48 min", image: "https://image.tmdb.org/t/p/w500/qXzZ6C1P0Y1q2c2Ww6n8J2L6mU.jpg", synopsis: "Walt y Jesse intentan resolver un grave problema en la RV." }
        ]
      },
      {
        seasonNumber: 2,
        episodes: [
          { id: '201-s2e1', epNumber: 1, title: "Siete Treinta y Siete", duration: "47 min", image: "https://image.tmdb.org/t/p/w500/v9QY0YwQZgM8Z3xXl2Q3M8B2l2E.jpg", synopsis: "Walt y Jesse calculan el dinero exacto que necesitan." },
          { id: '201-s2e2', epNumber: 2, title: "Rastreador", duration: "48 min", image: "https://image.tmdb.org/t/p/w500/rMvPXy8PUjj1oCGZqQdoeyZ3Sls.jpg", synopsis: "Las cosas se salen de control con la llegada de Hank." }
        ]
      }
    ]
  },
  { 
    id: 202, 
    title: "The Boys", 
    imdb: 8.7, 
    poster: "https://image.tmdb.org/t/p/w500/2yC1x6yXQzXZyvP7R3C3h0E5c7x.jpg", 
    groupId: 'vod-en', 
    director: "Eric Kripke", 
    genre: "Acción, Comedia", 
    cast: "Karl Urban, Jack Quaid, Antony Starr", 
    synopsis: "Un grupo de vigilantes se propone derribar a superhéroes corruptos corporativos que abusan de sus superpoderes.",
    year: 2019, 
    backdrop: "https://image.tmdb.org/t/p/original/mGVrXeIjw1eM196fC1yF6fJqM9P.jpg",
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { id: '202-s1e1', epNumber: 1, title: "The Name of the Game", duration: "60 min", image: "https://image.tmdb.org/t/p/w500/5m1k2n5M9jK9q9R9l6m3q8h1v5i.jpg", synopsis: "Hughie Campbell queda destrozado cuando su novia muere." },
          { id: '202-s1e2', epNumber: 2, title: "Cherry", duration: "59 min", image: "https://image.tmdb.org/t/p/w500/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg", synopsis: "The Boys encuentran a su primer blanco de Vought." }
        ]
      }
    ]
  },
  { 
    id: 203, 
    title: "Stranger Things", 
    imdb: 8.7, 
    poster: "https://image.tmdb.org/t/p/w500/uOOtwVbSr4QDjAGIifLDvgP2cyS.jpg", 
    groupId: 'vod-en', 
    director: "The Duffer Brothers", 
    genre: "Drama, Fantasía", 
    cast: "Millie Bobby Brown, Finn Wolfhard, Winona Ryder", 
    synopsis: "Un niño desaparece misteriosamente y sus amigos emprenden una búsqueda que desvela una serie de misterios ocultos en su pueblo.",
    year: 2016, 
    backdrop: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { id: '203-s1e1', epNumber: 1, title: "Capítulo Uno: La desaparición de Will Byers", duration: "48 min", image: "https://image.tmdb.org/t/p/w500/uOOtwVbSr4QDjAGIifLDvgP2cyS.jpg", synopsis: "De regreso a casa tras jugar con sus amigos, el joven Will Byers desaparece misteriosamente." }
        ]
      }
    ]
  },
  { 
    id: 204, 
    title: "The Last of Us", 
    imdb: 8.8, 
    poster: "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg", 
    groupId: 'vod-en', 
    director: "Craig Mazin", 
    genre: "Drama, Acción", 
    cast: "Pedro Pascal, Bella Ramsey", 
    synopsis: "Supervivientes viajan a través de un EE.UU. post-apocalíptico desolado por una infección fúngica.",
    year: 2023, 
    backdrop: "https://image.tmdb.org/t/p/original/aT3sRVqbpz2vEXomo5hI4tc5uAW.jpg",
    seasons: [{ seasonNumber: 1, episodes: [{ id: '204-s1e1', epNumber: 1, title: "Cuando estés perdido en la oscuridad", duration: "80 min", image: "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg", synopsis: "El inicio del brote." }] }]
  },
  { 
    id: 205, 
    title: "Peaky Blinders", 
    imdb: 8.8, 
    poster: "https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg", 
    groupId: 'vod-en', 
    director: "Steven Knight", 
    genre: "Crimen, Drama", 
    cast: "Cillian Murphy, Tom Hardy", 
    synopsis: "Epopeya de una familia de gánsteres ambientada en Birmingham, Inglaterra, en 1919.",
    year: 2013, 
    backdrop: "",
    seasons: [{ seasonNumber: 1, episodes: [{ id: '205-s1e1', epNumber: 1, title: "Episodio 1", duration: "57 min", image: "https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg", synopsis: "Tommy Shelby consigue una caja de armas." }] }]
  },
  { 
    id: 206, 
    title: "The Office", 
    imdb: 9.0, 
    poster: "https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg", 
    groupId: 'vod-en', 
    director: "Greg Daniels", 
    genre: "Comedia", 
    cast: "Steve Carell, Rainn Wilson", 
    synopsis: "Falsa documental sobre el día a día de los empleados de la sucursal de Scranton de la empresa de papel Dunder Mifflin.",
    year: 2005, 
    backdrop: "",
    seasons: [{ seasonNumber: 1, episodes: [{ id: '206-s1e1', epNumber: 1, title: "Piloto", duration: "22 min", image: "https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg", synopsis: "Un documental que muestra el día a día en una oficina." }] }]
  },
  { 
    id: 207, 
    title: "Chernobyl", 
    imdb: 9.3, 
    poster: "https://image.tmdb.org/t/p/w500/hlL0k92HhEMq19A1EqGZinHIn2S.jpg", 
    groupId: 'vod-en', 
    director: "Craig Mazin", 
    genre: "Drama, Historia", 
    cast: "Jared Harris, Stellan Skarsgård", 
    synopsis: "Dramatización del desastre nuclear de Chernóbil de 1986 y los esfuerzos de limpieza sin precedentes que le siguieron.",
    year: 2019, 
    backdrop: "",
    seasons: [{ seasonNumber: 1, episodes: [{ id: '207-s1e1', epNumber: 1, title: "1:23:45", duration: "59 min", image: "https://image.tmdb.org/t/p/w500/hlL0k92HhEMq19A1EqGZinHIn2S.jpg", synopsis: "Explosión en la planta de energía." }] }]
  },
  { 
    id: 208, 
    title: "Dark", 
    imdb: 8.7, 
    poster: "https://image.tmdb.org/t/p/w500/90oGfl2VwP6wrt82z2eC660xP22.jpg", 
    groupId: 'vod-en', 
    director: "Baran bo Odar", 
    genre: "Drama, Misterio", 
    cast: "Louis Hofmann, Karoline Eichhorn", 
    synopsis: "Una saga familiar con un toque sobrenatural ambientada en una ciudad alemana donde la desaparición de dos niños expone fracturas familiares.",
    year: 2017, 
    backdrop: "",
    seasons: [{ seasonNumber: 1, episodes: [{ id: '208-s1e1', epNumber: 1, title: "Secretos", duration: "51 min", image: "https://image.tmdb.org/t/p/w500/90oGfl2VwP6wrt82z2eC660xP22.jpg", synopsis: "La misteriosa desaparición de un joven revive trágicos eventos." }] }]
  }
];

const MOCK_SPORTS_AGENDA = [];

const cleanTitle = (rawTitle) => {
  if (!rawTitle) return '';
  let clean = rawTitle;
  if (clean.includes('|')) clean = clean.split('|').pop().trim();
  if (clean.includes(' - ')) clean = clean.split(' - ').pop().trim();
  clean = clean.replace(/\[.*?\]|\(.*?\)/g, "").trim();
  return clean;
};

const formatRating = (ratingStr) => {
  if (!ratingStr || ratingStr === 'N/A') return 'N/A';
  const num = parseFloat(ratingStr);
  if (isNaN(num) || num === 0) return 'N/A';
  return num.toFixed(1);
};

const translateToSpanish = async (text) => {
  if (!text || text.length < 3 || text === 'N/A') return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=es&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const result = await res.json();
    return result[0].map(item => item[0]).join('');
  } catch (error) {
    console.warn("Translation failed", error);
    return text;
  }
};

const DashboardLayout = ({ onLogout, playlistData, appLanguage, setAppLanguage }) => {
  const tr = translations[appLanguage] || translations.es;

  const MOCK_CHANNELS = playlistData && playlistData.channels?.length > 0 ? playlistData.channels : STATIC_MOCK_CHANNELS;
  const MOCK_MOVIES = playlistData && playlistData.movies?.length > 0 ? playlistData.movies : STATIC_MOCK_MOVIES;
  const MOCK_SERIES = playlistData && playlistData.series?.length > 0 ? playlistData.series : STATIC_MOCK_SERIES;
  const MOCK_CATEGORIES = playlistData && playlistData.categories?.length > 0 
    ? [...SYSTEM_CATEGORIES, ...playlistData.categories] 
    : STATIC_MOCK_CATEGORIES;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeBottomNav, setActiveBottomNav] = useState('home'); // 'home' | 'settings' | 'movies' | 'series' | 'live'
  
  const homeMoviesRef = useRef(null);
  const homeSeriesRef = useRef(null);
  const scrollRef = (ref, amount) => { if(ref.current) ref.current.scrollBy({ left: amount, behavior: 'smooth' }); };
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState(null);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [activeSeason, setActiveSeason] = useState(1);
  const [activeGenre, setActiveGenre] = useState('Todos');
  const [playingMedia, setPlayingMedia] = useState(null);
  
  // STATE DEL ROBOT DEPORTIVO
  const [liveSchedule, setLiveSchedule] = useState(null);
  const [scheduleError, setScheduleError] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch('/api/sports/schedule');
        const data = await res.json();
        if (data.success && data.schedule.length > 0) {
          setLiveSchedule(data.schedule);
        } else {
          setLiveSchedule(MOCK_SPORTS_AGENDA); // Fallback
        }
      } catch (err) {
        console.error("No se pudo conectar al Robot Lector");
        setScheduleError(true);
        setLiveSchedule(MOCK_SPORTS_AGENDA); // Fallback
      }
    };
    fetchSchedule();
  }, []);
  
  // MOTORES DE RESCATE IMDB
  const [activeSearchIMDB, setActiveSearchIMDB] = useState({});
  const [fixedPosters, setFixedPosters] = useState({});
  
  // METADATOS EXTRAÍDOS DE IMDB/OMDB
  const [movieDetails, setMovieDetails] = useState({});
  useEffect(() => {
    if (selectedMovieId && !movieDetails[selectedMovieId]) {
      const m = MOCK_MOVIES.find(x => x.id === selectedMovieId);
      if (m && m.id && m.id.startsWith('vod_')) {
        const streamId = m.id.replace('vod_', '');
        const xtUrl = localStorage.getItem('thriptv_xtUrl');
        const xtUser = localStorage.getItem('thriptv_xtUser');
        const xtPass = localStorage.getItem('thriptv_xtPass');
        
        if (xtUrl && xtUser && xtPass) {
          fetch('/api/proxy/xtream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              url: xtUrl.replace(/\/+$/, ''), 
              username: xtUser, 
              password: xtPass, 
              action: `get_vod_info&vod_id=${streamId}` 
            })
          })
          .then(res => res.json())
          .then(async data => {
            if (data && data.info) {
              const rawPlot = data.info.plot || data.info.description || m.synopsis;
              const translatedPlot = rawPlot ? await translateToSpanish(rawPlot) : rawPlot;
              setMovieDetails(prev => ({
                ...prev,
                [selectedMovieId]: {
                  director: data.info.director || m.director,
                  cast: data.info.cast || data.info.actors || m.cast,
                  synopsis: translatedPlot,
                  imdb: data.info.rating || data.info.rating_5based || m.imdb,
                  year: data.info.year || data.info.released || m.year,
                  genre: data.info.genre || m.genre
                }
              }));
            }
          })
          .catch(e => console.error("Error obteniendo detalles VOD:", e));
        }
      }
    }
  }, [selectedMovieId]);

  useEffect(() => {
    if (selectedSeriesId && !movieDetails[selectedSeriesId]) {
      const s = MOCK_SERIES.find(x => x.id === selectedSeriesId);
      if (s && s.id && s.id.startsWith('series_')) {
        const streamId = s.id.replace('series_', '');
        const xtUrl = localStorage.getItem('thriptv_xtUrl');
        const xtUser = localStorage.getItem('thriptv_xtUser');
        const xtPass = localStorage.getItem('thriptv_xtPass');
        
        if (xtUrl && xtUser && xtPass) {
          fetch('/api/proxy/xtream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              url: xtUrl.replace(/\/+$/, ''), 
              username: xtUser, 
              password: xtPass, 
              action: `get_series_info&series_id=${streamId}` 
            })
          })
          .then(res => res.json())
          .then(async data => {
            if (data) {
              const info = data.info || {};
              const rawPlot = info.plot || info.description || s.synopsis;
              const translatedPlot = rawPlot ? await translateToSpanish(rawPlot) : rawPlot;
              
              let extractedSeasons = [];
              if (data.episodes && typeof data.episodes === 'object') {
                Object.keys(data.episodes).forEach(seasonNum => {
                   let epsList = data.episodes[seasonNum];
                   if (Array.isArray(epsList) && epsList.length > 0) {
                      extractedSeasons.push({
                         seasonNumber: parseInt(seasonNum, 10),
                         episodes: epsList.map((ep, idx) => ({
                            id: ep.id || `ep_${idx}`,
                            epNumber: ep.episode_num || (idx + 1),
                            title: ep.title || `Episodio ${idx + 1}`,
                            duration: ep.info?.duration ? `${ep.info.duration} min` : 'N/A',
                            synopsis: ep.info?.plot || '',
                            image: ep.info?.movie_image || '',
                            url: `${xtUrl.replace(/\/+$/, '')}/series/${xtUser}/${xtPass}/${ep.id}.${ep.container_extension || 'mp4'}`
                         }))
                      });
                   }
                });
              }
              extractedSeasons.sort((a,b) => a.seasonNumber - b.seasonNumber);

              setMovieDetails(prev => ({
                ...prev,
                [selectedSeriesId]: {
                  director: info.director || s.director,
                  cast: info.cast || info.actors || s.cast,
                  synopsis: translatedPlot,
                  imdb: info.rating || info.rating_5based || s.imdb,
                  year: info.year || info.releaseDate || s.year,
                  genre: info.genre || s.genre,
                  seasons: extractedSeasons.length > 0 ? extractedSeasons : s.seasons
                }
              }));
            }
          })
          .catch(e => console.error("Error obteniendo detalles Series:", e));
        }
      }
    }
  }, [selectedSeriesId]);

  // MOTORES DE MEMORIA (FAVORITOS E HISTORIAL COMPARTIDO)
  const [favorites, setFavorites] = useState([]); 
  const [history, setHistory] = useState([]); 

  // PAGO Y LICENCIA PREMIUM
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('licenseStatus') === 'premium');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [activationCode, setActivationCode] = useState('');

  const handlePayPalPayment = () => {
    setShowQRModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!activationCode || activationCode.trim() === '') return;
    setIsVerifying(true);
    try {
      const resp = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinCode: activationCode })
      });
      const data = await resp.json();
      if (data.success) {
        localStorage.setItem('licenseStatus', 'premium');
        setIsPremium(true);
        setShowQRModal(false);
      } else {
        alert(tr.payment?.error || 'Pin inválido. Debe contener exactamente 12 caracteres alfanuméricos.');
      }
    } catch (err) {
      console.error(err);
      alert("Error conectando con el Servidor Backend Node.");
    } finally {
      setIsVerifying(false);
    }
  };

  // FUNCIONES DE CONTROL
  const toggleFavorite = (e, itemId) => {
    e.stopPropagation();
    if (favorites.includes(itemId)) {
      setFavorites(favorites.filter(id => id !== itemId));
    } else {
      setFavorites([...favorites, itemId]);
    }
  };

  const handleItemClick = (itemId) => {
    const newHistory = history.filter(id => id !== itemId);
    setHistory([itemId, ...newHistory]);
    
    if (activeBottomNav === 'movies') {
      setSelectedMovieId(itemId);
    } else if (activeBottomNav === 'series') {
      setSelectedSeriesId(itemId);
    } else {
      // Live TV u otros: lanzamos directamente el reproductor
      const channelObj = MOCK_CHANNELS.find(c => c.id === itemId);
      if (channelObj) {
        setPlayingMedia(channelObj);
      }
    }
  };

  // CÁLCULO DINÁMICO DE DATOS (A nivel general)
  const categoriesWithCounts = MOCK_CATEGORIES.map(cat => {
    if (cat.id === 'fav') return { ...cat, count: favorites.length };
    if (cat.id === 'hist') return { ...cat, count: history.length };
    
    if (cat.id === 'all') {
       const allCount = activeBottomNav === 'movies' ? MOCK_MOVIES.length : activeBottomNav === 'series' ? MOCK_SERIES.length : MOCK_CHANNELS.length;
       return { ...cat, count: allCount };
    }

    // Contar según el active context
    let specificCount = 0;
    if (activeBottomNav === 'movies') {
       specificCount = MOCK_MOVIES.filter(m => m.groupId === cat.id).length;
    } else if (activeBottomNav === 'series') {
       specificCount = MOCK_SERIES.filter(s => s.groupId === cat.id).length;
    } else {
       specificCount = MOCK_CHANNELS.filter(c => c.groupId === cat.id).length;
    }

    return { ...cat, count: specificCount };
  });

  // RUTINAS DE FILTRADO
  const getDisplayedChannels = () => {
    let filtered = MOCK_CHANNELS;
    if (activeCategory === 'fav') {
      filtered = MOCK_CHANNELS.filter(c => favorites.includes(c.id));
    } else if (activeCategory === 'hist') {
      filtered = history.map(id => MOCK_CHANNELS.find(c => c.id === id)).filter(Boolean);
    } else if (activeCategory !== 'all') {
      filtered = MOCK_CHANNELS.filter(c => c.groupId === activeCategory);
    }

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  };

  const getDisplayedMovies = () => {
    let filtered = MOCK_MOVIES;
    if (activeCategory === 'fav') {
      filtered = MOCK_MOVIES.filter(m => favorites.includes(m.id));
    } else if (activeCategory === 'hist') {
      filtered = history.map(id => MOCK_MOVIES.find(m => m.id === id)).filter(Boolean);
    } else if (activeCategory !== 'all') {
      filtered = MOCK_MOVIES.filter(m => m.groupId === activeCategory);
    }

    if (activeGenre !== 'Todos') {
      filtered = filtered.filter(m => m.genre.toLowerCase().includes(activeGenre.toLowerCase()));
    }

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  };

  const getDisplayedSeries = () => {
    let filtered = MOCK_SERIES;
    if (activeCategory === 'fav') {
      filtered = MOCK_SERIES.filter(s => favorites.includes(s.id));
    } else if (activeCategory === 'hist') {
      filtered = history.map(id => MOCK_SERIES.find(s => s.id === id)).filter(Boolean);
    } else if (activeCategory !== 'all') {
      filtered = MOCK_SERIES.filter(s => s.groupId === activeCategory);
    }

    if (activeGenre !== 'Todos') {
      filtered = filtered.filter(s => s.genre && s.genre.toLowerCase().includes(activeGenre.toLowerCase()));
    }

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  };

  const displayedChannels = getDisplayedChannels();
  const displayedMovies = getDisplayedMovies();
  const displayedSeries = getDisplayedSeries();

  const handleNextChannel = () => {
    if (!playingMedia) return;
    const isChannel = MOCK_CHANNELS.find(c => c.id === playingMedia.id);
    if (isChannel) {
      const idx = displayedChannels.findIndex(c => c.id === playingMedia.id);
      if (idx !== -1 && idx < displayedChannels.length - 1) {
        setPlayingMedia(displayedChannels[idx + 1]);
      }
    }
  };

  const handlePrevChannel = () => {
    if (!playingMedia) return;
    const isChannel = MOCK_CHANNELS.find(c => c.id === playingMedia.id);
    if (isChannel) {
      const idx = displayedChannels.findIndex(c => c.id === playingMedia.id);
      if (idx > 0) {
        setPlayingMedia(displayedChannels[idx - 1]);
      }
    }
  };

  return (
    <div className="dashboard-container fade-in">
      
      {/* HEADER / TOP BAR */}
      <div className="top-bar">
        <div className="top-bar-title">
          {activeBottomNav === 'home' && <><Home className="icon-live" size={24} /> {tr.nav.home}</>}
          {activeBottomNav === 'live' && <><Radio className="icon-live" size={24} /> {tr.nav.live}</>}
          {activeBottomNav === 'movies' && <><Film className="icon-live" size={24} /> {tr.nav.movies}</>}
          {activeBottomNav === 'series' && <><Clapperboard className="icon-live" size={24} /> {tr.nav.series}</>}
          {activeBottomNav === 'settings' && <><Settings className="icon-live" size={24} /> {tr.nav.settings}</>}
        </div>
        <RefreshCcw className="icon-refresh" size={22} />
      </div>

      {/* SEARCH BAR */}
      {activeBottomNav !== 'settings' && !(activeBottomNav === 'home' && selectedMatchId) && !(activeBottomNav === 'movies' && selectedMovieId) && !(activeBottomNav === 'series' && selectedSeriesId) && (
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder={tr.common.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="main-content">
        
        {/* SIDEBAR DRAWER */}
        {activeBottomNav !== 'home' && (
        <div 
          className={`drawer ${isDrawerOpen ? 'open' : ''}`}
          onMouseLeave={() => setIsDrawerOpen(false)}
        >
          <div className="drawer-toggle" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
            {isDrawerOpen ? <ChevronLeft className="toggle-icon" size={20} /> : <ChevronRight className="toggle-icon" size={20} />}
          </div>

          <div className="drawer-menu scroll-area">
            {/* RENDERIZADO DE MENÚS FIJOS DE SISTEMA */}
            {categoriesWithCounts.filter(cat => SYSTEM_CATEGORIES.some(sys => sys.id === cat.id)).map(cat => {
              const IconComp = cat.icon;
              return (
                <div 
                  key={cat.id} 
                  className={`menu-item ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setIsDrawerOpen(false);
                  }}
                >
                  <IconComp className="menu-icon" size={20} />
                  <span className="menu-label">{cat.name}</span>
                  <span className="menu-count">{cat.count > 0 ? cat.count : '0'}</span>
                  <span className="menu-arrow">{'>'}</span>
                </div>
              )
            })}

            {/* SEPARADOR VISUAL PARA LISTAS M3U */}
            <div style={{ height: '1px', background: '#1f1f1f', margin: '8px 20px' }}></div>

            {/* RENDERIZADO DE GRUPOS DINÁMICOS M3U (SOLO CATEGORÍAS QUE TIENEN ITEMS EN ESTA VISTA) */}
            {categoriesWithCounts.filter(cat => !SYSTEM_CATEGORIES.some(sys => sys.id === cat.id) && cat.count > 0).map(cat => {
              return (
                <div 
                  key={cat.id} 
                  className={`menu-item ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setIsDrawerOpen(false);
                  }}
                >
                  <span className="menu-label">{cat.name}</span>
                  <span className="menu-count">{cat.count > 0 ? cat.count : '0'}</span>
                  <span className="menu-arrow">{'>'}</span>
                </div>
              )
            })}
          </div>
        </div>
        )}

        {/* --- CONTENIDO DINÁMICO: HOME --- */}
        {activeBottomNav === 'home' && !selectedMatchId && !selectedMovieId && !selectedSeriesId && (
          <div className="movies-container scroll-area" style={{ width: '100%', maxWidth: '100%', padding: '0 40px 20px 40px' }}>
            <div className="home-sections-wrapper" style={{ paddingBottom: '100px' }}>
              
              {/* DEPORTES HOY - AGENDA PRIVADA */}
              <div className="home-section" style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <h3 className="section-title" style={{ fontSize: '24px', margin: 0, fontWeight: '700', color: 'white' }}>
                    Partidos Destacados:
                  </h3>
                </div>

                <div className="sports-agenda-board fade-in sports-desktop-scroll scroll-area" style={{ background: 'transparent', border: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
                  {(!liveSchedule || liveSchedule.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#888', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', width: '100%' }}>
                      <p>No hay eventos premium programados para hoy.</p>
                    </div>
                  ) : (
                    liveSchedule.map((match, idx) => {
                      
                      // Escaneamos inteligentemente el texto en busca de un formato de hora (ej: "21:00" o "9:45")
                      const timeStr = match.time || 'LIVE';
                      const timeMatch = timeStr.match(/\b\d{1,2}:\d{2}\b/);
                      
                      let showHora = '';
                      let showDia = match.day || '';
                      
                      if (timeMatch) {
                          // Extrae la hora exacta para la caja grande y deja lo demas abajo
                          showHora = timeMatch[0];
                          if (!showDia) {
                              showDia = timeStr.replace(timeMatch[0], '').trim();
                          }
                      } else {
                          showHora = timeStr;
                      }
                      
                      return (
                        <div key={match.id} className="sports-match-row manual-sports-card" onClick={() => setSelectedMatchId(match.id)} style={{ position: 'relative', overflow: 'hidden', minHeight: '65px', width: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', padding: '10px 20px', marginBottom: '8px' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `linear-gradient(to right, rgba(20,20,20,0.95), rgba(10,10,10,0.98))`, zIndex: 0 }} className="sports-bg-layer"></div>
                          
                          {/* Flujo Unificado a la Izquierda (Tren Tabular) */}
                          <div className="match-info-fluid" style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 0 }}>
                            
                            <div className="match-time-col" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', minWidth: '80px', height: '100%' }}>
                              <span className="match-time-main" style={{ color: 'var(--primary-red)', fontSize: '22px', fontWeight: '900', margin: 0, padding: 0, textShadow: '0 2px 8px rgba(217, 30, 24, 0.6)' }}>{showHora}</span>
                            </div>

                            {showDia ? (
                              <div className="match-day-col" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', minWidth: '100px', height: '100%' }}>
                                <span className="match-time-sub" style={{ color: 'white', fontWeight: '800', fontSize: '15px', textTransform: 'uppercase', margin: 0, padding: 0, opacity: 0.9, letterSpacing: '0.5px' }}>{showDia}</span>
                              </div>
                            ) : (
                              <div className="match-day-col" style={{ borderRight: '1px solid rgba(255,255,255,0.1)', minWidth: '100px', height: '100%' }}></div>
                            )}
                            
                            <div className="match-tournament-col" style={{ display: 'flex', alignItems: 'center', gap: '10px', borderRight: '1px solid rgba(255,255,255,0.1)', minWidth: '160px', paddingLeft: '20px', paddingRight: '20px', height: '100%' }}>
                              {match.tournamentLogo && <img src={match.tournamentLogo} alt="Torneo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />}
                              {match.tournament && <span className="match-time-sub" style={{ color: '#f1c40f', fontWeight: '800', fontSize: '15px', textTransform: 'uppercase', margin: 0, padding: 0, letterSpacing: '0.5px' }}>{match.tournament}</span>}
                            </div>

                            <div className="match-teams-col" style={{ display: 'flex', alignItems: 'center', paddingLeft: '20px', flex: 1 }}>
                              <span style={{ color: 'white', fontWeight: '800', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, padding: 0 }}>{(match.title || '').replace(/\s+vs\s+/gi, ' - ')}</span>
                            </div>
                          </div>

                          <div className="match-action-col" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: '100px' }}>
                            <button className="premium-btn" onClick={(e) => { e.stopPropagation(); setSelectedMatchId(match.id); }} style={{ background: 'var(--primary-red)', padding: '8px 24px', fontSize: '13px', fontWeight: 'bold', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(217, 30, 24, 0.4)' }}>
                                Ver
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* PELICULAS DESTACADAS */}
              <div className="home-section" style={{ marginTop: '16px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingRight: '20px' }}>
                  <h3 className="section-title" style={{ fontSize: '22px', margin: 0, fontWeight: '500' }}>{tr.home.featuredMovies}</h3>
                  <button 
                    onClick={() => setActiveBottomNav('movies')} 
                    style={{ background: 'transparent', border: 'none', color: '#f1c40f', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    Ver todo <ChevronRight size={18} />
                  </button>
                </div>
                
                <button className="carousel-nav-btn left fade-in" onClick={() => scrollRef(homeMoviesRef, -600)}>
                  <ChevronLeft size={32} />
                </button>

                <div className="similar-movies-list scroll-area-x" ref={homeMoviesRef} style={{ scrollBehavior: 'smooth' }}>
                  {(() => {
                    // Tomamos los primeros elementos entregados por el proveedor (suelen ser las novedades / más vistas)
                    return MOCK_MOVIES.slice(0, 10);
                  })().map((movie, idx) => {
                    const currentPoster = fixedPosters[movie.id] || movie.poster;
                    const isFetchingIMDB = activeSearchIMDB[movie.id];
                    return (
                      <div 
                        key={`${movie.id}-${idx}`} 
                        className="movie-poster-card" 
                        style={{ flexShrink: 0, width: '220px', height: '330px' }}
                        onClick={() => setSelectedMovieId(movie.id)}
                      >
                        <div className="movie-poster-wrapper" style={{ position: 'relative' }}>
                          <button 
                            className="fav-badge-floating" 
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(e, movie.id); }}
                          >
                            <Star fill={favorites.includes(movie.id) ? '#f1c40f' : 'rgba(0,0,0,0.5)'} color={favorites.includes(movie.id) ? '#f1c40f' : '#fff'} size={16} />
                          </button>
                          
                          <div className="imdb-badge-floating">
                            <Star size={10} fill="#f1c40f" color="#f1c40f"/> {movie.imdb || 'N/A'}
                          </div>

                          <div className="title-badge-floating">
                            <span>{cleanTitle(movie.title)}</span>
                          </div>
                          
                          <img 
                            src={currentPoster} 
                            alt={movie.title} 
                            className="movie-poster-img" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                              if (!activeSearchIMDB[movie.id] && !fixedPosters[movie.id]) {
                                setActiveSearchIMDB(prev => ({...prev, [movie.id]: true}));
                                setTimeout(() => {
                                  setFixedPosters(prev => ({...prev, [movie.id]: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg'}));
                                  setActiveSearchIMDB(prev => ({...prev, [movie.id]: false}));
                                  e.target.style.display = 'block';
                                  e.target.nextSibling.style.display = 'none';
                                }, 2500);
                              }
                            }} 
                          />
                          <div className="movie-poster-fallback" style={{ display: 'none' }}>
                            {isFetchingIMDB ? (
                               <>
                                 <RefreshCcw className="icon-spin" size={32} color="#f1c40f" style={{ marginBottom: '8px' }} />
                                 <span style={{ color: '#f1c40f', fontSize: '12px' }}>Buscando en IMDB...</span>
                               </>
                            ) : (
                               <>
                                 <ImageIcon size={32} color="#444" style={{ marginBottom: '8px' }} />
                                 <span>{movie.title}</span>
                               </>
                            )}
                          </div>
                          <div className="movie-hover-info">
                            <div className="movie-hover-meta" style={{ justifyContent: 'center' }}>
                              <span className="movie-hover-year">{cleanTitle(movie.title)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button className="carousel-nav-btn right fade-in" onClick={() => scrollRef(homeMoviesRef, 600)}>
                  <ChevronRight size={32} />
                </button>
              </div>

              {/* SERIES DESTACADAS */}
              <div className="home-section" style={{ marginTop: '16px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingRight: '20px' }}>
                  <h3 className="section-title" style={{ fontSize: '22px', margin: 0, fontWeight: '500' }}>{tr.home.featuredSeries}</h3>
                  <button 
                    onClick={() => setActiveBottomNav('series')} 
                    style={{ background: 'transparent', border: 'none', color: '#f1c40f', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    Ver todo <ChevronRight size={18} />
                  </button>
                </div>
                
                <button className="carousel-nav-btn left fade-in" onClick={() => scrollRef(homeSeriesRef, -600)}>
                  <ChevronLeft size={32} />
                </button>

                <div className="similar-movies-list scroll-area-x" ref={homeSeriesRef} style={{ scrollBehavior: 'smooth' }}>
                  {(() => {
                    // Tomamos los primeros elementos entregados por el proveedor (suelen ser las novedades / más vistas)
                    return MOCK_SERIES.slice(0, 10);
                  })().map((series, idx) => {
                    const currentPoster = fixedPosters[series.id] || series.poster;
                    const isFetchingIMDB = activeSearchIMDB[series.id];
                    return (
                      <div 
                        key={`${series.id}-${idx}`} 
                        className="movie-poster-card" 
                        style={{ flexShrink: 0, width: '220px', height: '330px' }}
                        onClick={() => setSelectedSeriesId(series.id)}
                      >
                        <div className="movie-poster-wrapper" style={{ position: 'relative' }}>
                          <button 
                            className="fav-badge-floating" 
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(e, series.id); }}
                          >
                            <Star fill={favorites.includes(series.id) ? '#f1c40f' : 'rgba(0,0,0,0.5)'} color={favorites.includes(series.id) ? '#f1c40f' : '#fff'} size={16} />
                          </button>
                          
                          <div className="imdb-badge-floating">
                            <Star size={10} fill="#f1c40f" color="#f1c40f"/> {series.imdb || 'N/A'}
                          </div>

                          <div className="title-badge-floating">
                            <span>{cleanTitle(series.title)}</span>
                          </div>
                          
                          <img 
                            src={currentPoster} 
                            alt={series.title} 
                            className="movie-poster-img" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                              if (!activeSearchIMDB[series.id] && !fixedPosters[series.id]) {
                                setActiveSearchIMDB(prev => ({...prev, [series.id]: true}));
                                fetch('https://api.tvmaze.com/singlesearch/shows?q=' + encodeURIComponent(series.title))
                                  .then(res => res.json())
                                  .then(data => {
                                    if(data && data.image && data.image.original) {
                                      setFixedPosters(prev => ({...prev, [series.id]: data.image.original}));
                                    } else {
                                      setFixedPosters(prev => ({...prev, [series.id]: 'https://placehold.co/500x750/222/FFF.png?text=' + encodeURIComponent(series.title)}));
                                    }
                                  })
                                  .catch(() => {
                                    setFixedPosters(prev => ({...prev, [series.id]: 'https://placehold.co/500x750/222/FFF.png?text=' + encodeURIComponent(series.title)}));
                                  })
                                  .finally(() => {
                                    setActiveSearchIMDB(prev => ({...prev, [series.id]: false}));
                                    e.target.style.display = 'block';
                                    e.target.nextSibling.style.display = 'none';
                                  });
                              }
                            }}
                          />
                          <div className="movie-poster-fallback" style={{ display: 'none' }}>
                            {isFetchingIMDB ? (
                               <>
                                 <RefreshCcw className="icon-spin" size={32} color="#f1c40f" style={{ marginBottom: '8px' }} />
                                 <span style={{ color: '#f1c40f', fontSize: '12px' }}>Buscando en IMDB...</span>
                               </>
                            ) : (
                               <>
                                 <ImageIcon size={32} color="#444" style={{ marginBottom: '8px' }} />
                                 <span>{series.title}</span>
                               </>
                            )}
                          </div>
                          <div className="movie-hover-info">
                            <div className="movie-hover-meta" style={{ justifyContent: 'center' }}>
                              <span className="movie-hover-year">{cleanTitle(series.title)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button className="carousel-nav-btn right fade-in" onClick={() => scrollRef(homeSeriesRef, 600)}>
                  <ChevronRight size={32} />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* --- CONTENIDO DINÁMICO: DETALLE PARTIDO --- */}
        {activeBottomNav === 'home' && selectedMatchId && (
          <div className="movie-detail-view fade-in" style={{ width: '100%' }}>
            {(() => {
              const match = liveSchedule?.find(m => m.id === selectedMatchId) || MOCK_SPORTS_AGENDA.find(m => m.id === selectedMatchId);
              if (!match) return null;
              
              return (
                <div className="movie-detail-wrapper" style={{ marginLeft: 0 }}>
                  <div className="movie-detail-content scroll-area" style={{ maxWidth: '100%', padding: '40px' }}>
                    <button className="btn-back" onClick={() => setSelectedMatchId(null)}>
                      <ArrowLeft size={24} /> {tr.common.back}
                    </button>

                    <div className="movie-detail-grid layout">

                      <div className="movie-detail-info fade-in-up" style={{ animationDelay: '0.1s' }}>
                        
                        <div className="movie-detail-meta" style={{ gap: '14px', marginBottom: '32px' }}>
                          <span className="meta-pill" style={{ background: 'var(--primary-red)', border: 'none', color: 'white', fontSize: '16px', padding: '10px 20px', fontWeight: '800' }}>
                            {match.time}
                          </span>
                          {match.day && (
                            <span className="meta-pill" style={{ background: '#f1c40f', border: 'none', color: 'white', fontSize: '16px', padding: '10px 20px', fontWeight: '800', textTransform: 'uppercase' }}>
                              {match.day}
                            </span>
                          )}
                          <span className="meta-pill outline" style={{ fontSize: '16px', padding: '10px 20px', fontWeight: '800', textTransform: 'uppercase', borderColor: 'rgba(255,255,255,0.2)' }}>
                            {match.tournament}
                          </span>
                        </div>

                        <h3 style={{ marginBottom: '20px', fontSize: '22px', fontWeight: '500', color: '#fff' }}>{tr.movieDetail.whereToWatch}</h3>
                        
                        <div className="channels-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                          {(match.channelsList && match.channelsList.length > 0 ? match.channelsList : ["No Especificado"]).map((channelText, idx) => {
                            const rawName = typeof channelText === 'string' ? channelText : (channelText.name || 'Desconocido');
                            return (
                              <div 
                                key={`panel-ch-${idx}`} 
                                className="channel-card" 
                                style={{ cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}
                                onClick={() => {
                                  setSelectedMatchId(null);
                                  setActiveBottomNav('live');
                                  setSearchQuery(rawName.replace('M+', ''));
                                }}
                              >
                                <div className="channel-logo-box" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                  <span style={{ fontSize: '20px', fontWeight: '900', color: '#555' }}>TV</span>
                                </div>
                                <div className="channel-info">
                                  <h3 className="channel-name" style={{ fontSize: '17px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{rawName}</h3>
                                  <p className="channel-epg" style={{ color: 'var(--primary-red)', fontSize: '12px' }}>Emisión Oficial</p>
                                </div>
                                <div className="channel-action">
                                  <Search size={22} color="#666" style={{ cursor: 'pointer' }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* --- CONTENIDO DINÁMICO: CANALES --- */}
        {activeBottomNav === 'live' && (
          <div className="channels-container scroll-area">
            <div className="channels-grid">
              {displayedChannels.length === 0 && (
                <div style={{ color: 'gray', textAlign: 'center', marginTop: '40px' }}>
                  No se encontraron canales.
                </div>
              )}

              {displayedChannels.map(channel => {
                const isFav = favorites.includes(channel.id);
                return (
                  <div key={channel.id} className="channel-card" onClick={() => handleItemClick(channel.id)}>
                    <div className="channel-logo-box">
                      <img 
                        src={channel.img} 
                        alt={channel.name} 
                        className="channel-logo-img" 
                        onError={(e) => { e.target.src = 'https://placehold.co/100x100/222/FFF.png?text=TV' }}
                      />
                    </div>
                    
                    <div className="channel-info">
                      <h3 className="channel-name">{channel.name}</h3>
                      <p className="channel-epg">{channel.epg}</p>
                    </div>

                    <div className="channel-action">
                      <Star 
                        size={22} 
                        className={`star-icon ${isFav ? 'favorited' : ''}`} 
                        onClick={(e) => toggleFavorite(e, channel.id)}
                        fill={isFav ? '#f1c40f' : 'none'}
                        color={isFav ? '#f1c40f' : 'gray'}
                      />
                      <Play size={20} className="play-button-icon" fill="currentColor" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* --- CONTENIDO DINÁMICO: PELÍCULAS --- */}
        {selectedMovieId && (
          <div className="movie-detail-view fade-in">
            {(() => {
              const movie = MOCK_MOVIES.find(m => m.id === selectedMovieId);
              if (!movie) return null;
              const isFav = favorites.includes(movie.id);
              
              return (
                <div className="movie-detail-wrapper">
                  <div className="movie-detail-content scroll-area">
                    <button className="btn-back" onClick={() => setSelectedMovieId(null)} style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', padding: '8px 16px', borderRadius: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '14px', fontWeight: 'bold', marginBottom: '35px', cursor: 'pointer', outline: 'none' }}>
                      <ArrowLeft size={16} /> Volver
                    </button>

                    <div className="movie-detail-grid layout">
                      <div className="movie-detail-poster-container fade-in-up">
                        <Star 
                          size={28} 
                          className={`star-icon-movie pos-top-left ${isFav ? 'favorited' : ''}`} 
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(e, movie.id); }}
                          fill={isFav ? '#f1c40f' : 'transparent'}
                          color={isFav ? '#f1c40f' : 'rgba(255,255,255,0.6)'}
                          strokeWidth={2}
                          style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))', cursor: 'pointer' }}
                        />

                        <img 
                          src={fixedPosters[movie.id] || movie.poster} 
                          alt={movie.title} 
                          className="movie-detail-poster-img" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="movie-poster-fallback large" style={{ display: 'none' }}>
                          <ImageIcon size={64} color="#444" />
                        </div>
                      </div>
                      
                      <div className="movie-detail-info fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <h2 className="movie-detail-title" style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'system-ui, -apple-system, sans-serif', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.5px', color: '#fff' }}>
                          {cleanTitle(movie.title)}
                        </h2>
                        
                        <div className="movie-detail-meta" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
                          <span style={{ background: '#ffb400', color: '#000', fontWeight: 'bold', padding: '4px 12px', borderRadius: '4px', fontSize: '15px' }}>
                            {formatRating(movieDetails[movie.id]?.imdb || movie.imdb)}
                          </span>
                        </div>

                        <p className="movie-detail-synopsis" style={{ fontSize: '16px', lineHeight: '1.6', color: '#d1d1d1', marginBottom: '25px', maxWidth: '650px' }}>
                          {movieDetails[movie.id]?.synopsis || movie.synopsis}
                        </p>

                        <table className="movie-detail-crew-table" style={{ fontSize: '15px', borderCollapse: 'collapse', marginBottom: '35px' }}>
                          <tbody>
                            <tr>
                              <td style={{ color: '#fff', fontWeight: 'bold', paddingRight: '20px', paddingBottom: '8px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>Director:</td>
                              <td style={{ color: '#d1d1d1', paddingBottom: '8px' }}>{movieDetails[movie.id]?.director || movie.director}</td>
                            </tr>
                            <tr>
                              <td style={{ color: '#fff', fontWeight: 'bold', paddingRight: '20px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>Reparto:</td>
                              <td style={{ color: '#d1d1d1' }}>{movieDetails[movie.id]?.cast || movie.cast}</td>
                            </tr>
                          </tbody>
                        </table>

                        <div className="movie-detail-actions">
                          <button className="btn-play-movie" onClick={() => setPlayingMedia(movie)} style={{ background: '#cc0000', color: '#fff', border: 'none', padding: '12px 26px', borderRadius: '30px', fontSize: '16px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <Play size={20} fill="currentColor" /> Reproducir
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="movie-similar-section fade-in-up" style={{ marginTop: '50px', width: '100%', paddingBottom: '30px' }}>
                      <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '20px', fontWeight: 'bold' }}>Películas parecidas:</h3>
                      <div className="similar-movies-row scroll-area-x" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '20px' }}>
                        {MOCK_MOVIES.filter(m => m.groupId === movie.groupId && m.id !== movie.id).slice(0, 10).map(similar => (
                          <div key={similar.id} className="similar-movie-card" onClick={(e) => { e.stopPropagation(); setSelectedMovieId(similar.id); }} style={{ width: '140px', flexShrink: 0, cursor: 'pointer', transition: 'transform 0.2s' }}>
                            <img src={fixedPosters[similar.id] || similar.poster} alt={similar.title} style={{ width: '100%', height: '210px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }} onError={(e) => { e.target.src = 'https://placehold.co/300x450/101010/FFF.png?text=Sin+Portada'; }} />
                            <p style={{ color: '#fff', fontSize: '13px', marginTop: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '600', textAlign: 'center', margin: 0 }}>
                              {cleanTitle(similar.title)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeBottomNav === 'movies' && !selectedMovieId && !selectedSeriesId && (
          <div className="movies-container scroll-area">



            {/* Píldoras de Filtros Rápido de Género */}
            <div className="genre-pills-container" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
              {[tr.common.all, tr.common.action, tr.common.drama, tr.common.comedy, tr.common.crime, tr.common.romance, tr.common.terror].map(genre => (
                <button 
                  key={genre} 
                  className={`genre-pill ${activeGenre === genre ? 'active' : ''}`}
                  onClick={() => setActiveGenre(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>

            <div className="movies-grid">
              
              {displayedMovies.length === 0 && (
                <div style={{ color: 'gray', textAlign: 'center', marginTop: '40px', gridColumn: '1 / -1' }}>
                  {tr.common.notFound}
                </div>
              )}

              {displayedMovies.map(movie => {
                const isFav = favorites.includes(movie.id);
                const currentPoster = fixedPosters[movie.id] || movie.poster;
                const isFetchingIMDB = activeSearchIMDB[movie.id];
                return (
                  <div key={movie.id} className="movie-poster-card" onClick={() => handleItemClick(movie.id)}>
                    
                    <div className="movie-poster-wrapper" style={{ position: 'relative' }}>
                      <button 
                        className="fav-badge-floating" 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(e, movie.id); }}
                      >
                        <Star fill={isFav ? '#f1c40f' : 'rgba(0,0,0,0.5)'} color={isFav ? '#f1c40f' : '#fff'} size={16} />
                      </button>
                      
                      <div className="imdb-badge-floating">
                        <Star size={10} fill="#f1c40f" color="#f1c40f"/> {movie.imdb || 'N/A'}
                      </div>

                      <div className="title-badge-floating">
                        <span>{cleanTitle(movie.title)}</span>
                      </div>

                      {/* Imagen Real o Rescatada de IMDb */}
                      <img 
                        key={currentPoster}
                        src={currentPoster} 
                        alt={movie.title} 
                        className="movie-poster-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                          
                          // SIMULADOR DE BÚSQUEDA EN IMDB
                          if (!activeSearchIMDB[movie.id] && !fixedPosters[movie.id]) {
                            setActiveSearchIMDB(prev => ({...prev, [movie.id]: true}));
                            
                            setTimeout(() => {
                              setFixedPosters(prev => ({
                                ...prev, 
                                [movie.id]: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg' 
                              }));
                              setActiveSearchIMDB(prev => ({...prev, [movie.id]: false}));
                              e.target.style.display = 'block';
                              e.target.nextSibling.style.display = 'none';
                            }, 2500);
                          }
                        }}
                      />
                      {/* Fallback de Carátula / Loader IMDb */}
                      <div className="movie-poster-fallback" style={{ display: 'none' }}>
                        {isFetchingIMDB ? (
                           <>
                             <RefreshCcw className="icon-spin" size={32} color="#f1c40f" style={{ marginBottom: '8px' }} />
                             <span style={{ color: '#f1c40f', fontSize: '12px' }}>Buscando en IMDB...</span>
                           </>
                        ) : (
                           <>
                             <ImageIcon size={32} color="#444" style={{ marginBottom: '8px' }} />
                             <span>{movie.title}</span>
                           </>
                        )}
                      </div>
                    </div>

                      <div className="movie-hover-info">
                        <div className="movie-hover-meta" style={{ justifyContent: 'center' }}>
                          <span className="movie-hover-year">{cleanTitle(movie.title)}</span>
                        </div>
                      </div>
                    </div>
                )
              })}

            </div>
          </div>
        )}

      {/* --- CONTENIDO DINÁMICO: SERIES --- */}
      {selectedSeriesId && (
          <div className="movie-detail-view fade-in">
            {(() => {
              const series = MOCK_SERIES.find(s => s.id === selectedSeriesId);
              if (!series) return null;
              const activeDetails = movieDetails[series.id] || {};
              const isFav = favorites.includes(series.id);
              const displaySeasons = activeDetails.seasons || series.seasons;
              const currentSeason = displaySeasons.find(s => s.seasonNumber === activeSeason) || displaySeasons[0] || { seasonNumber: 1, episodes: [] };
              
              return (
                <div className="movie-detail-wrapper">
                  <div className="movie-detail-content scroll-area">
                    <button className="btn-back" onClick={() => setSelectedSeriesId(null)} style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', padding: '8px 16px', borderRadius: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '14px', fontWeight: 'bold', marginBottom: '35px', cursor: 'pointer', outline: 'none' }}>
                      <ArrowLeft size={16} /> Volver
                    </button>

                    <div className="series-detail-header fade-in-up">
                        <div className="movie-detail-poster-container">
                          <Star 
                            size={28} 
                            className={`star-icon-movie pos-top-left ${isFav ? 'favorited' : ''}`} 
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(e, series.id); }}
                            fill={isFav ? '#f1c40f' : 'transparent'}
                            color={isFav ? '#f1c40f' : 'rgba(255,255,255,0.6)'}
                            strokeWidth={2}
                            style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))', cursor: 'pointer' }}
                          />

                          <img 
                            src={fixedPosters[series.id] || series.poster} 
                            alt={series.title} 
                            className="movie-detail-poster-img" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        </div>

                        <div className="movie-detail-info">
                          <h2 className="movie-detail-title" style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'system-ui, -apple-system, sans-serif', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.5px', color: '#fff' }}>
                            {cleanTitle(series.title)}
                          </h2>
                          
                          <div className="movie-detail-meta" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
                            <span style={{ background: '#ffb400', color: '#000', fontWeight: 'bold', padding: '4px 12px', borderRadius: '4px', fontSize: '15px' }}>
                              {formatRating(activeDetails.imdb || series.imdb)}
                            </span>
                          </div>

                          <p className="movie-detail-synopsis" style={{ fontSize: '16px', lineHeight: '1.6', color: '#d1d1d1', marginBottom: '25px', maxWidth: '650px' }}>
                            {activeDetails.synopsis || series.synopsis}
                          </p>

                          <table className="movie-detail-crew-table" style={{ fontSize: '15px', borderCollapse: 'collapse', marginBottom: '35px' }}>
                            <tbody>
                              <tr>
                                <td style={{ color: '#fff', fontWeight: 'bold', paddingRight: '20px', paddingBottom: '8px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>Director:</td>
                                <td style={{ color: '#d1d1d1', paddingBottom: '8px' }}>{activeDetails.director || series.director}</td>
                              </tr>
                              <tr>
                                <td style={{ color: '#fff', fontWeight: 'bold', paddingRight: '20px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>Reparto:</td>
                                <td style={{ color: '#d1d1d1' }}>{activeDetails.cast || series.cast}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                    </div>

                    {/* SELECTOR DE TEMPORADAS Y EPISODIOS */}
                    <div className="series-seasons-section">
                      <div className="seasons-selector-container fade-in-up" style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <select 
                          className="season-select"
                          value={activeSeason}
                          onChange={(e) => setActiveSeason(Number(e.target.value))}
                          style={{
                            backgroundColor: '#1a1a1a',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.2)',
                            padding: '12px 35px 12px 18px',
                            fontSize: '18px',
                            fontWeight: '600',
                            borderRadius: '6px',
                            outline: 'none',
                            cursor: 'pointer',
                            minWidth: '220px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                            fontFamily: 'inherit',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 15px top 50%',
                            backgroundSize: '12px auto'
                          }}
                        >
                          {displaySeasons.map(season => (
                            <option key={season.seasonNumber} value={season.seasonNumber} style={{ background: '#1a1a1a', color: '#fff', padding: '10px' }}>
                              {tr.seriesDetail.season} {season.seasonNumber}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="episodes-list fade-in-up">
                        {currentSeason.episodes.map(ep => (
                          <div key={ep.id} className="episode-card" onClick={() => setPlayingMedia({ ...ep, parentTitle: series.title })}>
                            <div className="episode-thumbnail-container">
                              <img src={ep.image} alt={ep.title} className="episode-thumbnail" />
                              <div className="episode-play-overlay">
                                <Play fill="white" size={24} />
                              </div>
                            </div>
                            <div className="episode-info">
                              <h4 className="episode-title">{ep.epNumber}. {ep.title}</h4>
                              <p className="episode-synopsis">{ep.synopsis}</p>
                              <span className="episode-duration">{ep.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="movie-similar-section fade-in-up" style={{ marginTop: '50px', width: '100%', paddingBottom: '30px' }}>
                      <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '20px', fontWeight: 'bold' }}>Series parecidas:</h3>
                      <div className="similar-movies-row scroll-area-x" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '20px' }}>
                        {MOCK_SERIES.filter(s => s.groupId === series.groupId && s.id !== series.id).slice(0, 10).map(similar => (
                          <div key={similar.id} className="similar-movie-card" onClick={(e) => { e.stopPropagation(); setSelectedSeriesId(similar.id); }} style={{ width: '140px', flexShrink: 0, cursor: 'pointer', transition: 'transform 0.2s' }}>
                            <img src={fixedPosters[similar.id] || similar.poster} alt={similar.title} style={{ width: '100%', height: '210px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }} onError={(e) => { e.target.src = 'https://placehold.co/300x450/101010/FFF.png?text=Sin+Portada'; }} />
                            <p style={{ color: '#fff', fontSize: '13px', marginTop: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '600', textAlign: 'center', margin: 0 }}>
                              {cleanTitle(similar.title)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* GRILLA DE SERIES */}
        {activeBottomNav === 'series' && !selectedSeriesId && !selectedMovieId && (
          <div className="movies-container scroll-area">


            <div className="genre-pills-container" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
              {[tr.common.all, tr.common.action, tr.common.drama, tr.common.comedy, tr.common.crime, tr.common.romance, tr.common.terror].map(genre => (
                <button 
                  key={genre}
                  className={`genre-pill ${activeGenre === genre ? 'active' : ''}`}
                  onClick={() => setActiveGenre(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>

            <div className="movies-grid">
               {displayedSeries.map(series => {
                const isFav = favorites.includes(series.id);
                return (
                  <div key={series.id} className="movie-poster-card" onClick={() => { setSelectedSeriesId(series.id); setActiveSeason(1); }}>
                    <div className="movie-poster-wrapper" style={{ position: 'relative' }}>
                      <button 
                        className="fav-badge-floating" 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(e, series.id); }}
                      >
                        <Star fill={isFav ? '#f1c40f' : 'rgba(0,0,0,0.5)'} color={isFav ? '#f1c40f' : '#fff'} size={16} />
                      </button>
                      
                      <div className="imdb-badge-floating">
                        <Star size={10} fill="#f1c40f" color="#f1c40f"/> {series.imdb || 'N/A'}
                      </div>

                      <div className="title-badge-floating">
                        <span>{cleanTitle(series.title)}</span>
                      </div>
                      
                      <img 
                        src={series.poster} 
                        alt={series.title} 
                        className="movie-poster-img"
                      />
                      <div className="movie-hover-info">
                        <div className="movie-hover-meta" style={{ justifyContent: 'center' }}>
                          <span className="movie-hover-year">{cleanTitle(series.title)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      {/* --- CONTENIDO DINÁMICO: AJUSTES --- */}
      {activeBottomNav === 'settings' && (
        <div className="settings-view-container scroll-area fade-in">
          <div className="settings-content-wrapper">
            {/* SECCIÓN 1: Suscripción VIP */}
            <div className="settings-card payment-banner">
              <div className="settings-card-header">
                <Shield size={24} color="#f1c40f" />
                <div className="settings-card-title-group">
                  <h3 style={{ color: '#f1c40f' }}>{tr.payment?.title || 'Licencia Premium (1 Año)'}</h3>
                  <p>{tr.payment?.desc || 'Acceso total y soporte garantizado.'}</p>
                </div>
              </div>

              {!isPremium ? (
                <div className="payment-action-box fade-in">
                  <div className="payment-price-tag">{tr.payment?.price || '7,00 €'}</div>
                  
                  <button className="btn-paypal" onClick={handlePayPalPayment} disabled={isVerifying}>
                    <Globe size={20} /> {tr.payment?.payPayPal || 'Pagar con PayPal'}
                  </button>
                </div>
              ) : (
                <div className="payment-success-box bounce-in" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', padding: '16px', background: 'rgba(46, 204, 113, 0.1)', borderRadius: '8px', border: '1px solid rgba(46, 204, 113, 0.3)' }}>
                  <div className="status-dot green" style={{ width: 14, height: 14 }}></div>
                  <h4 style={{ color: '#2ecc71', fontSize: '18px', margin: 0 }}>{tr.payment?.success || '¡Licencia Activada con éxito!'}</h4>
                </div>
              )}
            </div>

            {/* SECCIÓN 2: Listas IPTV */}
            <div className="settings-card">
              <div className="settings-card-header">
                <Tv size={24} color="var(--primary-red)" />
                <div className="settings-card-title-group">
                  <h3>{tr.settings.iptvLists}</h3>
                  <p>{tr.settings.iptvListsSub}</p>
                </div>
              </div>
              <button className="btn-ghost-rounded" onClick={onLogout}>
                {tr.settings.addList}
              </button>
            </div>

            {/* SECCIÓN 3: Configuración IPTV */}
            <div className="settings-card">
              <div className="settings-card-header">
                <Settings size={24} color="var(--primary-red)" />
                <div className="settings-card-title-group">
                  <h3>{tr.settings.iptvConfig}</h3>
                  <p>{tr.settings.iptvConfigSub}</p>
                </div>
              </div>

              <div className="settings-form-row">
                <label>{tr.settings.bufferSize}</label>
                <select className="settings-select" defaultValue="medio">
                  <option value="medio">{tr.settings.bufferDesc}</option>
                  <option value="grande">{tr.settings.bufferBig}</option>
                  <option value="pequeno">{tr.settings.bufferSmall}</option>
                </select>
              </div>

              <div className="settings-form-row">
                <label>{tr.settings.streamQuality}</label>
                <select className="settings-select" defaultValue="1080p">
                  <option value="1080p">{tr.settings.qualityFHD}</option>
                  <option value="720p">{tr.settings.qualityHD}</option>
                  <option value="4k">{tr.settings.quality4k}</option>
                </select>
              </div>

              <div className="settings-form-row">
                <label>{tr.settings.playerType}</label>
                <select className="settings-select" defaultValue="auto">
                  <option value="auto">{tr.settings.playerAuto}</option>
                  <option value="exo">{tr.settings.playerExo}</option>
                  <option value="vlc">{tr.settings.playerVLC}</option>
                </select>
              </div>

              <div className="settings-form-row toggle-row">
                <div className="toggle-text">
                  <label>{tr.settings.autoPlay}</label>
                  <p>{tr.settings.autoPlaySub}</p>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            {/* SECCIÓN NUEVA: Idioma de la App */}
            <div className="settings-card">
              <div className="settings-card-header">
                <Globe size={24} color="var(--primary-red)" />
                <div className="settings-card-title-group">
                  <h3>{tr.settings.appLanguage}</h3>
                  <p>{tr.settings.appLanguageSub}</p>
                </div>
              </div>

              <div className="settings-form-row">
                <label>{tr.settings.selectedLanguage}</label>
                <select className="settings-select" value={appLanguage} onChange={(e) => setAppLanguage(e.target.value)}>
                  <option value="es">{tr.settings.langES}</option>
                  <option value="en">{tr.settings.langEN}</option>
                </select>
              </div>
            </div>

            {/* SECCIÓN 4: Acciones de Cuenta */}
            <div className="settings-card account-actions-card">
              <button className="btn-danger-solid" onClick={onLogout}>
                <LogOut size={20} /> {tr.nav.logout}
              </button>
              <button className="btn-danger-outline" onClick={() => {
                localStorage.removeItem('licenseStatus');
                window.location.reload();
              }}>
                <Trash2 size={20} /> {tr.settings.deleteAccount}
              </button>
            </div>

          </div>
        </div>
      )}

      </div>

      {/* BOTTOM NAVIGATION */}
      <div className="bottom-nav">
        <div className={`nav-item ${activeBottomNav === 'home' ? 'active' : ''}`} onClick={() => { setActiveBottomNav('home'); setSelectedMovieId(null); setSelectedSeriesId(null); setSelectedMatchId(null); }}>
          <Home size={24} /><span>{tr.nav.home}</span>
        </div>
        <div className={`nav-item ${activeBottomNav === 'live' ? 'active' : ''}`} onClick={() => { setActiveBottomNav('live'); setSelectedMovieId(null); setSelectedSeriesId(null); setSelectedMatchId(null); }}>
          <Tv size={24} /><span>{tr.nav.live}</span>
        </div>
        <div className={`nav-item ${activeBottomNav === 'movies' ? 'active' : ''}`} onClick={() => { setActiveBottomNav('movies'); setActiveCategory('all'); setSelectedMovieId(null); setSelectedSeriesId(null); setActiveGenre('Todos'); setSelectedMatchId(null); }}>
          <Film size={24} /><span>{tr.nav.movies}</span>
        </div>
        <div className={`nav-item ${activeBottomNav === 'series' ? 'active' : ''}`} onClick={() => { setActiveBottomNav('series'); setActiveCategory('all'); setSelectedMovieId(null); setSelectedSeriesId(null); setSelectedMatchId(null); }}>
          <Clapperboard size={24} /><span>{tr.nav.series}</span>
        </div>
        <div className={`nav-item ${activeBottomNav === 'settings' ? 'active' : ''}`} onClick={() => { setActiveBottomNav('settings'); setSelectedMovieId(null); setSelectedSeriesId(null); setSelectedMatchId(null); }}>
          <Settings size={24} /><span>{tr.nav.settings}</span>
        </div>
        <div className="nav-item" onClick={onLogout}>
          <LogOut size={24} /><span>{tr.nav.logout}</span>
        </div>
      </div>

      {/* REPRODUCTOR DE VIDEO ROOT */}
      {playingMedia && (
        <VideoPlayer 
          media={playingMedia} 
          onClose={() => setPlayingMedia(null)} 
          onNext={MOCK_CHANNELS.find(c => c.id === playingMedia.id) ? handleNextChannel : undefined}
          onPrev={MOCK_CHANNELS.find(c => c.id === playingMedia.id) ? handlePrevChannel : undefined}
        />
      )}

      {/* MODAL DEL QR DE PAGO (3 PASOS TELEGRAM) */}
      {showQRModal && (
        <div className="qr-overlay fade-in" onClick={() => setShowQRModal(false)}>
          <div className="qr-modal-card bounce-in telegram-modal" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-qr" onClick={() => setShowQRModal(false)}>✕</button>
            <h2 className="qr-title">{tr.payment?.title || 'Adquirir Licencia VIP'}</h2>
            
            <div className="telegram-steps-container">
              {/* PASO 1 */}
              <div className="telegram-step">
                <div className="telegram-step-header">
                  <div className="telegram-step-number">1</div>
                  <h4>{tr.payment?.step1 || 'Transfiere 6.99 EUR'}</h4>
                </div>
                <div className="qr-image-wrapper telegram-qr-wrapper">
                  <img src="/qrxx.png" alt="Código QR @thrip" className="qr-image" 
                    onError={(e) => e.target.src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://paypal.me/thrip/6.99EUR"} />
                </div>
              </div>

              {/* PASO 2 */}
              <div className="telegram-step">
                <div className="telegram-step-header">
                  <div className="telegram-step-number">2</div>
                  <h4>{tr.payment?.step2 || 'Avisar al Administrador'}</h4>
                </div>
                <button className="btn-telegram-action" onClick={() => window.open('https://t.me/thriptv', '_blank')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.198 2.027c-1.004-.326-2.008-.326-3.013 0L3.125 7.575C1.65 8.12 1.65 9.754 3.125 10.3l4.316 1.6v5.8c0 1.09.89 1.98 1.98 1.98h.02c1.09 0 1.98-.89 1.98-1.98v-3.513l5.093 3.395c.78.52 1.83.213 2.152-.64l3.528-11.64c.265-.873-.13-1.803-.996-2.068z"/></svg> 
                  {tr.payment?.btnTelegram || 'Enviar Recibo por Telegram'}
                </button>
              </div>

              {/* PASO 3 */}
              <div className="telegram-step">
                <div className="telegram-step-header">
                  <div className="telegram-step-number">3</div>
                  <h4>{tr.payment?.step3 || 'Código de 12 dígitos'}</h4>
                </div>
                <div className="telegram-input-group">
                  <input 
                    type="text" 
                    placeholder={tr.payment?.codePlaceholder || 'Ej: THR-XXXX-XXXX'}
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                    maxLength={14}
                  />
                  <button className="btn-paypal btn-redeem" onClick={handleConfirmPayment} disabled={isVerifying || activationCode.length < 12}>
                    <Key size={18} /> {isVerifying ? (tr.payment?.verifying || 'Validando...') : (tr.payment?.confirmPayment || 'Canjear')}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardLayout;
