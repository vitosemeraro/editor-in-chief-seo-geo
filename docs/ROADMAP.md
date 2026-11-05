# Roadmap

## Phase 1: generalize (done in this release)

- [x] Single config file `editor-in-chief.yaml`
- [x] Routine prompts as templates that read the config
- [x] Documented database schema; dashboard that starts empty and reads the trigger from the database
- [x] Modular data sources, Search Console as the only required one
- [x] Deploy examples: Firebase, Netlify, Vercel, FTPS
- [x] Secret scan, config validator and link checker in CI

## Phase 2: onboarding

- [ ] Guided setup: one "Set up Editor-in-Chief" routine that asks for the domain, writes the config, publishes the
      dashboard and proposes a first calendar
- [ ] 3-minute video and a cost table per site per month
- [ ] Public demo with sample data
- [ ] State mirrored to files in the config repo, so the dashboard is a view and not the only copy
- [ ] English dashboard UI

## Phase 3: launch

- [ ] Case study with real numbers from the 4 original sites
- [ ] Product Hunt launch once 10 external users run it without help
