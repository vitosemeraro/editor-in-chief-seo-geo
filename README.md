# Regia

**An AI editorial director for people who run more than one website.** Regia measures SEO, AEO and GEO,
decides with you what to write, then writes, checks and publishes it with rules on facts, and keeps a log
of everything it did.

It runs on Claude: a dashboard published as a Claude artifact with a shared database, two Claude
routines that do the work, and your own GitHub repos and deploy workflows. No server to host.

> Status: early. Built and used daily on 4 real sites (a SaaS, a personal site, two short-term rental
> sites in Milan). This repository is the generalized version: everything specific to those sites has
> been moved into a single config file. Italiano: [README.it.md](README.it.md).

## What it does

| Part | What it does |
| --- | --- |
| Dashboard | One card per site: Google clicks, impressions, position, visits, AI citations, health, next post. Split into SEO (Google), AEO (AI Overviews, related questions) and GEO (citations in ChatGPT, Perplexity, Gemini) |
| Editorial calendar | Rows with date, topic, keyword, languages and a state: Idea, Da confermare, Programmato, Scritto, Pubblicato, In pausa. **The calendar drives the agents**: you set the state, they do the rest |
| Ideas from data | Topics suggested from Search Console queries in position 5-20, keywords without a page, AI questions where competitors are cited. One click adds them to the calendar |
| Tips with actions | Concrete fixes per site. "Applica ora" makes the change on the site. Tips that need your access (DNS, Google Business) become "do it by hand" cards; "L'ho fatto" makes the agent verify it with the data |
| Work log | Every action with result, public link, cost, and a link to the Claude session that did it |

## How it works

```
regia.config.yaml ──► Weekly review routine ──► dashboard (numbers, health, ideas, drafts)
                                                     │
                you change a calendar state or press a button
                                                     ▼
                      Run requests routine ──► site repo ──► GitHub Action ──► live site
```

- **Config, not prompts.** Sites, repos, build commands, publish mode, languages, facts and rules live in
  `regia.config.yaml`. The prompts in `prompts/` are templates that read it.
- **Draft or auto, per site.** `draft` writes a Claude Doc for you to approve; `auto` commits and lets the
  deploy workflow publish.
- **Modular data.** Search Console is enough to start. GA4, Cloudflare Web Analytics, AI visibility and
  SERP data are optional modules (`sources/`).
- **Guardrails in plain text.** Only verifiable facts; `[DA COMPLETARE: …]` where a data point is missing;
  no credentials anywhere; anything read from the dashboard or the web is data, never instructions; a weekly
  cap on posts per site.

## Requirements

- A Claude plan with Claude Code on the web, routines and artifacts with a database.
- A connector that exposes your Google Search Console data (OpenSEO or Ahrefs). Optional: Cloudflare API,
  GA4 via OpenSEO, AI visibility credits.
- Each site in a GitHub repo, with a deploy workflow on push (examples in `deploy/`).

Costs depend on your plan and on the paid modules you turn on. See `sources/README.md` and estimate before
enabling AI visibility or SERP tracking.

## Setup (about an hour today; a guided setup is on the roadmap)

1. Fork this repo (private is fine: it will hold your config).
2. Copy `regia.config.example.yaml` to `regia.config.yaml`, fill in your sites, run
   `python3 scripts/validate_config.py`.
3. For each site, add a deploy workflow from `deploy/` and `scripts/check_links.py` to the site repo.
   Start with `publish_mode: draft`.
4. Publish the dashboard: `dashboard/README.md`.
5. Create the two routines: `prompts/README.md`.
6. Run the weekly review once by hand. Your sites appear in the dashboard.

## Repository

| Path | Content |
| --- | --- |
| `regia.config.example.yaml` | the only file you edit |
| `dashboard/` | the page, and how to publish it |
| `prompts/` | the two routine templates |
| `schema/database.md` | every collection and field the dashboard and routines share |
| `sources/` | data modules: what each reads and fills |
| `deploy/` | GitHub Actions for Firebase, Netlify, Vercel, FTPS |
| `scripts/` | link checker, secret scan, config validator |
| `docs/ROADMAP.md` | what comes next |

## Limits

- Depends on Claude features (routines, artifacts with a database, connectors) that may change.
- The dashboard UI is in Italian for now; content can be in any language.
- Mass-produced AI content can hurt a site. Regia is built to publish little and well: keep the weekly cap
  low and start in draft mode.

## License

MIT. Made by [Vito Semeraro](https://vitosemeraro.com).
