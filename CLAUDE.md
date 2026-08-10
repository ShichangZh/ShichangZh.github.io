# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Shichang (Ray) Zhang's personal academic website, published with GitHub Pages at
https://shichangzh.github.io/ from `git@github.com:ShichangZh/ShichangZh.github.io.git`,
branch `master`, served from the repo root. Pushing to `master` deploys.

The site is static HTML generated from [jemdoc](http://jemdoc.jaboc.net/) sources
(jemdoc 0.7.3, a Python script at `/usr/local/bin/jemdoc`).

## Source vs. generated files

**`.jemdoc` files are the source; `.html` files are generated output. Both are committed.**
Never hand-edit a `.html` file that has a matching `.jemdoc` — the next compile overwrites it.
Every content change is a two-step: edit the `.jemdoc`, then recompile, then commit both.

Exception: `Birth-and-Assassination/` and `miscellaneous/Birth-and-Assassination/` are
hand-written HTML/JS/D3 with no jemdoc source. These two directories are duplicates of each
other; the site links to the root copy (`https://shichangzh.github.io/Birth-and-Assassination/`).

## Build

Build the whole site:

```bash
./compile_all_jemdoc.sh
```

The script is plain POSIX `sh`, so `sh compile_all_jemdoc.sh` and
`bash compile_all_jemdoc.sh` work too. Keep it that way — avoid bash-only syntax
(arrays, `< <(...)` process substitution, `pipefail`), which breaks under `sh`.

**Always build with the script, never with a bare `jemdoc file.jemdoc`.** The script does
three things a plain invocation does not, and skipping it produces HTML that differs from
what is committed:

1. Passes `-c jemdoc.conf` (see below). Without it you get jemdoc's stock XHTML shell — no
   viewport meta, no fonts, no `site.js`, and the old table-based layout.
2. Rewrites the malformed `target=&ldquo;blank&rdquo;` that this jemdoc build emits on every
   link (see "Local jemdoc quirks"). Internal `.html` links end up with no target (same tab);
   external links and PDFs get `target="_blank" rel="noopener"`.
3. Copies `jemdoc.css` and `site.js` into every subdirectory that contains a `.jemdoc` file,
   because those pages load both by relative path. Do not hand-sync `teaching/cs97/`.

The script `cd`s to the repo root itself. That matters: the `menu{...}` path in each
directive line resolves against the current working directory rather than the source file, so
`teaching/cs97/cs97.jemdoc` (which declares `menu{teaching/cs97/CS97_MENU}`) only builds
correctly from the root.

Preview locally — `.claude/launch.json` defines a `site` server on port 8123:

```bash
python3 -m http.server 8123
```

Notes:
- jemdoc must be on `PATH`. If it lives in a conda env, `conda activate jemdoc` first.
- jemdoc prints a wall of `SyntaxWarning: invalid escape sequence` lines under modern Python;
  the script silences them. Harmless — the output is correct.
- Builds are deterministic and idempotent: building twice with no source change leaves the
  tree clean. Unexpected HTML churn in `git diff` means something else moved.

## Presentation layer

Three files carry the design. None of them require special markup in the `.jemdoc` sources —
that is deliberate, so ordinary jemdoc content picks the styling up automatically.

- **`jemdoc.conf`** overrides a handful of jemdoc's HTML templates: an HTML5 doctype with
  `lang` and viewport meta, the webfont links, an inline no-flash theme script, and a
  `div`/`header`/`main` layout shell replacing jemdoc's `<table id="tlayout">`. Everything
  else is inherited from jemdoc's defaults.
  Editing rule: **a config block ends at the first blank line, and any line starting with `#`
  is dropped as a comment.** Keep blocks unbroken and `#`-free.
- **`jemdoc.css`** is a full rewrite of the stock stylesheet: design tokens at the top, light
  and dark palettes, sticky sidebar, and a single-column responsive layout that collapses the
  sidebar to a wrapped pill nav under 860px. `--content-w` controls the reading column; child
  elements fill it rather than setting their own `max-width`.
- **`site.js`** is progressive enhancement, safe to disable. It converts links whose text is
  bracketed (`\[PDF\]` → a pill), lifts a leading `\[Mon YYYY\]` out of a list item into a
  hanging date badge, and adds the light/dark switch.

Two consequences worth knowing: keep writing `\[PDF\]` and `\[Apr 2026\]` exactly as before
and they style themselves; and a date badge only appears when the `\[...\]` starts the list
item, so a date on a `\n` continuation line renders as plain bracketed text (talks entries use
a `--` sub-item for this reason).

## Local jemdoc quirks

The installed `jemdoc` is the **jemdoc+MathJax fork** (wsshin), not stock jemdoc 0.7.3, and it
is patched in ways that matter:

- It hardcodes `target="blank"` on every generated link, then runs its smart-quote pass over
  its own output, yielding invalid `target=&ldquo;blank&rdquo;`. The build script repairs this;
  see above. In a source file you can also prefix a link with `/` (`[/index.html text]`) to
  suppress the target, and in a `MENU` file prefix with `\` to *add* one.
- Inline `$...$` math is rewritten for MathJax, but nothing loads MathJax. If math is ever
  needed, add the CDN script to `[firstbit]` in `jemdoc.conf`.
## Page structure

Each source begins with a jemdoc directive line naming its menu file, its own output, and the
browser-tab title:

```
# jemdoc: menu{MENU}{research.html}, nofooter, title{Research · Shichang Zhang}
= Research
```

The first `=` line is the page's `<h1>`; a **non-blank line immediately after it becomes the
subtitle** (`#subtitle`), so leave a blank line there unless you want one. Without
`title{...}` the browser-tab title falls back to the `<h1>`, which is why each page sets it
explicitly.

- `MENU` — sidebar nav. **The first category is rendered as the wordmark** (styled large and
  serif by `.menu-category:first-child`), so the name sits at the top of the sidebar; the
  `Elsewhere` group below it holds CV / Scholar / GitHub links. Adding a top-level page means
  adding an entry here **and** rebuilding every page, since the menu is inlined into all of
  them. Prefix a menu link with `\` to make it open in a new tab.
- `teaching/cs97/CS97_MENU` — separate nav for the CS97 course subsite, same wordmark
  convention. Commented-out (`#`-prefixed) entries there are placeholders kept intentionally.
- `news.html` is reachable only from a link at the bottom of the "What's New" section on
  `index.jemdoc`; it is deliberately not in `MENU`.

## Content conventions

jemdoc markup used throughout:
- `== Heading`, `=== Subheading`; `- item` for bullets, `. item` for numbered lists
  (publications use `.`).
- `*text*` is bold — the author's own name is always written `*Shichang Zhang*` in
  publication lists to bold it among coauthors.
- `[url link text]` for links; `[cv/shichang_zhang_CV.pdf \[CV\]]` for a relative-path link
  whose visible text is bracketed.
- `\n` forces a line break; `\[` `\]` `\*` escape literal brackets and asterisks
  (equal-contribution markers are `\*`).
- Lines starting with `#` are jemdoc comments. There is a lot of intentionally commented-out
  prose (alternate bios, retired links) — leave it unless asked.

Recurring content edits:
- **News item** — prepend to `== What's New` in `index.jemdoc`. That section is kept short;
  older entries move to the top of the list in `news.jemdoc`. Both are reverse-chronological,
  formatted `- \[Mon YYYY\] ...` — keep the date first in the item so it renders as a badge.
- **New publication** — add to the full list in `research.jemdoc`, and, if it is a headline
  result, also to `== Selected Publications` in `index.jemdoc`. Usually paired with a news
  item. Entries are reverse-chronological and follow:
  `title \n authors \n VENUE YEAR [pdf-url \[PDF\]] [code-url \[Code\]]`.

## Asset directories

`cv/`, `slides/`, `preprints/`, `miscellaneous/`, `img/`, `research_statement/`,
`course_evaluation/`, `teaching/` hold PDFs and images referenced from the jemdoc sources.
Most references are relative paths; a few (e.g. preprint PDFs cited from the publication
lists) use absolute `https://shichangzh.github.io/...` URLs so they resolve when the entry is
copied elsewhere. Match whichever form the surrounding entries already use.
