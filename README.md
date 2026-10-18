# sayka. — portfolio

Personal site of [@saykachi](https://github.com/saykachi), live at **[saykachi.com](https://saykachi.com)**.
An app-style dark dashboard with a hand-drawn, real-time animated sky. Plain HTML/CSS/JS: no build step, no dependencies.

## Features

- **Animated sky banner**: procedural anime-style clouds, a swaying tree, birds, stars, fireflies and shooting stars on a `<canvas>`, with mouse parallax. Day, sunset and night modes, or *auto* by the visitor's local time. Click the sky to release birds (or a shooting star at night).
- **App shell**: sidebar with a sliding active indicator, breadcrumbs, a mobile tab bar, and hash routing (`#/projects`, `#/stack`, …; `#/projects/termidb` opens a project directly).
- **Live GitHub data**: activity feed, repos, followers, stars and languages, with an offline fallback.
- **Command palette** (`⌘K` / `Ctrl K` / `/`): search projects, pages and actions.
- **Project drawer** with prev/next (← →), animated project covers and filters.
- **Interactive terminal**: `help`, `neofetch`, `open termidb`, `cd projects`, `sky night`, `theme mint`…
- **Settings**: EN/RU, 4 accent colours, sky mode and an animations toggle, all remembered between visits.
- Keyboard shortcuts `1`–`6` for pages; responsive down to 360px; respects `prefers-reduced-motion`.

## Editing content

Everything lives in [`js/data.js`](js/data.js):

| What | Where |
| --- | --- |
| Telegram / Discord / email | `SITE.socials` (empty values are hidden) |
| "Open to collabs" badges | `SITE.available` |
| Projects | `PROJECTS` |
| Timeline | `TIMELINE` |
| Texts in both languages | `I18N.en` / `I18N.ru` |
| Toolbox chips | `SITE.tools` |

The sky lives in [`js/sky.js`](js/sky.js); its palettes are at the top of that file.

## Run locally

```bash
npx serve .
# or
python3 -m http.server 8080
```

## Deploy

GitHub Pages from `main` / root. The custom domain is set by the `CNAME` file.

---

### По-русски

Портфолио на чистом HTML/CSS/JS, без сборки. Весь контент (проекты, ссылки, тексты на двух языках) лежит в `js/data.js`, небо — в `js/sky.js`.
Сайт публикуется через GitHub Pages из ветки `main` на домене из файла `CNAME`.
