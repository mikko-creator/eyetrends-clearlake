# Ownership and third-party material

This repository does **not** have a single owner, and it deliberately ships no `LICENSE`
file. Most of what is here belongs to somebody else. Read this before making the repository
public, forking it, or reusing any part of it.

## What is in here, and whose it is

| material | where | whose |
|---|---|---|
| Rebuilt site markup, CSS, JS | `dist/`, `src/` | produced for the client, Eye Trends Vision & Glasses Center |
| Build system and audits | `tools/` | the author of this rebuild |
| Photography of the practice, its rooms, staff and stock | `assets/source/`, `dist/assets/img/` | **the client and/or their photographer** |
| Verbatim crawl of the original live site | `audit/raw/` (43 HTML files, 12 MB) | **Eye Trends** — their copy, their copyright notice |
| Designer brand wordmarks | `assets/source/*-{ray-ban,oliver-peoples,lindberg,persol,tom-ford,maui-jim,costa}.*` | **registered trademarks of those companies** |
| Supplied hero photograph | `assets/supplied/hero-eyewear-source.jpg` | a Pexels stock photograph — see below |
| AI-generated imagery | `assets/generated/`, `assets/generated-rt/` | generated for this project; labelled `data-generated` in the markup |
| Dr. Jerry Hyder's portrait | `assets/img/dr-hyder-cutout.png` | **the client's own photograph of a real person**, background removed; labelled `data-cutout`. Not a generated likeness |

## Things to settle before this repository is public

1. **The crawl of the original site.** `audit/raw/` is a complete copy of
   eyetrendsclearlake.com as it stood, including its own "all rights reserved" footer. It is
   kept because the build genuinely reads it — without it the build emits zero pages — but
   publishing it republishes the client's site wholesale. That is fine if you are the client
   or acting for them. It is not fine otherwise.

2. **Designer trademarks.** Seven brand wordmarks are included because the practice stocks
   those frames. Naming the brands you carry is ordinary retail use; redistributing the logo
   files in a public code repository is a different act, and the brands' own guidelines
   govern it.

3. **The hero photograph.** `hero-eyewear-source.jpg` came from Pexels. The Pexels licence
   permits commercial use without attribution, but the photographer's name is in the original
   filename and attribution is still the decent thing. The current `alt` text describes the
   scene and claims nothing about the practice.

4. **Patient reviews.** `dist/reviews/` republishes around twenty Google reviews with the
   reviewers' names, in a healthcare context. They were already public on Google, and they
   are reproduced verbatim from the client's own site — but a public repo is a second
   publication of named individuals' health-adjacent comments. Worth a moment's thought.

5. **Excluded deliberately.** The previous CMS vendor's front-end code (`assets/js/`,
   `audit/css/`) and 4.8 MB of Google Fonts binaries (`assets/fonts/`) are **gitignored**.
   Nothing references them, and neither is ours to redistribute. They remain on disk; they
   are simply not committed.

## No warranty, no licence grant

Nothing here grants a licence to any of the third-party material above. The rebuild work
itself is the client's to license as they see fit.
