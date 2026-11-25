import { build } from 'esbuild';
import fs from 'fs';
const r = await build({ entryPoints: ['src/app.js'], bundle: true, minify: true, format: 'iife', write: false, target: 'es2020' });
const js = r.outputFiles[0].text;
const fdir = 'node_modules/@fontsource/prompt/files/';
let fonts = '';
for (const w of [400, 500, 600, 700, 800]) for (const sub of ['thai', 'latin']) {
  const f = `${fdir}prompt-${sub}-${w}-normal.woff2`;
  if (!fs.existsSync(f)) continue;
  const range = sub === 'thai' ? 'U+0E01-0E5B,U+200C-200D,U+25CC' : 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
  fonts += `@font-face{font-family:'Prompt';font-style:normal;font-weight:${w};font-display:block;src:url(data:font/woff2;base64,${fs.readFileSync(f).toString('base64')}) format('woff2');unicode-range:${range}}\n`;
}
const N = JSON.parse(fs.readFileSync('notes.json', 'utf8'));
const total = N.notes.length;
const notes = N.notes.map((t, i) => t);
notes[0] += `\n\n━━ วิธีใช้ ━━\n• กด F เต็มจอ · P เปิด Speaker Notes หน้าต่างแยก (ลากไปจอโน้ตบุ๊ก) · N โน้ตในจอ\n• คลิกพื้นที่ว่าง = ถัดไป · คลิกขวา = ย้อนกลับ · ปุ่มบนสไลด์กดได้ (ไม่เลื่อนหน้า)`;
const css = fs.readFileSync('src/style.css', 'utf8') + fs.readFileSync('src/icons.css', 'utf8') + fs.readFileSync('src/fr.css', 'utf8');
let html = fs.readFileSync('src/template.html', 'utf8')
  .replace('/*FONTS*/', () => fonts)
  .replace('/*CSS*/', () => css)
  .replace('<!--SLIDES-->', () => fs.readFileSync('src/slides.html', 'utf8'))
  .replace('/*NOTES*/', () => JSON.stringify(notes).replace(/</g, '\\u003c'))
  .replace('/*JS*/', () => js.replace(/<\/script/gi, '<\\/script'));
fs.writeFileSync('out.html', html);
console.log('slides', total, 'size KB', Math.round(html.length / 1024));
