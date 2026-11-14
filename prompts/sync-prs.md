# Sync pull requests (scheduled, e.g. every 3 hours in the daytime)

A short job, and only this: align the `pr` collection of the dashboard (tool ArtifactData, artifact URL from
`editor.dashboard_url`) with the real state of the pull requests on GitHub. Do no other work: do not open
PRs, do not write to repositories, do not log to `interventi`.

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
6. Always, at the end: update `editor/stato` with only `pr_controllo_il` = now (ISO). The dashboard shows
   it as the last check time.
