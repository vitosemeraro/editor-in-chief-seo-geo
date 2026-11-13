# Changelog

All notable changes to Editor-in-Chief. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/): while the project is 0.x, a new feature or a
change to the database schema bumps the minor version, a fix bumps the patch.

Every change comes from the private dashboard the author uses daily on 4 real sites, generalized before
it lands here.

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
