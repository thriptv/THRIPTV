import parser from 'iptv-playlist-parser';

export const parseM3UString = (m3uString) => {
  const parsed = parser.parse(m3uString);
  
  const liveChannels = [];
  const vodMovies = [];
  const vodSeries = [];
  const groupsTemp = new Set();
  
  parsed.items.forEach((item, index) => {
    // Determinar categoría por grupo
    const groupTitle = (item.group && item.group.title) ? item.group.title.toUpperCase() : 'UNCATEGORIZED';
    groupsTemp.add(groupTitle);
    
    // Logica básica de tipo de contenido
    const isVOD = item.url && (item.url.includes('/movie/') || item.url.endsWith('.mp4') || item.url.endsWith('.mkv') || groupTitle.includes('VOD') || groupTitle.includes('PELICULA') || groupTitle.includes('MOVI'));
    const isSeries = item.url && (item.url.includes('/series/') || groupTitle.includes('SERIE'));
    
    const id = item.tvg?.id || `ch-${index}`;
    const name = item.name || 'Unknown Channel';
    const logo = item.tvg?.logo || '';
    const groupId = groupTitle;
    
    if (isSeries) {
      vodSeries.push({
        id: id,
        title: name,
        poster: logo,
        groupId: groupId,
        imdb: 'N/A',
        year: 'N/A',
        genre: groupId,
        director: 'Unknown',
        cast: 'Unknown',
        synopsis: name,
        url: item.url,
        seasons: [{ seasonNumber: 1, episodes: [{ episodeNumber: 1, title: name, duration: 'N/A', url: item.url }] }]
      });
    } else if (isVOD) {
      vodMovies.push({
        id: id,
        title: name,
        poster: logo,
        groupId: groupId,
        imdb: 'N/A',
        year: 'N/A',
        duration: 'N/A',
        genre: groupId,
        director: 'Unknown',
        cast: 'Unknown',
        synopsis: name,
        url: item.url,
        backdrop: logo
      });
    } else {
      liveChannels.push({
        id: id,
        name: name,
        epg: 'En Directo', 
        img: logo,
        groupId: groupId,
        url: item.url,
        category: 'TV'
      });
    }
  });

  return {
    channels: liveChannels,
    movies: vodMovies,
    series: vodSeries,
    categories: Array.from(groupsTemp).map(g => ({ id: g, name: g }))
  };
};
