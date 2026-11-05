# Changelog

All notable changes to Editor-in-Chief. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/): while the project is 0.x, a new feature or a
change to the database schema bumps the minor version, a fix bumps the patch.

Every change comes from the private dashboard the author uses daily on 4 real sites, generalized before
it lands here.

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
- Release workflow: pushing a `v*` tag creates a GitHub release from this changelog.

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

[0.2.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/vitosemeraro/editor-in-chief-seo-geo/releases/tag/v0.1.0
