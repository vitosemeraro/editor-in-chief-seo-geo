# Deploy examples

Editor-in-Chief never deploys by itself: it pushes to your site repo, and a GitHub Action in that repo publishes.
This keeps credentials in GitHub secrets, out of Claude and out of the dashboard.

| File | Host | Secrets |
| --- | --- | --- |
| `firebase.yml` | Firebase Hosting | `FIREBASE_SERVICE_ACCOUNT` |
| `netlify.yml` | Netlify | `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` |
| `vercel.yml` | Vercel | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` |
| `ftp.yml` | cPanel / FTPS hosting | `FTP_HOST`, `FTP_USERNAME`, `FTP_PASSWORD` |

Copy one into `.github/workflows/` of the site repo, copy `scripts/check_links.py` next to it, set the
folder names, add the secrets in the repo settings, push once by hand and check that the site updates.
Only then set `publish_mode: auto` for that site.

If the site is built by a generator, add the build step before the link check (for example
`npm ci && npm run build`) and point the check at the output folder.
