/* Editor-in-Chief demo: an in-memory stand-in for the Claude artifact database, with invented data.
   Every site, number and name here is fictional. Nothing is sent anywhere; reloading resets the demo. */
(function () {
  const DAY = 864e5;
  const iso = (t) => new Date(t).toISOString().slice(0, 10);
  const now = Date.now();
  const today = iso(now);
  const monday = (t) => { const d = new Date(t); const g = (d.getUTCDay() + 6) % 7; return iso(t - g * DAY); };
  const plus = (n) => iso(now + n * DAY);
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  const sites = [
    { id: 'bakery', nome: 'Sourdough Lab', sito: 'https://sourdough-lab.example', colore: 'var(--c1)', automazione: 'Automatica', ordine: 1, base: 60, growth: 1.8 },
    { id: 'trips', nome: 'Slow Trips', sito: 'https://slow-trips.example', colore: 'var(--c2)', automazione: 'Automatica', ordine: 2, base: 140, growth: 0.6 },
    { id: 'saas', nome: 'Invoicely', sito: 'https://invoicely.example', colore: 'var(--c3)', automazione: 'Con il tuo ok', ordine: 3, base: 25, growth: 2.4 },
  ];

  const db = {};
  const put = (col, id, doc) => { (db[col] = db[col] || new Map()).set(id, doc); };

  put('editor', 'stato', { ultimo_aggiornamento: new Date(now - 3 * 36e5).toISOString(), crediti_openseo_residui: 1840 });
  put('editor', 'config', { trigger_id: '' });

  for (const s of sites) {
    const { base, growth } = s;
    put('progetti', s.id, { nome: s.nome, sito: s.sito, colore: s.colore, automazione: s.automazione, ordine: s.ordine });
    // 98 days of Search Console data with a gentle trend and weekly rhythm
    const days = 98, clic = [], impr = [];
    for (let i = 0; i < days; i++) {
      const trend = 1 + (growth * i) / days;
      const week = 1 + 0.18 * Math.sin((i % 7) / 7 * Math.PI * 2);
      const im = Math.round(base * 9 * trend * week * (0.85 + rnd() * 0.3));
      impr.push(im); clic.push(Math.round(im * (0.025 + rnd() * 0.02)));
    }
    const inizio = iso(now - (days - 1) * DAY);
    put('serie', s.id, { inizio, clic, impressioni: impr, aggiornato_il: new Date(now).toISOString() });
    const sum = (a, from, to) => a.slice(from, to).reduce((x, y) => x + y, 0);
    for (let w = 7; w >= 0; w--) {
      const end = days - w * 7;
      const c = sum(clic, end - 28, end), im = sum(impr, end - 28, end);
      const settimana = monday(now - w * 7 * DAY);
      put('metriche', s.id + '-' + settimana, {
        progetto: s.id, settimana, clic: c, impressioni: im,
        posizione: Math.round((s.id === 'trips' ? 9 : 18) * (1 - (8 - w) * 0.03) * 10) / 10,
        visite_7g: Math.round(sum(clic, end - 7, end) * 2.6), citazioni_ai: w < 3 ? 2 + (s.id === 'trips' ? 2 : 0) : 1, domande_ai: 5,
      });
    }
    const c28 = sum(clic, days - 28, days), cPrev = sum(clic, days - 56, days - 28);
    const i28 = sum(impr, days - 28, days), iPrev = sum(impr, days - 56, days - 28);
    put('salute', s.id, {
      progetto: s.id, periodo: 'ultimi 28 giorni', clic_28g: c28, clic_prev: cPrev, impressioni_28g: i28, impressioni_prev: iPrev,
      sessioni_28g: Math.round(c28 * 3.1), sessioni_prev: Math.round(cPrev * 3.1), pagine_viste_28g: Math.round(c28 * 5.2),
      sessioni_organiche: Math.round(c28 * 1.1), sessioni_organiche_prev: Math.round(cPrev * 1.1), visite_7g_cloudflare: Math.round(sum(clic, days - 7, days) * 2.6),
      stato: s.id === 'saas' ? 'Attenzione' : 'Buono',
      voto: s.id === 'saas' ? 'Cresce, ma metà dei clic arriva da una sola pagina.' : 'Crescita costante, nessun problema tecnico.',
      note: [
        'Impressioni ' + (i28 >= iPrev ? '+' : '') + Math.round((i28 / iPrev - 1) * 100) + '% rispetto ai 28 giorni prima.',
        'CTR medio ' + (c28 / i28 * 100).toFixed(1) + '%: i title delle pagine in posizione 5-10 sono il margine più facile.',
        s.id === 'saas' ? 'La guida "fattura elettronica forfettari" porta il 52% dei clic: serve una seconda pagina forte.' : 'Le guide nuove entrano in prima pagina in circa 3 settimane.',
      ],
      aggiornato_il: new Date(now - 3 * 36e5).toISOString(),
    });
  }

  const tips = [
    ['bakery', 'Aggiungi FAQ alla guida al lievito madre', 'La pagina è 4ª con 2.100 impressioni: 3 FAQ con risposte brevi possono portarla nel box delle domande correlate.', 'AEO', 'Alto', 'Basso', 'Automatico'],
    ['bakery', 'Riscrivi il title di "farina per pizza"', 'Posizione 7, CTR 1,2%: il title non dice cosa si trova nella pagina.', 'SEO', 'Medio', 'Basso', 'Automatico'],
    ['trips', 'Crea una pagina "Lisbona in 3 giorni a piedi"', 'Domanda frequente su Perplexity dove oggi citano due blog concorrenti e non noi.', 'GEO', 'Alto', 'Medio', 'Automatico'],
    ['trips', 'Collega la scheda Google Business al sito', 'Le ricerche locali mostrano la scheda senza link: serve il tuo accesso a Google Business.', 'Conversioni', 'Medio', 'Basso', 'A mano'],
    ['saas', 'Seconda guida sulla fatturazione per forfettari', 'Il 52% dei clic dipende da una pagina: una guida collegata riduce il rischio e allarga le ricerche.', 'SEO', 'Alto', 'Medio', 'Automatico'],
    ['saas', 'Aggiungi dati strutturati SoftwareApplication', 'La home non ha markup: aiuta Google e i motori AI a capire prezzo e categoria.', 'Tecnico', 'Medio', 'Basso', 'Automatico'],
  ];
  tips.forEach(([p, titolo, dettaglio, tipo, impatto, sforzo, come], i) => put('consigli', p + '-demo-' + i, { progetto: p, titolo, dettaglio, tipo, impatto, sforzo, come, stato: 'Da fare', creato_il: new Date(now - DAY).toISOString() }));
  put('consigli', 'bakery-demo-done', { progetto: 'bakery', titolo: 'Invia la sitemap a Search Console', dettaglio: '', tipo: 'Tecnico', impatto: 'Medio', sforzo: 'Basso', come: 'A mano', stato: 'Fatto', esito: 'Verificato: Search Console legge la sitemap, 42 pagine scoperte.', aggiornato_il: new Date(now - 5 * 36e5).toISOString() });

  const ideas = [
    ['bakery', 'Lievito madre per principianti: il calendario dei primi 7 giorni', 'lievito madre principianti', 2900, 'Siamo 14° con 1.300 impressioni e nessuna pagina dedicata.'],
    ['trips', 'Porto senza auto: come muoversi', 'porto senza auto', 880, 'Domanda ricorrente su ChatGPT, oggi citano un forum.'],
    ['saas', 'Regime forfettario 2027: cosa cambia per le fatture', 'forfettario 2027 fatture', 4400, 'Volume in crescita, i primi 3 risultati sono del 2025.'],
  ];
  ideas.forEach(([p, tema, keyword, volume, perche], i) => put('idee', p + '-demo-' + i, { progetto: p, tema, keyword, volume, perche, data_suggerita: plus(10 + i * 3), lingue: 'it', tipi: ['SEO', 'AEO'], stato: 'Nuova' }));

  const plan = [
    [-12, 'bakery', 'Idratazione dell\'impasto: tabella per farina', 'idratazione impasto', 'Pubblicato'],
    [-9, 'trips', 'Treni regionali in Portogallo: biglietti e orari', 'treni portogallo', 'Pubblicato'],
    [-5, 'saas', 'Fattura elettronica: errori comuni e come correggerli', 'errori fattura elettronica', 'Pubblicato'],
    [-2, 'bakery', 'Pizza in teglia in forno di casa', 'pizza in teglia', 'Pubblicato'],
    [1, 'trips', 'Algarve fuori stagione: cosa resta aperto', 'algarve inverno', 'Programmato'],
    [4, 'saas', 'Nota di credito: quando serve', 'nota di credito', 'Scritto'],
    [8, 'bakery', 'Farina integrale: quanta acqua in più', 'farina integrale acqua', 'Programmato'],
    [11, 'trips', 'Madeira a piedi: 5 levadas facili', 'levadas facili', 'Da confermare'],
    [15, 'saas', 'Partita IVA e pagamenti con carta', 'partita iva pos', 'Idea'],
  ];
  plan.forEach(([d, p, tema, keyword, stato], i) => put('piano', p + '-demo-' + i, { progetto: p, data: plus(d), tema, keyword, lingue: 'it', tipi: i % 3 === 0 ? ['SEO', 'AEO', 'GEO'] : ['SEO', 'AEO'], stato, url: stato === 'Pubblicato' ? '#' : '' }));

  const kws = [
    ['bakery', 'lievito madre', 18100, 4, '/guide/lievito-madre/', 'cucina-italiana.example', true],
    ['bakery', 'farina per pizza', 6600, 7, '/guide/farina-pizza/', 'pizza-academy.example', false],
    ['trips', 'lisbona a piedi', 1900, null, null, 'viaggi-lenti.example', true],
    ['trips', 'porto cosa vedere', 12100, 11, '/porto/', 'guida-porto.example', true],
    ['saas', 'fattura elettronica forfettari', 8100, 3, '/guide/forfettari/', 'fisco-facile.example', true],
    ['saas', 'software fatture gratis', 9900, 24, '/', 'compare-tools.example', false],
  ];
  kws.forEach(([p, keyword, volume, pos, pag, leader, ai], i) => put('keyword', p + '-demo-' + i, { progetto: p, keyword, volume, nostra_posizione: pos, fonte_posizione: pos ? 'Search Console' : '', nostra_pagina: pag, leader_dominio: leader, top3: [leader, 'wiki.example', 'forum.example'], ai_overview: ai, domande_correlate: true, nota: pos && pos > 10 ? 'A un passo dalla prima pagina: una tabella e 3 link interni.' : '' }));

  const pages = [
    ['bakery', '/guide/lievito-madre/', 2100, 64, 4.2, 'Aggiungi 3 FAQ: la ricerca mostra domande correlate.', 'Alto', 'Basso', 'auto'],
    ['bakery', '/guide/farina-pizza/', 1400, 17, 7.1, 'CTR 1,2% in posizione 7: title con il beneficio concreto.', 'Medio', 'Basso', 'auto'],
    ['trips', '/porto/', 3300, 88, 10.9, 'Undicesimo: risposta diretta in apertura e tabella dei quartieri.', 'Alto', 'Medio', 'auto'],
    ['saas', '/guide/forfettari/', 2600, 140, 3.1, 'Già in alto: link verso la pagina prezzi.', 'Medio', 'Basso', 'auto'],
    ['saas', '/blog/vecchio-post/', 3, 0, 61, '', 'Basso', 'Basso', 'nessuna'],
  ];
  pages.forEach(([p, url, impressioni, clic, posizione, consiglio, impatto, sforzo, azione], i) => put('pagine', p + '-' + i, { progetto: p, url, impressioni, clic, posizione, consiglio, impatto, sforzo, azione, periodo: 'ultimi 28 giorni' }));

  const ai = [
    ['bakery', 'ChatGPT', 'Come si rinfresca il lievito madre?', 1, 'sourdough-lab.example, cucina-italiana.example'],
    ['bakery', 'Perplexity', 'Che farina usare per la pizza in casa?', 0, 'pizza-academy.example'],
    ['trips', 'Gemini', 'Si può girare Lisbona a piedi?', 0, 'viaggi-lenti.example, forum.example'],
    ['trips', 'AI Overview', 'Cosa vedere a Porto in 2 giorni', 1, 'slow-trips.example'],
    ['saas', 'ChatGPT', 'Miglior software di fatturazione per forfettari', 0, 'compare-tools.example'],
  ];
  ai.forEach(([p, motore, domanda, citato, citati], i) => put('aeo', p + '-' + i, { progetto: p, motore, domanda, citato, citati }));

  const log = [
    [26, 'bakery', 'Pubblicata: Pizza in teglia in forno di casa', 1.12, 0],
    [50, 'saas', 'Applica consiglio: title della guida forfettari', 0.64, 0],
    [75, 'trips', 'Crea pagina: Porto senza auto', 1.87, 5],
    [120, 'saas', 'Pubblicata: Fattura elettronica, errori comuni', 1.35, 0],
  ];
  log.forEach(([h, p, titolo, usd, cr], i) => put('interventi', 'demo-' + i, { quando: new Date(now - h * 36e5).toISOString(), progetto: p, titolo, stato: 'Fatto', esito: 'Build e controllo link ok, pubblicata.', link: '#', costo_usd: usd, crediti_openseo: cr, token_totali: Math.round(usd * 1.6e6) }));

  // ----- minimal Firestore-like API used by the dashboard -----
  const listeners = {};
  const snap = (col) => ({ docs: [...(db[col] || new Map()).entries()].map(([id, d]) => ({ id, data: () => Object.assign({}, d) })) });
  const emit = (col) => (listeners[col] || []).forEach((fn) => fn(snap(col)));
  let n = 0;
  const collection = (col) => ({
    onSnapshot(fn) { (listeners[col] = listeners[col] || []).push(fn); setTimeout(() => fn(snap(col)), 0); return () => {}; },
    doc(id) { return { id, async update(patch) { put(col, id, Object.assign({}, (db[col] || new Map()).get(id), patch)); emit(col); } }; },
    async add(doc) { const id = 'demo-new-' + (++n); put(col, id, doc); emit(col); if (col === 'richieste') simulate(id); return { id }; },
  });

  // Simulate the routine picking up a request, so the buttons feel alive.
  function simulate(id) {
    const upd = (patch) => { put('richieste', id, Object.assign({}, db.richieste.get(id), patch)); emit('richieste'); };
    setTimeout(() => upd({ stato: 'In lavorazione', passo: 'Leggo i dati e il repository', iniziata_il: new Date().toISOString() }), 1200);
    setTimeout(() => upd({ passo: 'Build e controllo link' }), 3200);
    setTimeout(() => {
      const r = db.richieste.get(id);
      const usd = Math.round((0.6 + Math.random()) * 100) / 100;
      upd({ stato: 'Fatto', passo: '', esito: 'Demo: in una installazione vera qui trovi cosa è cambiato e il link pubblico.', finita_il: new Date().toISOString(), costo_usd: usd, token_totali: Math.round(usd * 1.6e6), crediti_openseo: r.tipo === 'crea_pagina' ? 5 : 0 });
      if (r.rif && r.rif.startsWith('consigli/')) collection('consigli').doc(r.rif.slice(9)).update({ stato: 'Fatto', esito: r.tipo === 'verifica_manuale' ? 'Verificato (demo).' : 'Applicato (demo).', aggiornato_il: new Date().toISOString() });
    }, 5200);
  }

  window.eicDemo = {
    async use(name) {
      if (name === 'db') return { collection };
      if (name === 'user') return { can: async () => true };
      throw Object.assign(new Error('not available in the demo'), { code: 'not_in_manifest' });
    },
  };
})();
