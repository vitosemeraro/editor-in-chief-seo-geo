#!/usr/bin/env python3
"""Validate editor-in-chief.yaml (or the example). Usage: python3 validate_config.py [file]"""
import re
import sys

import yaml

DAYS = {"mon", "tue", "wed", "thu", "fri", "sat", "sun"}
errors = []


def need(cond, msg):
    if not cond:
        errors.append(msg)


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "editor-in-chief.yaml"
    cfg = yaml.safe_load(open(path, encoding="utf-8"))
    need(isinstance(cfg, dict), "config must be a mapping")
    editor = cfg.get("editor", {})
    need(editor.get("language"), "editor.language is required")
    days = editor.get("cadence", {}).get("publish_days", [])
    need(days and set(days) <= DAYS, f"editor.cadence.publish_days must be a subset of {sorted(DAYS)}")
    need(isinstance(cfg.get("rules"), list), "rules must be a list")
    need(cfg.get("sources", {}).get("search_console", {}).get("provider") in ("openseo", "ahrefs"),
         "sources.search_console.provider must be openseo or ahrefs")
    sites = cfg.get("sites") or []
    need(sites, "at least one site is required")
    ids = set()
    for i, s in enumerate(sites):
        where = f"sites[{i}]"
        sid = s.get("id", "")
        need(re.fullmatch(r"[a-z0-9][a-z0-9-]{0,30}", sid or ""), f"{where}.id must be lowercase letters, digits, dashes")
        need(sid not in ids, f"{where}.id '{sid}' is duplicated")
        ids.add(sid)
        need(str(s.get("url", "")).startswith("https://"), f"{where}.url must start with https://")
        need(s.get("publish_mode") in ("auto", "draft"), f"{where}.publish_mode must be auto or draft")
        need(re.fullmatch(r"[\w.-]+/[\w.-]+", s.get("repo", "")), f"{where}.repo must be owner/name")
        need(s.get("content", {}).get("dir"), f"{where}.content.dir is required")
        need(s.get("content", {}).get("format") in ("markdown", "html"), f"{where}.content.format must be markdown or html")
    for e in errors:
        print("ERROR", e)
    print(f"{path}: {len(sites)} sites, {len(errors)} errors")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
