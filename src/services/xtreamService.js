export const fetchXtreamData = async (serverUrl, username, password) => {
  const baseUrl = serverUrl.replace(/\/+$/, '');
  const authQuery = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

  console.log('Interceptando Xtream Codes API desde:', baseUrl);
  
  try {
    // 1. Obtenemos diccionarios de categorías para mapear nombres bonitos
    const [liveCat, vodCat, seriesCat] = await Promise.all([
      fetch(`${baseUrl}/player_api.php?${authQuery}&action=get_live_categories`).then(r => r.json()).catch(() => []),
      fetch(`${baseUrl}/player_api.php?${authQuery}&action=get_vod_categories`).then(r => r.json()).catch(() => []),
      fetch(`${baseUrl}/player_api.php?${authQuery}&action=get_series_categories`).then(r => r.json()).catch(() => [])
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
      fetch(`${baseUrl}/player_api.php?${authQuery}&action=get_live_streams`).then(r => r.json()).catch(() => []),
      fetch(`${baseUrl}/player_api.php?${authQuery}&action=get_vod_streams`).then(r => r.json()).catch(() => []),
      fetch(`${baseUrl}/player_api.php?${authQuery}&action=get_series`).then(r => r.json()).catch(() => [])
    ]);

    // 3. Traducimos al estándar del Dashboard
    const channels = (Array.isArray(liveRaw) ? liveRaw : []).map(ch => ({
      id: `live_${ch.stream_id}`,
      name: ch.name || 'Canal Desconocido',
      epg: 'En Directo',
      img: ch.stream_icon || '',
      groupId: catMap[ch.category_id] || 'General',
      url: `${baseUrl}/live/${username}/${password}/${ch.stream_id}.ts`,
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
      // La API v2 necesita otro fetch individual por ID para sacar capítulos, por ahora armamos array seguro:
      seasons: [{ seasonNumber: 1, episodes: [{ episodeNumber: 1, title: s.name, duration: 'N/A', url: '#' }] }]
    }));
    
    // Extracción de categorías unificadas que el Layout pintará en las píldoras superiores
    const categoriesSet = new Set([
      ...channels.map(c => c.groupId),
      ...movies.map(m => m.groupId),
      ...series.map(s => s.groupId)
    ]);
    const categories = Array.from(categoriesSet).map(g => ({ id: g, name: g }));

    return { channels, movies, series, categories };

  } catch (error) {
    console.error("Fallo maestro conectando a Xtream Codes:", error);
    throw new Error('No se pudo establecer conexión con el proveedor. Intenta comprobar CORS si estás en desarrollo web.');
  }
};
