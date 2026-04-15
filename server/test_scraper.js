import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  try {
    const { data } = await axios.get('https://www.partidos-de-hoy.com/');
    const $ = cheerio.load(data);
    
    // Intentaremos buscar listados lógicos
    console.log("CLASES DE ELEMENTOS IL:", $('ul.lista, ul.matches, div.match, div.partido, table').length);
    
    // Vamos a buscar la palabra Real Madrid y ver en qué etiquetas vive
    const els = $('*:contains("Madrid")').filter((i, el) => $(el).children().length === 0);
    els.each((i, el) => {
        let parentClassName = $(el).parent().attr('class');
        let uncpParent = $(el).parent().parent().attr('class');
        if(i < 3) console.log("TEXT Y Clases cerca de Madrid:", $(el).text().trim(), parentClassName, uncpParent);
    });

  } catch (error) {
    console.error("Fetch Error:", error.message);
  }
}
test();
