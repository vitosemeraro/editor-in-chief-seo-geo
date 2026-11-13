# consent.js: one cookie banner for every site

A single file, no dependencies, that you drop into each site so all of them show the same cookie banner
and load analytics only after consent.

- **"Accept all"** is the large primary button. **"Settings"** opens the categories (technical, always on;
  statistics, off by default) with "Save choices". The **×** in the corner closes the banner and keeps
  technical cookies only, which is how the Italian Garante (2021 cookie guidelines) allows a refusal
  without a "Reject" button.
- **Google Consent Mode v2**: every signal starts `denied`; `analytics_storage` becomes `granted` only on
  accept. No Google, GTM or Clarity script is requested before consent.
- Choice saved in `localStorage` (`cc-consent`). Accepted: asked again after 12 months. Refused or
  closed: after 6 months. Revoking from Settings deletes `_ga*`/Clarity cookies and reloads the page.
- Texts in Italian, English, French, German, Dutch and Spanish (from `<html lang>` or `data-lang`).

## Install

Put the file in the site (for example `/assets/consent.js`) and add this line in `<head>`, before any
other script that calls `gtag`:

```html
<script src="/assets/consent.js?v=1.0.0" data-ga="G-XXXXXXX" data-policy="/privacy/#cookie"></script>
```

| Attribute | Meaning |
| --- | --- |
| `data-ga` | GA4 measurement id, loaded only after consent |
| `data-gtm` | optional Google Tag Manager container |
| `data-clarity` | optional Microsoft Clarity project |
| `data-policy` | link to the cookie policy |
| `data-lang` | `it` `en` `fr` `de` `nl` `es` (default: `<html lang>`) |
| `data-legacy` | `localStorage` key of the banner you are replacing: its saved choice is kept |
| `data-accent` | colour of the primary button |

Add `data-cc-open` to any link or button (for example "Cookie" in the footer) to reopen Settings.

Your own events keep working: `window.gtag` exists from the start, so `gtag('event', ...)` calls only
queue until the visitor accepts. `window.ccLoaded` is `true` once analytics is on, and the document
fires `cc:change` with `detail.analytics` after every choice.

Check before publishing: open the site in a private window, look at the Network tab, and confirm there
is no request to `googletagmanager.com` until you press "Accept all".
