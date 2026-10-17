# sayka. — portfolio

Animated, interactive bento-grid portfolio for [@saykachi](https://github.com/saykachi).
Plain HTML/CSS/JS: no build step, no dependencies.

## Features

- Bento-grid hero with a mouse-following spotlight, glowing borders and 3D tilt on cards
- Preloader, word-by-word heading reveals, scroll-triggered animations
- Custom cursor with contextual labels, magnetic buttons
- Interactive terminal: `help`, `projects`, `open <name>`, `neofetch`, `theme <name>`, `lang`… (press <kbd>/</kbd> anywhere to focus it)
- Live GitHub stats (repos, followers, stars) with count-up animation and offline fallback
- Project filters with View Transitions
- EN / RU switch and 4 accent colours, both remembered between visits
- Responsive down to 360px, respects `prefers-reduced-motion`

## Editing content

Everything you'd want to change lives in [`js/data.js`](js/data.js):

| What | Where |
| --- | --- |
| Telegram / Discord / email links | `SITE.socials` (empty values are hidden) |
| "Open to collabs" badge | `SITE.available` |
| Projects | `PROJECTS` |
| Timeline | `TIMELINE` |
| Texts in both languages | `I18N.en` / `I18N.ru` |
| Stack pills | `SITE.stack` |

## Run locally

```bash
npx serve .
# or
python3 -m http.server 8080
```

## Deploy to GitHub Pages

1. Merge into `main`.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site will be live at `https://saykachi.github.io/portfolio/`.

---

### По-русски

Портфолио на чистом HTML/CSS/JS, без сборки. Весь контент (проекты, ссылки, тексты на двух языках) — в `js/data.js`.
Чтобы опубликовать: смёржить в `main`, затем **Settings → Pages → Deploy from a branch → main / root**.
