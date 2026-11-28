# Changelog

All notable changes to Editor-in-Chief. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/): while the project is 0.x, a new feature or a
change to the database schema bumps the minor version, a fix bumps the patch.

Every change comes from the private dashboard the author uses daily on 4 real sites, generalized before
it lands here.

## [0.34.0] - 2026-11-28

### Added
- "Expected conversions" can use real leads counted by hand. When `conversioni.richieste_vere_28g` is set, the
  rate starts from those leads (email, chat, form, booking portals; spam and tests left out) instead of GA4 key
  events, over the Cloudflare visits of the last 4 weeks, so both numbers come from the same source. The card
  adds the line "Lead veri 28 gg" with the bookings (`prenotazioni_vere_28g`) and the date of the count. Born
  from a site where GA4 counted button clicks, mostly bots and tests, while the one real lead of the month came
  through chat.

### Schema
- `conversioni/{site_id}`: new optional fields `richieste_vere_28g`, `prenotazioni_vere_28g`,
  `richieste_vere_verificate_il`.

## [0.33.0] - 2026-11-22

### Fixed
- "AI critics" no longer makes a check that never ran look like a result. Each "no" now shows the date it was
  read, the empty state no longer promises a first check on a fixed date, and the section intro no longer
  claims a weekly check runs for every site.

### Added
- A status line per site above the table (checked on date / never run, and why / not set up), with credits
  left and credits needed per week. Born from four weekly trackers that skipped every run for three weeks
  for lack of credits while the dashboard kept showing "no".

### Schema
- New document `editor/geo`; `aeo` rows document the `data` field.

## [0.32.0] - 2026-11-22

### Added
- `scripts/quality_check.cjs` flags the site's own JavaScript errors (`pageerror`) as an ERROR, so a script
  bug that breaks a quote form or booking widget blocks the push. Errors thrown by third-party scripts on
  other domains are ignored. Born from a variable clash that broke a live quote form for about 30 minutes
  while every other check was green.

## [0.31.0] - 2026-11-21

### Added
- `editor.experiments.focus` (`sites`, `pages`): the cycle's experiments and campaigns go only to the offers
  the owner wants to sell first; other sites keep the results-day experiment. Lower thresholds for focus
  pages (1 click or 30 impressions).

## [0.30.0] - 2026-11-21

### Added
- More experiments when the AI plan has spare quota. The continuous cycle now alternates tip, tip,
  experiment: new request types `esperimento` (one change on a page with clicks or 100+ impressions at
  position 1-15, any day, including a map or table option) and `campagna` (a content campaign for one target
  audience: research, one new page in that audience's languages, a link from the closest page, a ready
  business-profile post as a manual tip, measured after a window). No paid ads unless the owner writes a budget.
- Weekly quota margin: `editor/stato.quota_settimana_pct` slows the cycle to 8 requests a day above 80% and
  stops it above 90%.

### Schema
- `editor/stato`: `ciclo_tetto_giorno`, `esperimenti_tetto_giorno`, `quota_settimana_pct`, `quota_letta_il`.
- Config: `editor.experiments.cycle_daily_cap`, `editor.quota_slowdown_pct`, `editor.quota_stop_pct`,
  `sites[].campaigns` (`audiences`, `max_credits`, `window_days`).
- `esperimenti`: `tipo`, `pubblico`, `keyword`.

## [0.29.0] - 2026-11-20

### Changed
- The Billboard ("Cartellone") is now the results board and the Notes are the single to-do list. Every page
  row shows where its work stands: "Nelle note di redazione" (open tip, with "vai alla nota"), "Fatto, in
  osservazione" (done tip, with "cosa è stato fatto"), "In osservazione", "Pochi dati", or "Da fare" with
  "Applica" only when the move is not a tip yet. Before, "Applica" appeared only on the few rows marked
  `azione: auto`, the rest looked inert, and a move left on the Billboard was invisible to the continuous
  cycle and could be done twice (once as a page request, once as a tip).
- "vai alla nota" / "vai al consiglio" (Billboard and Board) scroll to the exact tip card and highlight it,
  turning on "mostra fatti" and clearing filters when the tip would be hidden.
- `run-requests.md` (`aggiorna_dati`): a page that needs a repo change becomes a tip (`origine: cartellone`,
  `rif: pagine/<id>`) and the row gets `consiglio_id`; `azione: auto` stays only as a fallback.

### Schema
- `pagine`: optional `consiglio_id`. `consigli`: optional `rif`, `origine`.

## [0.28.0] - 2026-11-20

### Added
- "CTR without USA" and "Page-one CTR" next to the raw CTR on the site card and in Health, each "vs the previous
  28 days". When one country brings more than 30% of impressions with 0 clicks (tool traffic), the card warns that
  the raw CTR is skewed and points to the clean ones. Task force context carries the same numbers.
- `weekly-review.md`: how to compute them (total minus a `country equals` read, never `notEquals`).

### Schema
- `salute`: optional `ctr_28g_no_usa`, `ctr_prev_no_usa`, `quota_usa_28g`, `ctr_prima_pagina_28g`,
  `ctr_prima_pagina_prev`, `clic_prima_pagina_28g`, `impressioni_prima_pagina_28g`.

## [0.27.0] - 2026-11-20

### Added
- Quality check before every push, mandatory in `run-requests.md` (step 4b) and `spare-capacity.md`.
  `scripts/quality_check.cjs` renders each new or changed page with Playwright on a phone (390 px) and a
  computer (1280 px), saves full-page screenshots and fails on: the same title twice on a page, placeholder
  text left in, broken images, blurry photos (shown larger than the file), stretched or rotated photos,
  pages wider than the screen, headings covered by other elements. Warnings for missing alt text and a main
  photo under 1600 px. The session looks at the screenshots too, fixes and runs it again; it never pushes
  with errors.
- Photo rule in the drafts of `weekly-review.md` and in the example config: photos that fit the topic and
  season, main photo at least 1600 px, own or freely licensed with credits.

### Schema
- Config: `sites[].check.build_dir`, the folder with the built pages the quality check reads.

## [0.26.0] - 2026-11-17

### Added
- "Start task force" for a site in serious trouble. The button sits on site cards in Attention or Critical
  (red) and at the bottom of every Health card. It creates a `task_force` request with the card's numbers
  and starts it: a dedicated session diagnoses the cause from the data (pages and queries vs the previous 28
  days, indexing, recent repository changes, analytics, path to contact), fixes what can be fixed from the
  repository and leaves the rest as tips. One running task force per site.
- Run sheet: task forces at the top with live step, status (queued, running, closed, failed) and result,
  "open the chat", "Run again" on failed ones. Closed task forces show only with "show done".
- Prompt: `task_force` request type in `run-requests.md`.

### Schema
- `richieste`: `tipo` `task_force`, fields `contesto` and `diagnosi`. `salute`: `task_force_il`,
  `task_force_esito`.

## [0.25.0] - 2026-11-17

### Added
- CTR in every analysis. Site cards show Google clicks, impressions, CTR and average position for the last 28
  days, each "vs X in the previous 28 days" in green (better) or red (worse).
- Health cards add CTR and position with the same comparison, plus a one-line reading: CTR low for the
  position (rewrite title and description), CTR down because position got worse (climb, not titles), or CTR
  good for the position.
- Pages table: CTR column, red when a page-one page gets few clicks for its position.
- Prompts: the weekly review and `aggiorna_dati` write CTR and position for both periods and explain CTR in the
  notes; `controllo_sito` writes a CTR tip when a page is below the typical CTR for its position.

### Schema
- `salute`: `posizione_28g`, `posizione_prev`, `ctr_28g`, `ctr_prev`.

## [0.24.0] - 2026-11-17

### Added
- Manual tips get their launch button back: "I'm online, go ahead" on every tip that cannot be applied from a
  repository. It creates a `fai_col_pc` request and starts it, so the agent does the step from the browser
  on the owner's PC.
- Run sheet status: every job shows how its last run went (running, succeeded, failed) and a summary line
  counts jobs running now, done today and failed.
- "Run again" on failed jobs: restarts the job from the page and marks it running until the next check.
  If the scheduler refuses, the row links the job's page to start it by hand.
- "Refresh" on the run sheet: starts `sync-prs` right away; that run updates only the run sheet (step 5d).

### Schema
- `schedule`: `ultimo_esito` can be `in_corso`; new fields `iniziata_il`, `ultima_chat`, `rilanciata_il`,
  `rilancio_msg`, `rilancio_fallito`.
- `editor/config.sync_trigger_id`, `editor/stato.programmate_richiesto_il`.

## [0.23.0] - 2026-11-16

### Added
- "Run sheet" strip under "In the edit": every scheduled job (recurring routines and one-off runs) with its
  next run in your time zone, how often it runs, when it last ran and whether that run failed. Jobs due in
  the next 3 hours are highlighted; the next run is recomputed from the cron expression when the stored one
  is in the past. Jobs that already ran or were switched off show only with "show done".
- `sync-prs` refreshes the list every 3 hours (new step 5d).

### Schema
- New collection `schedule/{job id}` and field `editor/stato.programmate_controllo_il`.

## [0.22.0] - 2026-11-14

### Added
- Conversations that wait for an answer from the owner show up under manual work as "Stalled chat", with
  how many days they have been waiting and a link to the conversation. `sync-prs` keeps them in step
  (new step 5c, new request type `chat_ferma`).

## [0.21.0] - 2026-11-14

### Added
- The morning run refreshes the numbers of every site when the last refresh is more than 20 hours old, so
  the dashboard is never a day behind.

## [0.20.0] - 2026-11-14

### Changed
- The continuous cycle no longer stops when automatic advice runs out: it starts "Check and advise" on the
  site checked longest ago (not within the last 24 hours), and the new advice keeps the cycle going.

### Fixed
- The slate counted 0 open jobs when the only advice left had an old closed request: advice still "To do"
  is counted again.

## [0.19.0] - 2026-11-14

### Added
- **Failed GitHub checks** (builds, preview deploys) are now visible: a red box at the top of the slate lists
  each one with site, repository, branch or PR and a link to the log, and the PR in "In the edit" gets a red
  tag. The `sync-prs` job writes them (new step 5b).

### Changed
- The keyword, pages and AI answers tables hide rows whose last job is done, with a "show done" checkbox
  and the count of hidden rows, like every other list.

### Schema
- New collection `controlli`; `pr.controlli_ko`.

## [0.18.0] - 2026-11-14

### Changed
- Done items are hidden by default in every list and come back with a "show done" checkbox on that list:
  advice (already there), calendar (published releases), log (done and cancelled work, so by default it
  shows only what is still open), ideas (added and dismissed, as a compact list) and "In the edit"
  (merged and closed PRs, greyed out under the open ones). Lists on the slate already showed only open work.

## [0.17.0] - 2026-11-14

### Added
- **"I'm online, go ahead"** for jobs waiting for your computer: one big button on the "computer on" list
  of the slate starts all of them at once, and a small one on each row starts that job alone. Each creates a
  `fai_col_pc` request and starts a session right away; the session does the step itself (without a
  browser when it can, otherwise with the owner's signed-in browser), closes the advice and tells you if
  the computer could not be reached. New request type in `prompts/run-requests.md`.

### Schema
- Request type `fai_col_pc` (rif `consigli/<id>` or `richieste/<id>`, origine `pc`); `editor/stato.pc_online_il`.

## [0.16.1] - 2026-11-14

### Fixed
- "In the edit" no longer keeps pull requests that were already merged or closed: new `prompts/sync-prs.md`
  job checks GitHub every 3 hours and updates `pr`, closing the linked advice when the merge was the only
  step left. PRs whose linked advice is already `Fatto` or `Scartato` are hidden right away.

### Added
- "Already merged or closed" button on each PR to drop it from the list at once, and the time of the last
  GitHub check under the count.

### Schema
- `editor/stato.pr_controllo_il`; `pr.segnata_dalla_pagina`, `pr.chiusa_il`.

## [0.16.0] - 2026-11-13

### Added
- **Results days**: publish days listed in `editor.cadence.results_days` (default Thursday) no longer take a
  topic from the calendar. That morning the agent reads Search Console for the last 14 days and writes the
  piece next to the page with the most clicks (or targets the best near-page-one query), with a fallback
  topic stored on the row. The other weekly slot still comes from the calendar.
- **Experiments on winning pages**: on each results day, one experiment per site on the page that already
  brings clicks (conversion box, missing question section, or title/description), with a stored baseline,
  kept or rolled back after `window_days`. New config block `editor.experiments`.

### Schema
- `piano`: origine `risultati`, new fields `riserva` and `perche_risultati`.
- New collection `esperimenti/{site_id}-{YYYYMMDD}-{n}`.

## [0.15.0] - 2026-11-13

### Added
- **"In the edit" strip** under "Rolling": the pull requests waiting for you to merge, with a big count,
  repository, number, title, one line on what each is for, how long it has been open, the linked advice
  state and an "Open and merge" button. A "PRs" chip in the menu shows the count and jumps there.
- **Clickable slate**: every counter, film strip segment, per-site bar and manual-work card opens the
  filtered list right on the slate, and every row links to its chat, its PR, its page or its advice.

### Changed
- "Left for manual work" now counts advice in `Da approvare` or `Da fare a mano` too, not only requests,
  without counting the same job twice. Advice waiting for a PR merge counts as "your decision".
- `prompts/run-requests.md` point 8: write a `pr` row for every pull request opened and refresh their
  state at the start of every run.

### Schema
- New collection `pr/{repo name}-{number}`.

## [0.13.1] - 2026-11-13

### Fixed
- `prompts/run-requests.md`: requests stuck `In coda` or `In lavorazione` for more than 24 hours are now
  resumed at the start of every run (closed if the work already landed, requeued otherwise), so they no
  longer sit forever in the "Rolling" banner.

## [0.13.0] - 2026-11-13

### Added
- **"Rolling" banner** right under the header: every request in progress or queued, with the advice title,
  site, request type, current step, how long it has been running, a "cycle" tag, a "maybe stuck" tag after
  3 hours without news, and a link to its chat. The "rec" light in the menu jumps to it.
- **Continuous cycle**: when the queue is empty the agent applies the next automatic advice by priority and
  starts itself again, up to `editor.cycle_daily_cap` requests a day (default 12). On/off switch on the slate,
  styled like a slate clapper, with today's counter and the next advice on stage. Switching it on with an
  empty queue starts a run right away. New section 1c in `prompts/run-requests.md`.

### Schema
- `editor/stato.ciclo_attivo` (missing = on) and `ciclo_cambiato_il`; requests created by the cycle have
  `origine: "ciclo"`. New config keys `editor.continuous_cycle` and `editor.cycle_daily_cap`.

## [0.12.0] - 2026-11-13

### Added
- **Requests left to you**, now the headline of the slate: every request still `Da fare a mano` or
  `Da approvare`, counted one by one, split by who unblocks it. Claude closes them (the linked advice is
  already done or dismissed, or there is nothing to do), your computer must be on, your decision, external
  block. A big film strip, four large counters and the list with a link to each chat.

### Changed
- `prompts/run-requests.md`: the agent writes `blocco` whenever it leaves a job to the owner, never leaves
  `Da fare a mano` on a job with nothing to do, and keeps requests and advice in sync (closing an advice
  closes its pending requests; every run first closes stale manual requests).

### Schema
- `blocco` also accepts `claude`.

## [0.11.0] - 2026-11-13

### Added
- **The slate** (SC.02), one dark board with every counter, so you can tell at a glance whether to keep
  going or stop and close things yourself. Jobs: to do, in progress, waiting for your computer to be on,
  waiting for your decision, external block or unclassified, rejected by you, closed. Releases: new, scheduled,
  failed (date passed and not out), published. Each group has a film-strip bar in proportion, then open jobs
  by site, a pace chart for the last 8 weeks (jobs opened vs closed, releases published), a verdict (Full
  speed ahead / Slow down / Stop, close things) and the list of what waits on you with a link to its chat.
  A job is counted once: an advice or item with its latest request, or a request on its own.
- Menu entry "Slate"; scene numbers shift by one.

### Schema
- New optional field `blocco` (`desk` | `decisione` | `esterno`) on `richieste` and `consigli`. Without it
  the dashboard infers who a manual job waits on from the `esito` text.

## [0.10.0] - 2026-11-13

### Added
- **Sticky top menu** shaped like a film slate: always visible while you scroll, it jumps to each section,
  highlights the one you are reading and opens the Budget view. On phones (under 900 px) it folds into a
  hamburger. A "rec" light in the menu blinks while Claude is working on requests.

### Changed
- **New look and section names.** Every section is a numbered scene (SC.02, SC.03…) with a short name and a
  plain subtitle that says what it is: The pulse (site health), Editor's notes (advice), Story ideas, Line-up
  (calendar), Audience (keywords), Now showing (pages on Google), AI critics (AI citations), Set diary (work
  log), In the room (visitor actions), Production budget (costs), Behind the scenes (how it works).
  Warm paper palette with a slate red accent, condensed display headings, light and dark themes.
- The view switch (main / costs) moved from the header chips to the menu.
- Demo: the banner sits above the menu; new strings translated in English, Spanish and French.

## [0.9.0] - 2026-11-13

### Added
- **`consent/consent.js`**, one cookie banner for all your sites: a large "Accept all", a "Settings" panel
  with categories, and a × that closes with technical cookies only. Google Consent Mode v2 with every
  signal denied by default; GA4, GTM and Clarity load only after consent. Texts in 6 languages, keeps the
  choice saved by the banner it replaces (`data-legacy`), reopens from any `data-cc-open` link.
  See `consent/README.md`.

## [0.8.0] - 2026-11-13

### Added
- **Conversion forecast** on every site card: "Expected conversions · 30 days" as a range, never a single
  number, with a reliability label (low, medium, high) and a "How it is calculated" detail. Expected visits
  come from the last two weeks of Cloudflare visits; the rate blends a stated industry benchmark with real
  GA4 key events (the benchmark counts like 100 sessions, so real data takes over as it grows). Sites that do
  not measure the conversion yet use the benchmark only and say so.

### Schema
- New optional collection `conversioni/{site_id}` (`obiettivo`, `misurato`, `rif_min`, `rif_max`,
  `fonte_rif`, `nota`); new field `salute.conversioni_28g`; new optional config block `sites[].conversions`.
  The weekly review writes `conversioni_28g` when GA4 is on.

## [0.7.0] - 2026-11-13

### Fixed
- Site cards: a long text in `automazione` (or any long note, URL or status) no longer spills out of the
  card and over the cards next to it. Card grids now use a `minmax(0, 1fr)` column, pills shrink with an
  ellipsis, and an `automazione` longer than a short label is shown as a wrapping note instead of a pill.

### Schema
- `progetti/<site>.nota` (optional string): a note shown under the site name on its card, for things like
  hosting or deploy status. Keep `automazione` to a short label (`Automatica`, `Con il tuo ok`).

## [0.6.2] - 2026-11-11

### Fixed
- Spare capacity: a tip whose request has been stuck for more than 24 hours (an interrupted session) is
  picked again instead of being skipped forever. The stuck request is closed as `Errore`, pointing to the
  new one.

## [0.6.1] - 2026-11-09

### Fixed
- Spare capacity: a request stuck for more than 3 hours (an interrupted session) no longer blocks every
  following night. Only requests updated in the last 3 hours count as the owner working; stuck ones are
  listed in the Monday report.

## [0.6.0] - 2026-11-08

### Added
- **Spare capacity routine** (`prompts/spare-capacity.md`, optional). A nightly cloud routine that spends
  the part of your Claude plan you would not use anyway: it applies the automatic tips still to do, best
  impact/effort first, by firing the run-requests routine once per tip. Runs with your computer off.
  Hard caps per night and per week (your reserve), a pause of 2 days as soon as a usage-limit error shows
  up, and it skips the night when you have requests of your own in progress. When no tips are left it
  runs one site check to generate new ones.

### Schema
- New document `editor/quota` (switch, caps, weekly counter, pause); optional field `origine` on
  `richieste`; new config block `editor.spare_capacity`.

## [0.5.0] - 2026-11-07

### Added
- **Costs view.** A "Costs" switch next to the site filter opens a dedicated view: spend per site over
  time (by day, week or month) as a stacked chart and a table with running total, plus totals per site,
  last 30 days and data credits. Measured Claude jobs (`costo_usd` on `richieste` and `interventi`) come
  in on their own; finished jobs without a measured cost are counted and flagged, not guessed.
- Expenses added by hand (subscriptions, domains, hosting, ads): once, every month or every year, in € or $,
  per site or shared. Totals in € or $ with an editable exchange rate.
- "Open the chat" on each tip: opens a conversation about that tip only (request type `chat_consiglio`,
  now documented in the run-requests routine together with `spiega_consiglio`).

### Schema
- New collection `costi/{auto id}`; new document `editor/costi` (`usd_eur`).

## [0.4.0] - 2026-11-06

### Changed
- **One request, one conversation.** The run-requests routine now takes a single request per session.
  The scheduled run no longer works the queue itself: it fires the routine once per waiting request
  (at most 10), so the dashboard's "open the chat" link leads to a conversation about that request only.
  Each session renames itself after the request, posts what it is about, and ends with a full report.
- `sessione` points to the conversation the owner can reply in (the project thread link when the routine
  runs in a project).
- Results and messages always use full URLs, ready to copy.

## [0.3.2] - 2026-11-06

### Fixed
- Tips: with "show done and dismissed" unchecked, tips marked Done are hidden immediately instead of staying for 48 hours.

## [0.3.1] - 2026-11-06

### Added
- Feedback form in GitHub Discussions (3 questions), linked from both READMEs.

## [0.3.0] - 2026-11-05

### Added
- **Demo in four languages:** English (default), Italian, Spanish and French, with a language switcher.
  Interface, statuses and demo data are all translated; dates and numbers follow the language's locale.
- `scripts/demo_i18n.py`: the translation table. `build_demo.py` lists any string left untranslated.

## [0.2.0] - 2026-11-05

### Added
- **Costs on every action.** Each button shows an estimated cost (average of past jobs of the same type,
  scaled by effort), each finished job its real cost (Claude $, tokens, data credits), each site card its
  spend in the last 7 days and in total.
- **Priority = impact ÷ effort.** Tips and page fixes get an `sforzo` (effort) field; lists sort by
  priority and the best ones show "★ Priorità alta".
- **Weekly chart per site:** impressions (bars), clicks (line) and visits (dots), from the new `serie`
  collection.
- **Page-level actions:** each top page gets its own tip, impact, effort and an "Applica" button; pages
  that need nothing are marked and sorted last.
- **Public demo** with invented sites and data (`demo/`), published with GitHub Pages.
- Release workflow: when `VERSION` changes on main, the tag and the GitHub release are created from this changelog.

### Changed
- Routines now record usage at the start and end of every job (`costo_usd`, `token_output`,
  `token_totali`, `crediti_openseo`) and write `sforzo` on tips.
- Tips "verified by Claude" are shown first, then open tips by priority.

### Schema
- New collection `serie/{site}`; new fields `sforzo` on `consigli` and `pagine`, `azione` on `pagine`.

## [0.1.0] - 2026-11-05

### Added
- First public release: single config file, routine templates (weekly review, run requests), database
  schema, dashboard that starts empty, modular data sources (Search Console required), deploy examples
  for Firebase, Netlify, Vercel and FTPS, link checker, secret scan and config validator in CI.

[0.34.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.33.0...v0.34.0
[0.33.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.32.0...v0.33.0
[0.32.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.31.0...v0.32.0
[0.31.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.30.0...v0.31.0
[0.30.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.29.0...v0.30.0
[0.29.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.28.0...v0.29.0
[0.28.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.27.0...v0.28.0
[0.27.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.26.0...v0.27.0
[0.26.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.25.0...v0.26.0
[0.25.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.24.0...v0.25.0
[0.24.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.23.0...v0.24.0
[0.23.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.22.0...v0.23.0
[0.22.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.21.0...v0.22.0
[0.21.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.20.0...v0.21.0
[0.20.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.19.0...v0.20.0
[0.19.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.18.0...v0.19.0
[0.18.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.17.0...v0.18.0
[0.17.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.16.1...v0.17.0
[0.16.1]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.16.0...v0.16.1
[0.16.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.13.1...v0.15.0
[0.13.1]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.13.0...v0.13.1
[0.13.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.6.2...v0.7.0
[0.6.2]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/06ae37c...v0.2.0
[0.1.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/tree/06ae37c
