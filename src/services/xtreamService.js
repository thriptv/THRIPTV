export const fetchXtreamData = async (serverUrl, username, password) => {
  const baseUrl = serverUrl.replace(/\/+$/, '');

  console.log('Interceptando Xtream Codes API vía Proxy Local:', baseUrl);
  
  const proxyFetch = async (action) => {
    const actionParam = action ? `&action=${action}` : '';
    const directUrl = `${baseUrl}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}${actionParam}`;
    
    // 1. Intento Directo (Funciona nativamente en Electron y Capacitor/Android gracias al bypass de CORS)
    try {
      const resp = await fetch(directUrl);
      if (resp.ok) {
        return await resp.json();
      }
    } catch (e) {
      console.log('Falló el fetch directo (posible CORS en navegador web), intentando proxy...', e);
    }

    // 2. Fallback Proxy (Útil solo para PWA / Navegadores donde existe Node backend activo)
    try {
      const response = await fetch('/api/proxy/xtream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: baseUrl, username, password, action })
      });
      if (!response.ok) throw new Error('Error en proxy fetch');
      return await response.json();
    } catch (e) {
      console.warn('Fallo en petición Xtream:', action, e);
      return [];
    }
  };

  try {
    // 1. Obtenemos diccionarios de categorías
    const [liveCat, vodCat, seriesCat] = await Promise.all([
      proxyFetch('get_live_categories'),
      proxyFetch('get_vod_categories'),
      proxyFetch('get_series_categories')
    ]);

    const catMap = {};
    const processCats = (arr) => {
      if (Array.isArray(arr)) {
        arr.forEach(c => { catMap[c.category_id] = c.category_name; });
      }
    };
    processCats(liveCat);
    processCats(vodCat);
    processCats(seriesCat);

    // 2. Fetch masivo de streams
    const [liveRaw, vodRaw, seriesRaw] = await Promise.all([
      proxyFetch('get_live_streams'),
      proxyFetch('get_vod_streams'),
      proxyFetch('get_series')
    ]);

    // 3. Traducimos al estándar del Dashboard
    const channels = (Array.isArray(liveRaw) ? liveRaw : []).map(ch => ({
      id: `live_${ch.stream_id}`,
      name: ch.name || 'Canal Desconocido',
      epg: 'En Directo',
      img: ch.stream_icon || '',
      groupId: catMap[ch.category_id] || 'General',
      url: `${baseUrl}/live/${username}/${password}/${ch.stream_id}.m3u8`,
      category: 'TV'
    }));

    const movies = (Array.isArray(vodRaw) ? vodRaw : []).map(m => ({
      id: `vod_${m.stream_id}`,
      title: m.name,
      poster: m.stream_icon || '',
      groupId: catMap[m.category_id] || 'Películas',
      imdb: m.rating || m.rating_5based || 'N/A',
      year: m.added || 'N/A',
      director: 'Desconocido',
      cast: 'Desconocido',
      synopsis: m.name,
      genre: catMap[m.category_id] || 'Películas',
      url: `${baseUrl}/movie/${username}/${password}/${m.stream_id}.${m.container_extension || 'mp4'}`,
      backdrop: m.stream_icon || ''
    }));

    const series = (Array.isArray(seriesRaw) ? seriesRaw : []).map(s => ({
      id: `series_${s.series_id}`,
      title: s.name,
      poster: s.cover || '',
      groupId: catMap[s.category_id] || 'Series',
      imdb: s.rating || s.rating_5based || 'N/A',
      year: s.releaseDate || 'N/A',
      director: 'Desconocido',
      cast: 'Desconocido',
      genre: catMap[s.category_id] || 'Series',
      synopsis: s.name,
      seasons: [{ seasonNumber: 1, episodes: [{ episodeNumber: 1, title: s.name, duration: 'N/A', url: '#' }] }]
    }));
    
    // Extracción de categorías unificadas
    const categoriesSet = new Set([
      ...channels.map(c => c.groupId),
      ...movies.map(m => m.groupId),
      ...series.map(s => s.groupId)
    ]);
    const categories = Array.from(categoriesSet).map(g => ({ id: g, name: g }));

    return { channels, movies, series, categories };

  } catch (error) {
    console.error("Fallo maestro conectando a Xtream Codes:", error);
    throw new Error('No se pudo procesar la respuesta del servidor Proxy.');
  }
};
