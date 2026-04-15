import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
  const r = await axios.get('https://www.rafanadalpartidoapartido.com/deportes/futbol-hoy-tv/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const $ = cheerio.load(r.data);
  
  const todaySection = $('h3').first().nextUntil('h3');
  todaySection.each((i, el) => {
    console.log("Tag:", el.tagName, "HTML:", $(el).html()?.substring(0, 200));
  });
}
main();
