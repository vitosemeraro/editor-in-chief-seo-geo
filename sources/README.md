# Data source modules

Search Console is the only required module. Each other module is switched on in `sources` of
`editor-in-chief.yaml` and adds fields to the dashboard. If a module is off, the dashboard simply shows
"—" for its fields.

| Module | Required | Connector in Claude | Fills | Cost |
| --- | --- | --- | --- | --- |
| `search_console` | yes | OpenSEO or Ahrefs (GSC tools) | metriche (clic, impressioni, posizione), pagine, salute, keyword.nostra_posizione | free with the connector plan |
| `ga4` | no | OpenSEO (Google Analytics tools) | salute (sessioni, utenti, pagine viste, organiche) | free with the connector plan |
| `cloudflare_web_analytics` | no | Cloudflare API connector | metriche.visite_7g, pageviews_7g; salute.visite_7g_cloudflare | free |
| `ai_visibility` (GEO) | no | OpenSEO AI visibility | aeo, metriche.citazioni_ai / domande_ai | paid credits per check and per site |
| `serp` (keyword market) | no | OpenSEO SERP and keyword metrics | keyword.leader, top3, ai_overview, domande_correlate, volume | paid credits per keyword |

Before enabling a paid module, estimate the monthly cost per site with the provider's own estimate tool
and write it down. Real example from the author's setup (November 2026, OpenSEO): one AI visibility check
with 5 questions on 4 engines costs about 290 credits per site.

## search_console

- OpenSEO: `list_projects` → the site's `openseo_project`; `get_search_console_performance` with
  `dateRange: last_28_days`, `dimensions: ["date"]` for totals and `["page"]`, `rowLimit: 15` for pages.
  If the property is not linked, `list_search_console_sites` and `set_search_console_site` with the
  verified property in `gsc_property`.
- Ahrefs: `gsc-performance-history`, `gsc-pages`, `gsc-keywords` on the site's project.
- Average position = weighted by impressions.

## ga4

- OpenSEO: `get_google_analytics_traffic_acquisition` (last 28 days, `comparePreviousPeriod: true`) and
  `get_google_analytics_page_performance`. Property from `ga4_property`.

## cloudflare_web_analytics

- Cloudflare API connector, `POST /graphql` on the account in `account_id`, dataset
  `rumPageloadEventsAdaptiveGroups` filtered by `cloudflare_site_tag`.
- Use only the 7-day window: on 28 days the dataset is sampled and returns lower numbers.

## ai_visibility

- OpenSEO: set up a tracker per site once (questions, engines, schedule), with the owner's approval of the
  cost. The weekly review only reads `get_ai_visibility_results`; it never starts a paid run.

## serp

- OpenSEO: `get_serp_results` (depth 10) and `get_keyword_metrics`. Run monthly, capped by
  `max_keywords_per_site`, skipped below `budget.openseo_min_credits`.

## Adding a provider

A module is a contract, not code: a provider is valid if it can fill the fields above. To add one, add a
section here with the exact tool calls and open a pull request.
