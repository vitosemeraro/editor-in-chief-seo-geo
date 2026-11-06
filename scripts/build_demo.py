#!/usr/bin/env python3
"""Build the public demo in English, Italian, Spanish and French.

Takes dashboard/index.html plus demo/demo-data.js (invented data, kept in memory) and writes
demo/index.html (English) and demo/it/, demo/es/, demo/fr/. Translations live in scripts/demo_i18n.py.

Usage: python3 scripts/build_demo.py [--strict]
--strict fails if a string that looks Italian is left untranslated.
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from demo_i18n import BANNER, LOCALES, MONTHS, T  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
LANGS = ["en", "it", "es", "fr"]
NAMES = {"en": "English", "it": "Italiano", "es": "Español", "fr": "Français"}
IDX = {"en": 0, "es": 1, "fr": 2}
ITALIAN = re.compile(r"[àèìòù]|\b(il|lo|la|gli|le|di|del|della|dei|che|per|con|non|una|uno|sono|questo|questa|nessun\w*|giorni|pagina|sito|siti|uscit\w+|consigli\w*|ricerch\w+|aggiung\w+|riprova)\b", re.I)


def base_page():
    page = (ROOT / "dashboard" / "index.html").read_text(encoding="utf-8")
    data = (ROOT / "demo" / "demo-data.js").read_text(encoding="utf-8")
    assert "window.claude" in page, "dashboard no longer uses window.claude: update this script"
    page = page.replace("window.claude", "window.eicDemo")
    page = page.replace("<script>", "<script>\n" + data + "\n</script>\n<script>", 1)
    return page


def tr(text, lang):
    if lang == "it":
        return None
    hit = T.get(text)
    return hit[IDX[lang]] if hit else None


def escape_for(quote, value):
    value = value.replace("\\", "\\\\") if quote != "`" else value
    return value.replace(quote, "\\" + quote)


def translate_js(js, lang, missing):
    def repl(m):
        q = m.group(0)[0]
        raw = m.group(0)[1:-1]
        key = raw
        out = tr(key, lang)
        if out is None and "\\" in raw:
            # keys may be stored with their JS escapes
            out = tr(raw, lang)
        if out is None:
            if lang != "it" and ITALIAN.search(raw) and not re.fullmatch(r"[\w.\-/:# ]*\$\{[^}]*\}[\w.\-/:# ]*", raw):
                missing.add(raw)
            return m.group(0)
        if q == "`":
            return "`" + out.replace("`", "\\`") + "`"
        return q + escape_for(q, out) + q
    return re.sub(r"'(?:[^'\\\n]|\\.)*'|\"(?:[^\"\\\n]|\\.)*\"|`(?:[^`\\]|\\.)*`", repl, js)


def translate_html(html, lang, missing):
    def text(m):
        inner = m.group(1)
        key = inner.strip()
        if not key:
            return m.group(0)
        out = tr(key, lang)
        if out is None:
            if lang != "it" and ITALIAN.search(key):
                missing.add(key)
            return m.group(0)
        return ">" + inner.replace(key, out) + "<"

    def attr(m):
        out = tr(m.group(2), lang)
        return f'{m.group(1)}="{out.replace(chr(34), "&quot;")}"' if out else m.group(0)

    html = re.sub(r">([^<>]+)<", text, html)
    return re.sub(r'(aria-label|placeholder|title)="([^"]+)"', attr, html)


def build(lang, missing):
    page = base_page()
    parts = re.split(r"(<script>.*?</script>|<style>.*?</style>)", page, flags=re.S)
    out = []
    for p in parts:
        if p.startswith("<style>"):
            out.append(p)
        elif p.startswith("<script>"):
            out.append("<script>" + translate_js(p[8:-9], lang, missing) + "</script>")
        else:
            out.append(translate_html(p, lang, missing))
    page = "".join(out)
    page = page.replace("'it-IT'", "'" + LOCALES[lang] + "'")
    page = page.replace("/^Verificato/", "/^(Verificato|Verified|Verificado|Vérifié)/")
    if lang in MONTHS:
        page = re.sub(r"const MESI = \[[^\]]*\];", "const MESI = " + MONTHS[lang] + ";", page)
    prefix = "" if lang == "en" else "../"
    links = " · ".join(
        f'<b>{NAMES[l]}</b>' if l == lang else f'<a style="color:#9db6ff" href="{prefix}{"" if l == "en" else l + "/"}">{NAMES[l]}</a>'
        for l in LANGS)
    note, cta = BANNER[lang]
    banner = ('<div style="background:#1b2230;color:#fff;font:14px system-ui,sans-serif;padding:10px 16px;text-align:center;line-height:1.6">'
              f'{note} <a style="color:#9db6ff" href="https://github.com/vitosemeraro/editor-in-chief-seo-geo">{cta}</a>'
              f'<br><span style="opacity:.85">{links}</span></div>')
    marker = '<div class="wrap">'
    assert marker in page
    page = page.replace(marker, banner + marker, 1)
    page = page.replace("<title>Editor-in-Chief</title>", "<title>Editor-in-Chief demo</title>", 1)
    page = page.replace("<html>", f'<html lang="{lang}">', 1)
    target = ROOT / "demo" / ("index.html" if lang == "en" else f"{lang}/index.html")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(page, encoding="utf-8")
    return target


def main():
    strict = "--strict" in sys.argv
    problems = {}
    for lang in LANGS:
        missing = set()
        t = build(lang, missing)
        print("wrote", t.relative_to(ROOT))
        if missing:
            problems[lang] = missing
    for lang, miss in problems.items():
        for m in sorted(miss):
            print(f"UNTRANSLATED [{lang}]: {m[:120]}")
    if strict and problems:
        sys.exit(1)


if __name__ == "__main__":
    main()
