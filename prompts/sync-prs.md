# Sync pull requests (scheduled, e.g. every 3 hours in the daytime)

A short job, and only this: align the `pr` collection of the dashboard (tool ArtifactData, artifact URL from
`editor.dashboard_url`) with the real state of the pull requests on GitHub. Do no other work: do not open
PRs, do not write to repositories, do not log to `interventi`.

First read `editor/stato`: if `programmate_richiesto_il` is less than 20 minutes old and newer than
`programmate_controllo_il`, the owner pressed "Refresh" on the run sheet: do ONLY step 5d and stop.

1. Read every document in `pr`.
2. Read the PRs with `gh api -X GET search/issues -f q='is:pr user:<owner> created:>=<21 days ago>' -f per_page=100`
   (state, pull_request.merged_at, closed_at).
3. For every document `Aperta` whose PR is no longer open: update (with if_version) stato `Unita` if
   merged_at is set, otherwise `Chiusa`, plus chiusa_il and aggiornato_il. Also fix documents the owner
   marked `Unita` from the page: `Chiusa` if it was not merged, `Aperta` if it is still open.
4. If a merged PR has rif "consigli/<id>" and the advice is still `Da approvare` or `Da fare a mano` only
   because of that merge (its esito says so), set the advice `Fatto` with esito "PR merged on <date>" and
   close the linked manual requests `Fatto`. If a step is still needed after the merge, leave it.
5. For every open PR without a document, create `pr/<repo name>-<number>` as described in
   `schema/database.md`, with `progetto` from `sites[].repo` and a plain one-sentence `perche`.
5b. Failed checks. For every open PR read the checks of its head commit (`gh api repos/<repo>/commits/<sha>/check-runs`
   and `/status`) and write `controlli_ko` on the `pr` document: a list of {nome, url} for checks that ended in
   failure, timed_out, cancelled or action_required (empty when all pass). Then read the checks of the latest
   commit on the default branch of every site repository: for each failing one write
   `controlli/<repo>-<branch>-<check name slug>` (repo, progetto, branch, nome, url, commit, quando, stato
   `Fallito`, aggiornato_il); set `Risolto` on `Fallito` documents whose check now passes. The dashboard shows
   them in red on the slate and on the PR.
5c. Stalled chats. If your environment can list the conversations that wait for an answer from the owner,
   write one `richieste/thread-<id>` per conversation: tipo `chat_ferma`, progetto, testo = conversation title,
   stato `Da fare a mano`, blocco `dec`, esito = one sentence on what it waits for, sessione = link to the
   conversation, creata_il = its last activity, origine "chat ferma". When a conversation is no longer waiting,
   set its row to `Fatto`. The dashboard lists them under manual work with the days they have been waiting.
5d. Scheduled jobs. If your environment can list its scheduled jobs (routines, reminders, one-off runs), write one
   `schedule/<job id>` per job that concerns the sites or this dashboard (never personal jobs, never the job's
   prompt, e-mail addresses or file ids: the page may be shared by link). Fields: nome, cosa (one sentence),
   progetto or sito_nome, quando (human text in your time zone), cron, una_tantum, prossima, ultima,
   ultimo_esito (`ok`; `errore` with nota_esito = the reason in one plain sentence; `in_corso` while the run is
   still working, with iniziata_il = when it started: a "succeeded" status often only means the run was
   delivered, so for runs of the last 6 hours check that the session really finished), ultima_chat (link to the
   last run's conversation, optional), stato (`Attiva`, `Spenta`, `Fatta` for one-offs that ran),
   chat (optional link), aggiornato_il. Update only what changed; set `Fatta` on rows whose job no longer
   exists. A row the dashboard marked `in_corso` with `rilanciata_il` (the "Run again" button) stays `in_corso`
   until the new run shows up (3 hours at most); when you write the real result, delete `rilancio_msg`.
   Then update `editor/stato` with only `programmate_controllo_il` = now (ISO).
6. Always, at the end: update `editor/stato` with only `pr_controllo_il` = now (ISO). The dashboard shows
   it as the last check time.
