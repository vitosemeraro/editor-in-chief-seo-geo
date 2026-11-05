# Dashboard

`index.html` is a single page that runs as a **Claude artifact** with a shared database. It has no
server and holds no credentials: it reads and writes the collections in `schema/database.md`, and the
routines do the rest.

## Publish it

1. In a Claude Code session (claude.ai/code), ask Claude to publish `dashboard/index.html` as an artifact
   with these capabilities:

   ```json
   {
     "db": { "rules": [ { "path": "richieste", "read": "view", "write": "admin" } ] },
     "mcp": { "servers": [ { "server": "Claude Code Remote", "tools": ["fire_trigger"] } ] },
     "user": {}
   }
   ```

   - `db`: the shared database. The rule lets viewers see the queue but only editors add requests.
   - `mcp` → `fire_trigger`: lets a button start the "run requests" routine immediately. Without it the
     buttons still queue the work, and it runs at the next scheduled run.
   - `user`: hides the buttons for people who can only view.

2. Copy the artifact URL into `regia.dashboard_url` and commit the config.
3. Create the two routines (see `prompts/README.md`), put the id of "run requests" in `regia.trigger_id`.
4. Run the weekly review once by hand: it creates the site cards and fills the first numbers.

The page starts empty and shows "Nessun sito ancora configurato" until step 4.

## Language

The UI is in Italian, like the original. Status values are part of the data contract (see the schema),
so a translation must translate labels only, not stored values. An English UI is on the roadmap.
