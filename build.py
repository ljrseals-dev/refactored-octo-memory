#!/usr/bin/env python3
"""Build index.html (standalone, works with a live mic in a normal browser) from the page body.

src/singerflow.body.html is the source of truth (the same file is published as an Artifact).
"""
from pathlib import Path

root = Path(__file__).parent
body = (root / "src" / "singerflow.body.html").read_text(encoding="utf8")

page = (
    "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n"
    "<style>:root{color-scheme:light}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n"
    "</head>\n<body>\n" + body + "\n</body>\n</html>\n"
)
(root / "index.html").write_text(page, encoding="utf8")
(root / "dist" / "artifact.html").write_text(body, encoding="utf8")
print("wrote index.html and dist/artifact.html")
