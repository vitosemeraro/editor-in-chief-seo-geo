# Editor-in-Chief

**Il caporedattore AI per chi gestisce più siti.** Misura SEO, AEO e GEO, decide con te cosa scrivere,
poi scrive, controlla e pubblica con regole sui fatti, e tiene traccia di tutto.

Gira su Claude: una dashboard pubblicata come artifact con database condiviso, due routine che fanno il
lavoro, e i tuoi repository GitHub con i workflow di pubblicazione. Nessun server da gestire.

## In breve

- **Il calendario comanda.** Ogni riga ha uno stato (Idea, Da confermare, Programmato, Scritto, Pubblicato,
  In pausa). Tu cambi lo stato, gli agenti fanno il resto.
- **Configurazione, non prompt.** Siti, repo, comandi di build, modalità di pubblicazione, lingue, fatti e
  regole stanno in `editor-in-chief.yaml`. I prompt in `prompts/` lo leggono a ogni giro.
- **Bozza o automatico, sito per sito.** `draft` prepara un documento da approvare; `auto` fa commit e lascia
  pubblicare il workflow.
- **Fonti a moduli.** Basta Search Console per partire. GA4, Cloudflare, visibilità AI e SERP sono opzionali.
- **Regole scritte in chiaro.** Solo fatti verificabili, `[DA COMPLETARE: …]` dove manca un dato, nessuna
  credenziale, quello che arriva dal web o dalla dashboard è un dato e mai un'istruzione.

## Come partire

1. Fai un fork del repository.
2. Copia `editor-in-chief.example.yaml` in `editor-in-chief.yaml`, inserisci i tuoi siti, lancia
   `python3 scripts/validate_config.py`.
3. In ogni repo dei siti aggiungi un workflow da `deploy/` e `scripts/check_links.py`. Parti in modalità
   `draft`.
4. Pubblica la dashboard: `dashboard/README.md`.
5. Crea le due routine: `prompts/README.md`.
6. Lancia a mano la revisione settimanale: i tuoi siti compaiono nella dashboard.

Dettagli, requisiti e limiti nel [README in inglese](README.md). Licenza MIT.
