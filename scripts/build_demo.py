#!/usr/bin/env python3
"""Build demo/index.html from dashboard/index.html plus demo/demo-data.js (fictional data, in memory).

Usage: python3 scripts/build_demo.py
"""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
page = (root / "dashboard" / "index.html").read_text(encoding="utf-8")
data = (root / "demo" / "demo-data.js").read_text(encoding="utf-8")

assert "window.claude" in page, "dashboard no longer uses window.claude: update this script"
page = page.replace("window.claude", "window.eicDemo")

banner = (
    '<div style="background:#1b2230;color:#fff;font:14px system-ui,sans-serif;padding:10px 16px;text-align:center">'
    "Demo with invented sites and numbers. Buttons work and simulate the agent; nothing is published. "
    '<a style="color:#9db6ff" href="https://github.com/vitosemeraro/editor-in-chief-seo-geo">Get Editor-in-Chief on GitHub</a>'
    "</div>"
)
marker = '<div class="wrap">'
assert marker in page
page = page.replace(marker, banner + marker, 1)
page = page.replace("<script>", "<script>\n" + data + "\n</script>\n<script>", 1)
page = page.replace("<title>Editor-in-Chief</title>", "<title>Editor-in-Chief demo</title>", 1)

out = root / "demo" / "index.html"
out.write_text(page, encoding="utf-8")
print("wrote", out.relative_to(root))
