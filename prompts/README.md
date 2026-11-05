# Routines

Regia runs on two Claude routines (scheduled cloud sessions on claude.ai/code). Both read
`regia.config.yaml` from your config repo at every run, so you never edit the prompts to add a site.

| Routine | Prompt | Schedule | Needs |
| --- | --- | --- | --- |
| Weekly review | `weekly-review.md` | once a week, e.g. Monday 08:00 | config repo (read), data connectors, dashboard |
| Run requests | `run-requests.md` | every morning, e.g. 07:00, and on demand from the buttons | config repo, site repos (write), data connectors, dashboard |

Setup:

1. Create each routine in Claude Code on the web, attach the config repo and the site repos, enable the
   connectors listed in `sources/README.md` for the modules you use.
2. Paste the prompt from the line `---` down, and replace `{{CONFIG_REPO}}` with `owner/name`.
3. Copy the id of "Run requests" (`trig_...`) into `regia.trigger_id`.

Keep the prompts generic: site facts go in `sites[].facts`, rules in `rules`, strategy in
`sites[].editorial_plan`. If you need behaviour that only one site has, add a field to the config and a
line in the prompt that reads it, so other users get it too.
