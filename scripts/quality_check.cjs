#!/usr/bin/env node
/*
 * Quality check BEFORE the push (Editor-in-Chief, since 0.27.0).
 *
 * Renders pages with Chromium at 390 px (phone) and 1280 px (desktop),
 * saves full-page screenshots and flags automatically:
 *   - duplicated headings (same text in two headings/boxes of one page)
 *   - more than one H1, empty title or meta description, repeated part in the title
 *   - placeholder text ([DA COMPLETARE], TODO, lorem ipsum, {{ }}, undefined, NaN)
 *   - broken, blurry (upscaled past their resolution), stretched,
 *     CSS-rotated images, main image under 1600 px
 *   - broken layout: horizontal scroll, elements overflowing the screen,
 *     visible elements covering a heading
 *
 * What a script cannot see (crooked or off-topic photo, stacked blocks,
 * confusing hierarchy) is checked by LOOKING at the screenshots.
 *
 * Usage:
 *   node quality_check.cjs --dir <built site folder> <path> [<path> ...]
 *   node quality_check.cjs <https://url> [<https://url> ...]
 * Options: --domain https://site.com (absolute URLs of the site are served from the local folder), --out <screenshot folder> (default ./qa-screenshot),
 *          --all (every HTML page in --dir), --no-screenshot (fast pass: automatic checks only)
 * Exits with 1 on ERRORS (they block the push), 0 with warnings only or nothing.
 */
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let dir = null, out = 'qa-screenshot', tutte = false, foto = true, dominio = null;
const targets = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dir') dir = args[++i];
  else if (args[i] === '--out') out = args[++i];
  else if (args[i] === '--all') tutte = true;          // every HTML page in the folder
  else if (args[i] === '--no-screenshot') foto = false; // fast pass on many pages
  else if (args[i] === '--domain') dominio = args[++i].replace(/\/$/, ''); // site absolute URLs served from the folder
  else targets.push(args[i]);
}
if (tutte && dir) {
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => {
    const f = path.join(d, e.name);
    if (e.isDirectory()) return /^(node_modules|\.git|assets|static|img|images|css|js)$/.test(e.name) ? [] : walk(f);
    return e.name.endsWith('.html') && !/^(404|google[0-9a-f]+)\.html$/.test(e.name) ? ['/' + path.relative(dir, f).replace(/index\.html$/, '')] : [];
  });
  targets.push(...walk(dir).sort());
}
if (!targets.length) {
  console.error('Usage: node quality_check.cjs [--dir folder] [--out folder] <paths or URLs>');
  process.exit(2);
}

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.json': 'application/json',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.xml': 'application/xml' };

function serve(root) {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      let f = path.join(root, p);
      if (!f.startsWith(path.resolve(root))) { res.writeHead(403); return res.end(); }
      try { if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); } catch (e) {
        if (fs.existsSync(f + '.html')) f = f + '.html';
      }
      fs.readFile(f, (err, data) => {
        if (err) { res.writeHead(404); return res.end('404'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
        res.end(data);
      });
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

// Runs in the page: returns {errori: [errors], avvisi: [warnings]}
async function analizza(vw) {
  const E = [], A = [];
  const norm = s => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const visibile = el => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0';
  };
  const fuoriContenuto = el => !!el.closest('header, nav, footer, [role=navigation], .cookie, #cookie, [class*=consent], [id*=consent]');
  const desc = el => {
    const t = (el.innerText || el.alt || el.getAttribute('src') || '').replace(/\s+/g, ' ').trim().slice(0, 70);
    return `<${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? ' class="' + el.className.split(' ')[0] + '"' : ''}> "${t}"`;
  };

  // Duplicated headings
  const sel = 'h1,h2,h3,h4,h5,[class*=title],[class*=titolo],[class*=heading],legend,figcaption,.box strong,[class*=box] strong,[class*=box] b';
  const visti = new Map();
  for (const el of document.querySelectorAll(sel)) {
    if (!visibile(el) || fuoriContenuto(el)) continue;
    if (el.closest('aside, [class*=sidebar], [class*=widget], [class*=related], [class*=seo-rel]')) continue; // sidebars and "related posts" repeat titles by design
    if (el.querySelector(sel)) continue; // innermost only
    const t = norm(el.innerText);
    if (t.length < 6) continue;
    if (visti.has(t)) {
      const prima = visti.get(t);
      if (!prima.contains(el) && !el.contains(prima)) {
        const faq = x => !!x.closest('details, [class*=faq], [id*=faq], [itemtype*=FAQ]');
        // question repeated between text and FAQ: warning; two identical headings/boxes in the content: error
        if (faq(el) !== faq(prima)) A.push(`Question repeated in text and FAQ: ${desc(el)}`);
        else E.push(`Duplicated heading: ${desc(el)} appears twice`);
      }
    } else visti.set(t, el);
  }
  // Same phrase twice in a row in a heading ("Book Book", "X X")
  for (const el of document.querySelectorAll('h1,h2,h3,h4')) {
    const t = norm(el.innerText); const h = t.length / 2;
    if (t.length > 10 && t.length % 2 === 1 && t.slice(0, (t.length - 1) / 2) === t.slice((t.length + 1) / 2)) E.push(`Heading with a repeated phrase: ${desc(el)}`);
    if (t.length > 10 && Number.isInteger(h) && t.slice(0, h) === t.slice(h)) E.push(`Heading with a repeated phrase: ${desc(el)}`);
  }
  const h1 = [...document.querySelectorAll('h1')].filter(visibile);
  if (h1.length === 0) A.push('No visible H1');
  if (h1.length > 1) E.push(`${h1.length} visible H1s on the page`);
  const title = document.title.trim();
  if (!title) E.push('Empty <title>');
  const parti = title.split(/\s[|\-–·]\s/).map(norm).filter(Boolean);
  if (new Set(parti).size < parti.length) E.push(`<title> with a repeated part: "${title}"`);
  const md = document.querySelector('meta[name=description]');
  if (!md || !md.content.trim()) A.push('Missing or empty meta description');

  // Placeholders
  const testo = document.body.innerText + ' ' + title + ' ' + (md ? md.content : '') +
    [...document.querySelectorAll('img')].map(i => ' ' + (i.alt || '')).join('');
  const segnaposto = [/\[DA COMPLETARE[^\]]*\]?/i, /\bTODO\b/, /\bTBD\b/, /\bFIXME\b/, /lorem ipsum/i,
    /\{\{[^}]*\}\}/, /\{%[^%]*%\}/, /\bundefined\b/, /\bNaN\b/, /\[object Object\]/, /\bXXX\b/, /\[(?:link|foto|immagine|image|placeholder)\]/i];
  for (const re of segnaposto) { const m = testo.match(re); if (m) E.push(`Placeholder text: "${m[0].slice(0, 60)}"`); }

  // Images
  const imgs = [...document.querySelectorAll('img')];
  // real file width (with srcset "w", naturalWidth is density-corrected and misleading)
  const reale = src => new Promise(res => { const i = new Image(); i.onload = () => res(i.naturalWidth); i.onerror = () => res(0); i.src = src; });
  let principale = null, areaMax = 0;
  for (const img of imgs) {
    if (!visibile(img)) continue;
    const r = img.getBoundingClientRect();
    const nome = (img.currentSrc || img.src || '').split('/').pop().slice(0, 60);
    const locale = (img.currentSrc || img.src || '').startsWith(location.origin);
    if (img.complete && img.naturalWidth === 0) {
      if (locale || !/^http:\/\/127\.0\.0\.1/.test(location.origin)) E.push(`Broken image (does not load): ${nome}`);
      else A.push(`Image with an absolute URL, not checkable locally: ${(img.currentSrc || img.src).slice(0, 90)}`);
      continue;
    }
    if (!img.naturalWidth || /\.svg(\?|$)/i.test(img.currentSrc || img.src)) continue;
    if (r.width * r.height > areaMax && !fuoriContenuto(img)) { areaMax = r.width * r.height; principale = img; }
    const pxFile = img.srcset || (img.parentElement && img.parentElement.tagName === 'PICTURE') ? (await reale(img.currentSrc || img.src)) || img.naturalWidth : img.naturalWidth;
    const scala = pxFile / r.width;
    if (r.width >= 120) {
      if (scala < 0.9) E.push(`Blurry image: ${nome} is ${pxFile} px but shown at ${Math.round(r.width)} px`);
      else if (scala < 1) A.push(`Slightly upscaled image: ${nome} ${pxFile} px shown at ${Math.round(r.width)} px`);
      else if (scala < 1.5 && vw >= 1000) A.push(`Borderline image: ${nome} ${pxFile} px for ${Math.round(r.width)} px shown (soft on retina screens)`);
    }
    const fit = getComputedStyle(img).objectFit;
    if (fit === 'fill' || fit === '') {
      const ra = r.width / r.height, na = img.naturalWidth / img.naturalHeight;
      if (Math.abs(ra / na - 1) > 0.04) E.push(`Stretched image: ${nome} (ratio ${na.toFixed(2)} shown at ${ra.toFixed(2)})`);
    }
    let n = img; while (n && n !== document.body) {
      const tr = getComputedStyle(n).transform;
      if (tr && tr !== 'none') { const m = tr.match(/matrix\(([^,]+),\s*([^,]+)/); if (m && Math.abs(parseFloat(m[2])) > 0.01) { E.push(`Image rotated via CSS: ${nome}`); break; } }
      n = n.parentElement;
    }
    if (!img.alt || !img.alt.trim()) A.push(`Image without alt text: ${nome}`);
  }
  if (vw >= 1000 && principale && principale.naturalWidth < 1600 && principale.getBoundingClientRect().width > vw * 0.5)
    A.push(`Main image under 1600 px: ${(principale.currentSrc || principale.src).split('/').pop()} (${principale.naturalWidth} px)`);

  // Layout
  const sw = document.documentElement.scrollWidth;
  if (sw > vw + 2) E.push(`Horizontal scroll: the page is ${sw} px wide on a ${vw} px screen`);
  const usciti = new Set();
  for (const el of document.body.querySelectorAll('*')) {
    if (!visibile(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.right > vw + 2 && r.width < vw * 3) {
      let p = el.parentElement, scroll = false;
      while (p) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') { scroll = true; break; } p = p.parentElement; }
      if (!scroll && !usciti.has(el.parentElement)) { usciti.add(el); if (usciti.size <= 5) E.push(`Overflows the screen: ${desc(el)} (right edge at ${Math.round(r.right)} px)`); }
    }
  }
  // Overlaps: a heading covered by another opaque element
  for (const el of document.querySelectorAll('h1,h2,h3')) {
    if (!visibile(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.top < 0 || r.bottom > innerHeight) continue;
    const x = r.left + Math.min(20, r.width / 2), y = r.top + r.height / 2;
    const top = document.elementFromPoint(x, y);
    if (top && !el.contains(top) && !top.contains(el) && !fuoriContenuto(top)) A.push(`Heading covered by another element: ${desc(el)} under ${desc(top)}`);
  }
  return { errori: [...new Set(E)], avvisi: [...new Set(A)] };
}

(async () => {
  let base = null, srv = null;
  if (dir) { srv = await serve(path.resolve(dir)); base = `http://127.0.0.1:${srv.address().port}`; }
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  let totErr = 0, totAvv = 0;
  for (const t of targets) {
    const url = /^https?:/.test(t) ? t : base + (t.startsWith('/') ? t : '/' + t);
    console.log(`\n=== ${t}`);
    for (const [nome, vw, vh] of [['phone', 390, 844], ['desktop', 1280, 900]]) {
      const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1, isMobile: vw < 500, hasTouch: vw < 500 });
      const page = await ctx.newPage();
      // local run: block external requests (analytics, fonts, widgets) that slow down and are not needed
      if (base) await page.route(u => !u.href.startsWith(base), route => {
        const u = route.request().url();
        if (dominio && u.startsWith(dominio)) {
          let f = path.join(dir, decodeURIComponent(u.slice(dominio.length).split(/[?#]/)[0]));
          try { if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); } catch (e) {}
          if (fs.existsSync(f)) return route.fulfill({ body: fs.readFileSync(f), contentType: MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
          return route.fulfill({ status: 404, body: '' });
        }
        return route.abort();
      });
      const rotte = [];
      page.on('response', r => { if (r.status() >= 400 && r.request().resourceType() === 'image') rotte.push(r.url()); });
      let res;
      try { res = await page.goto(url, { waitUntil: base ? 'load' : 'networkidle', timeout: 45000 }); }
      catch (e) { console.log(`  [${nome}] ERROR: page did not load (${e.message.split('\n')[0]})`); totErr++; await ctx.close(); continue; }
      if (!res || res.status() >= 400) { console.log(`  [${nome}] ERROR: HTTP ${res ? res.status() : '?'}`); totErr++; }
      // scroll to load lazy images
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); });
      await page.waitForTimeout(400);
      const r = await page.evaluate(analizza, vw);
      for (const u of rotte) r.errori.push(`Image not found (HTTP 4xx): ${u.split('/').pop()}`);
      const file = path.join(out, `${t.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home'}-${nome}.png`);
      if (foto) { await page.screenshot({ path: file, fullPage: true }); console.log(`  [${nome} ${vw}px] screenshot: ${file}`); }
      for (const e of [...new Set(r.errori)]) console.log(`    ERROR: ${e}`);
      for (const a of r.avvisi) console.log(`    warning: ${a}`);
      totErr += new Set(r.errori).size; totAvv += r.avvisi.length;
      await ctx.close();
    }
  }
  await browser.close();
  if (srv) srv.close();
  console.log(`\nTotal: ${totErr} errors, ${totAvv} warnings.`);
  console.log(totErr ? 'Do NOT push: fix the errors and run again.' : 'No automatic errors. Now LOOK at the screenshots (crooked or off-topic photos, stacked blocks) before the push.');
  process.exit(totErr ? 1 : 0);
})();
