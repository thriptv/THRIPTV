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

const MOCK_SPORTS_AGENDA = [
  { 
    id: 'match-1', sportType: 'football', title: "Arsenal vs Man City", time: "HOY 21:00", tournament: "Premier League", channelName: "DAZN 1 HD", channelId: 2, 
    team1: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg", team2: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg", 
    bgImage: "https://images.unsplash.com/photo-1518605368461-1e12d5ee581b?auto=format&fit=crop&q=80&w=500", synopsis: "Duelo directo."
  },
  { 
    id: 'match-2', sportType: 'football', title: "PSG vs Bayern", time: "HOY 20:45", tournament: "Champions League", channelName: "ESPN HD", channelId: 3, 
    team1: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg", team2: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg", 
    bgImage: "https://images.unsplash.com/photo-1489945052260-4f21c52268b9?auto=format&fit=crop&q=80&w=500", synopsis: "Choque de titanes."
  },
  { 
    id: 'match-3', sportType: 'football', title: "R. Madrid vs Barcelona", time: "MAÑANA 16:15", tournament: "La Liga", channelName: "ESPN 1 HD", channelId: 2, 
    team1: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg", team2: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg", 
    bgImage: "https://images.unsplash.com/photo-1551280857-2b9bbe5260fc?auto=format&fit=crop&q=80&w=500", synopsis: "El Clásico español."
  },
  { 
    id: 'match-4', sportType: 'football', title: "AC Milan vs Inter", time: "DOMINGO 18:00", tournament: "Serie A", channelName: "DAZN 1 HD", channelId: 2, 
    team1: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg", team2: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg", 
    bgImage: "https://images.unsplash.com/photo-1508344928928-7137b2f4a478?auto=format&fit=crop&q=80&w=500", synopsis: "El Derby della Madonnina."
  },
  { 
    id: 'match-5', sportType: 'football', title: "Liverpool vs Chelsea", time: "DOMINGO 17:30", tournament: "Premier League", channelName: "Sky Sports", channelId: 3, 
    team1: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg", team2: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg", 
    bgImage: "https://images.unsplash.com/photo-1518091043644-c1d44579d2c1?auto=format&fit=crop&q=80&w=500", synopsis: "Batalla en Anfield."
  },
  { 
    id: 'match-6', sportType: 'football', title: "Juventus vs Napoli", time: "LUNES 20:45", tournament: "Serie A", channelName: "DAZN 2 HD", channelId: 2, 
    team1: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg", team2: "https://upload.wikimedia.org/wikipedia/commons/a/a2/SSC_Napoli_%282021%29.svg", 
    bgImage: "https://images.unsplash.com/photo-1431324155629-1a6d0a11f44e?auto=format&fit=crop&q=80&w=500", synopsis: "Lucha por el Scudetto."
  },
  { 
    id: 'match-7', sportType: 'football', title: "Dortmund vs B. Múnich", time: "SÁBADO 15:30", tournament: "Bundesliga", channelName: "Fox Sports", channelId: 3, 
    team1: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg", team2: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg", 
    bgImage: "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?auto=format&fit=crop&q=80&w=500", synopsis: "Der Klassiker."
  },
  { 
    id: 'match-8', sportType: 'football', title: "Sevilla vs Betis", time: "DOMINGO 21:00", tournament: "La Liga", channelName: "Gol TV", channelId: 4, 
    team1: "https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg", team2: "https://upload.wikimedia.org/wikipedia/en/1/13/Real_Betis_logo.svg", 
    bgImage: "https://images.unsplash.com/photo-1550881111-7cfde14b8073?auto=format&fit=crop&q=80&w=500", synopsis: "El Gran Derbi de Sevilla."
  }
];

const cleanTitle = (rawTitle) => {
  if (!rawTitle) return '';
  let clean = rawTitle;
  if (clean.includes('|')) clean = clean.split('|').pop().trim();
  if (clean.includes(' - ')) clean = clean.split(' - ').pop().trim();
  clean = clean.replace(/\[.*?\]|\(.*?\)/g, "").trim();
  return clean;
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
          .then(data => {
            if (data && data.info) {
              setMovieDetails(prev => ({
                ...prev,
                [selectedMovieId]: {
                  director: data.info.director || m.director,
                  cast: data.info.cast || data.info.actors || m.cast,
                  synopsis: data.info.plot || data.info.description || m.synopsis,
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

  const displayedChannels = getDisplayedChannels();
  const displayedMovies = getDisplayedMovies();

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
              
              {/* DEPORTES HOY */}
              <div className="home-section" style={{ marginTop: '16px' }}>
                <h3 className="section-title" style={{ fontSize: '22px', marginBottom: '16px', fontWeight: '500' }}>
                  {tr.home.todaysMatches}
                </h3>
                <div className="sports-agenda-board fade-in">
                  <div className="sports-agenda-header">
                    <div>Hora</div>
                    <div style={{ textAlign: 'center' }}>Partido</div>
                    <div style={{ textAlign: 'right' }}>Estado</div>
                  </div>
                  
                  {(!liveSchedule) ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                      <RefreshCcw className="icon-spin" size={32} color="#f1c40f" style={{ marginBottom: '15px' }} />
                      <p>Sincronizando horarios en tiempo real...</p>
                    </div>
                  ) : (
                    liveSchedule.map((match, idx) => {
                      const [t1, t2] = match.title.split(' vs ');
                      return (
                        <div key={match.id} className="sports-match-row" onClick={() => setSelectedMatchId(match.id)}>
                          <div className="match-time-col">
                            <span className="match-time-main">{match.time.replace('HOY ', '').replace('MAÑANA ', '').replace('DOMINGO ', '').replace('LUNES ', '').trim()}</span>
                            <span className="match-time-sub">{match.time.split(' ')[0]}</span>
                          </div>
                          
                          <div className="match-teams-col">
                            <div className="match-team" style={{ justifyContent: 'flex-end', textAlign: 'right' }}>
                              <span>{t1 || 'Local'}</span>
                              <img src={match.team1} alt={t1} onError={(e)=>{e.target.style.display='none'}} />
                            </div>
                            <span className="match-vs">VS</span>
                            <div className="match-team right">
                              <img src={match.team2} alt={t2} onError={(e)=>{e.target.style.display='none'}} />
                              <span>{t2 || 'Visitante'}</span>
                            </div>
                          </div>

                          <div className="match-action-col">
                            <button className="btn-notify" onClick={(e) => { e.stopPropagation(); setSelectedMatchId(match.id); }}>
                                + Info
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
                          <span className="meta-pill" style={{ background: 'var(--primary-red)', border: 'none', color: 'white', fontSize: '16px', padding: '10px 20px' }}>
                            <Clock size={16} /> {match.time}
                          </span>
                          <span className="meta-pill outline" style={{ fontSize: '16px', padding: '10px 20px' }}>
                            <Trophy size={16} style={{ marginRight: '6px' }} /> {match.tournament}
                          </span>
                        </div>

                        <h3 style={{ marginBottom: '20px', fontSize: '22px', fontWeight: '500', color: '#fff' }}>{tr.movieDetail.whereToWatch}</h3>
                        
                        <div className="channels-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                          {(() => {
                            const [t1Name, t2Name] = match.title.split(' vs ').map(t => t?.trim().toLowerCase() || '');
                            
                            // 1. Encontrar por EPG o palabras clave en el canal si el nombre de los equipos está allí
                            const epgMatches = MOCK_CHANNELS.filter(ch => {
                              const epgLower = (ch.epg || '').toLowerCase();
                              const nameLower = (ch.name || '').toLowerCase();
                              const match1 = t1Name && t1Name.length >= 3 && (epgLower.includes(t1Name) || nameLower.includes(t1Name));
                              const match2 = t2Name && t2Name.length >= 3 && (epgLower.includes(t2Name) || nameLower.includes(t2Name));
                              return match1 || match2;
                            });

                            // 2. Encontrar por Nombre de Canal
                            const nameMatches = [];
                            const notFoundChannels = [];
                            
                            (match.channelsList && match.channelsList.length > 0 ? match.channelsList : ["Canales locales"]).forEach((channelText, cIdx) => {
                              const cName = typeof channelText === "string" ? channelText : (channelText.name || channelText);
                              const searchName = cName.replace('M+', 'Movistar').replace(/ HD/gi, '').trim().toLowerCase();
                              const altSearchName = cName.replace('M+', 'M+').replace(/ HD/gi, '').trim().toLowerCase();
                              
                              const found = MOCK_CHANNELS.filter(ch => {
                                const lowerName = ch.name.toLowerCase();
                                return lowerName.includes(searchName) || lowerName.includes(altSearchName);
                              });
                              if (found.length > 0) {
                                nameMatches.push(...found);
                              } else {
                                notFoundChannels.push(cName);
                              }
                            });

                            const uniqueRealChannels = Array.from(new Set([...epgMatches, ...nameMatches]));

                            return (
                              <>
                                {uniqueRealChannels.map(realCh => {
                                  const isFav = favorites.includes(realCh.id);
                                  return (
                                    <div key={realCh.id} className="channel-card" onClick={() => setPlayingMedia(realCh)}>
                                      <div className="channel-logo-box">
                                        <img src={realCh.img || `https://api.dicebear.com/7.x/identicon/svg?seed=${realCh.name}&backgroundColor=222222`} alt={realCh.name} className="channel-logo-img" onError={(e) => { e.target.src = 'https://placehold.co/100x100/222/FFF.png?text=TV' }}/>
                                      </div>
                                      <div className="channel-info">
                                        <h3 className="channel-name">{realCh.name}</h3>
                                        <p className="channel-epg">{realCh.epg && realCh.epg !== 'En Directo' ? realCh.epg : `${match.time} - ${match.tournament}`}</p>
                                      </div>
                                      <div className="channel-action">
                                        <Star size={22} className={`star-icon ${isFav ? 'favorited' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFavorite(e, realCh.id); }} fill={isFav ? '#f1c40f' : 'none'} color={isFav ? '#f1c40f' : 'gray'} />
                                        <Play size={20} className="play-button-icon" fill="currentColor" />
                                      </div>
                                    </div>
                                  );
                                })}
                                
                                {notFoundChannels.map((cName, idx) => (
                                  <div 
                                    key={`ch-${idx}-notfound`} 
                                    className="channel-card" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                      // Lo llevamos a la pestaña de Live y buscamos
                                      setSelectedMatchId(null);
                                      setActiveBottomNav('live');
                                      setSearchQuery(cName.replace('M+', ''));
                                    }}
                                  >
                                    <div className="channel-logo-box">
                                      <Search size={32} color="#888" />
                                    </div>
                                    <div className="channel-info">
                                      <h3 className="channel-name">{cName}</h3>
                                      <p className="channel-epg" style={{color: '#f1c40f'}}>Buscar en tus canales...</p>
                                    </div>
                                  </div>
                                ))}
                              </>
                            );
                          })()}
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
                            {movieDetails[movie.id]?.imdb || movie.imdb || 'N/A'}
                          </span>
                          <span style={{ background: '#d32f2f', color: '#fff', fontWeight: 'bold', padding: '4px 12px', borderRadius: '4px', fontSize: '15px' }}>
                            {movieDetails[movie.id]?.year || movie.year || 'N/A'}
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
              const isFav = favorites.includes(series.id);
              const currentSeason = series.seasons.find(s => s.seasonNumber === activeSeason) || series.seasons[0];
              
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
                              {series.imdb !== 'N/A' ? series.imdb : 'N/A'}
                            </span>
                            <span style={{ background: '#d32f2f', color: '#fff', fontWeight: 'bold', padding: '4px 12px', borderRadius: '4px', fontSize: '15px' }}>
                              {series.year || 'N/A'}
                            </span>
                          </div>

                          <p className="movie-detail-synopsis" style={{ fontSize: '16px', lineHeight: '1.6', color: '#d1d1d1', marginBottom: '25px', maxWidth: '650px' }}>
                            {series.synopsis}
                          </p>

                          <table className="movie-detail-crew-table" style={{ fontSize: '15px', borderCollapse: 'collapse', marginBottom: '35px' }}>
                            <tbody>
                              <tr>
                                <td style={{ color: '#fff', fontWeight: 'bold', paddingRight: '20px', paddingBottom: '8px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>Director:</td>
                                <td style={{ color: '#d1d1d1', paddingBottom: '8px' }}>{series.director}</td>
                              </tr>
                              <tr>
                                <td style={{ color: '#fff', fontWeight: 'bold', paddingRight: '20px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>Reparto:</td>
                                <td style={{ color: '#d1d1d1' }}>{series.cast}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                    </div>

                    {/* SELECTOR DE TEMPORADAS Y EPISODIOS */}
                    <div className="series-seasons-section">
                      <div className="seasons-tabs scroll-area-x">
                        {series.seasons.map(season => (
                          <button 
                            key={season.seasonNumber}
                            className={`season-tab ${activeSeason === season.seasonNumber ? 'active' : ''}`}
                            onClick={() => setActiveSeason(season.seasonNumber)}
                          >
                            {tr.seriesDetail.season} {season.seasonNumber}
                          </button>
                        ))}
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
               {MOCK_SERIES.map(series => {
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
