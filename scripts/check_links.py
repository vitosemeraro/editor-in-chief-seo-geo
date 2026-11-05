#!/usr/bin/env python3
"""Check that every internal link and asset in a static site folder points to an existing file.

Usage: python3 check_links.py <site folder>
Exit code 1 if any internal link is broken. External links (http, https, mailto, tel) are skipped.
"""
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.found = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name in ("href", "src") and value:
                self.found.append(value)


def resolve(root: Path, page: Path, link: str):
    parsed = urlparse(link)
    if parsed.scheme or link.startswith(("//", "#", "data:", "javascript:")):
        return None
    path = unquote(parsed.path)
    if not path:
        return None
    target = (root / path.lstrip("/")) if path.startswith("/") else (page.parent / path)
    candidates = [target, target / "index.html", target.with_suffix(".html")] if not target.suffix else [target]
    return next((c for c in candidates if c.is_file()), target)


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    root = Path(sys.argv[1]).resolve()
    if not root.is_dir():
        print(f"Not a folder: {root}")
        return 2
    broken = []
    pages = sorted(root.rglob("*.html"))
    for page in pages:
        parser = Links()
        parser.feed(page.read_text(encoding="utf-8", errors="replace"))
        for link in parser.found:
            target = resolve(root, page, link)
            if target is not None and not target.is_file():
                broken.append(f"{page.relative_to(root)} -> {link}")
    for line in broken:
        print("BROKEN", line)
    print(f"{len(pages)} pages checked, {len(broken)} broken internal links")
    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
