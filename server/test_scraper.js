import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function testMarca() {
  try {
    const { data } = await axios.get('https://www.marca.com/programacion-tv.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    
    // Escribimos todo a un archivo local temporal para pasarlo a search simple
    fs.writeFileSync('marca_dump.html', data);
    console.log("DUMP OK! Tamanho:", data.length);

  } catch (error) {
    console.error("Fetch Error:", error.message);
  }
}
testMarca();
