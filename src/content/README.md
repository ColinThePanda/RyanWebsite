Text collections use one `.txt` or `.md` file per piece in these folders:

- `src/content/poems`
- `src/content/essays`
- `src/content/notes`
- `src/content/author-photos`
- `src/content/photos`
- `src/content/videos`
- `src/content/artist-statements`
- `src/content/albums`
- `src/content/miscellaneous`

Text file format:

Each file must start with frontmatter:

```txt
---
title: Your Title
date: 2026.03.29
summary: Optional short line for list pages
order: Optional numeric sort override
draft: false
pdfUrl: Optional /path/to/file.pdf for PDF-backed pieces
contentWarning: Optional warning text shown before opening a PDF-backed piece
---

Your writing goes here.
```

Notes:

- The filename becomes the URL slug.
- `date` is optional, but recommended.
- Newer dates appear first.
- Lower `order` values break ties on the same date.
- `draft: true` hides an entry from the generated site.

Media collections use one `_meta.json` file per folder:

- `src/content/songs/_meta.json`
- `src/content/videos/_meta.json`
- `src/content/photos/_meta.json`
- `src/content/author-photos/_meta.json`

Media metadata format:

```json
{
  "slug": {
    "title": "Title",
    "date": "2026.03.29"
  }
}
```

Albums use `src/content/albums/_meta.json`:

```json
[
  {
    "slug": "album-slug",
    "title": "Album Title",
    "date": "2026.03.29",
    "tracks": [
      {
        "file": "track-name.mp3",
        "slug": "track-slug",
        "title": "Track Title",
        "date": "2026.03.29"
      }
    ]
  }
]
```

Chapbooks use `src/content/chapbooks/_meta.json` plus PDF files in the same folder:

```json
{
  "news-gone-unreported": {
    "title": "news gone unreported",
    "date": "2026.03.29",
    "pdfUrl": "news-gone-unreported.pdf",
    "contentWarning": "Political/Protest, Graphic Violence i.e. Torture of ICE detainees"
  }
}
```

Notes:

- Put the PDF itself in `src/content/chapbooks/`.
- `pdfUrl` should be the PDF filename inside that folder.
- `contentWarning` is optional.
- If `contentWarning` is present, the chapbook index links to a warning page with `yes` to the PDF and `no` back to `/chapbooks`.
- If `contentWarning` is absent, the chapbook index links straight to the PDF in the browser.
