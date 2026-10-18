/* ==========================================================================
   Site content — edit this file to update the portfolio.
   ========================================================================== */

window.SITE = {
  name: "Sayka",
  github: "saykachi",
  domain: "saykachi.com",
  timezone: "Europe/Kyiv",
  joined: "2022-06-30",
  available: true, // "Open to collabs" badges

  // Extra contact links. Empty values are hidden.
  socials: {
    telegram: "", // e.g. "https://t.me/username"
    discord: "",  // e.g. "https://discord.com/users/123456789"
    email: ""     // e.g. "hello@saykachi.com"
  },

  // Used until (or if) the GitHub API answers.
  fallback: {
    repos: 26,
    followers: 34,
    following: 241,
    stars: 12,
    langs: { TypeScript: 5, HTML: 4, JavaScript: 3, Vue: 3, Python: 2, CSS: 1, Ruby: 1 }
  },

  tools: ["Node.js", "Discord API", "REST", "TUI", "CLI", "Homebrew", "Git", "GitHub", "Vercel", "trace.moe"],

  accents: [
    { name: "sky", a: "#7aa2ff", b: "#b69cff" },
    { name: "mint", a: "#4ade9e", b: "#5ee7df" },
    { name: "peach", a: "#ff8a5b", b: "#ffc069" },
    { name: "sakura", a: "#ff7ab6", b: "#c49bff" }
  ]
};

/* GitHub language colours */
window.LANG_COLORS = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  Vue: "#41b883",
  HTML: "#e34c26",
  CSS: "#663399",
  Ruby: "#701516",
  Go: "#00add8",
  Rust: "#dea584",
  Shell: "#89e051"
};

/* cover: term | grid | chat | scan | chart | links */
window.PROJECTS = [
  {
    id: "termidb",
    name: "TermiDB",
    repo: "TermiDB",
    cat: ["tools"],
    featured: true,
    color: "#7aa2ff",
    cover: "term",
    lines: ["$ brew tap saykachi/termidb", "$ termidb", "┌ TermiDB ─────────────", "│ ● connected", "│ ▸ tables   ▸ queries", "└ monitor ▁▂▅▃▆▂▇"],
    tags: ["TUI", "Database", "Homebrew"],
    desc: {
      en: "The ultimate TUI database client & monitor. Ships with its own Homebrew tap.",
      ru: "Мощный TUI-клиент и монитор баз данных. Ставится через собственный Homebrew tap."
    },
    extra: { label: "Homebrew tap", url: "https://github.com/saykachi/homebrew-termidb" }
  },
  {
    id: "anilink",
    name: "AniLink",
    repo: "AniLink",
    lang: "TypeScript",
    cat: ["web", "tools"],
    featured: true,
    color: "#ff7ab6",
    cover: "grid",
    tags: ["Open source", "Client"],
    desc: {
      en: "A modern, incredibly fast and minimalist open-source client for AniLiberty.",
      ru: "Современный, очень быстрый и минималистичный open-source клиент для AniLiberty."
    },
    live: "https://anilink-chi.vercel.app"
  },
  {
    id: "sora",
    name: "Sora Search API",
    repo: "Sora-Search-API",
    lang: "Python",
    cat: ["api"],
    featured: true,
    color: "#facc15",
    cover: "scan",
    tags: ["REST", "trace.moe"],
    desc: {
      en: "REST API that finds an anime by a single frame, powered by trace.moe.",
      ru: "REST API для поиска аниме по одному кадру на базе trace.moe."
    }
  },
  {
    id: "kaimyla",
    name: "Kaimyla",
    repo: "Kaimyla-Code",
    lang: "TypeScript",
    cat: ["bots"],
    color: "#b69cff",
    cover: "chat",
    chat: ["/play lofi", "Now playing ♪", "/help"],
    tags: ["Bot", "Open source"],
    desc: {
      en: "Source code of the Kaimyla bot — open for anyone to use and build on.",
      ru: "Исходный код бота Kaimyla — открыт для использования и доработки."
    }
  },
  {
    id: "recognition",
    name: "Recognition Bot",
    repo: "recognition-bot-discord",
    lang: "Python",
    cat: ["bots"],
    color: "#60a5fa",
    cover: "chat",
    chat: ["voice › ****", "! swear detected", "→ kicked from voice"],
    tags: ["Discord", "Speech"],
    desc: {
      en: "Discord bot that recognises Russian swear words in voice chat and kicks the offender out.",
      ru: "Discord-бот, который распознаёт мат в голосовом чате и выкидывает нарушителя."
    }
  },
  {
    id: "animelist",
    name: "animelist",
    repo: "animelist",
    lang: "JavaScript",
    cat: ["tools"],
    color: "#4ade80",
    cover: "term",
    lines: ["$ animelist add <title>", "✓ added to MyAnimeList", "$ animelist update <title>", "✓ progress saved", "$ animelist remove <title>", "✓ removed"],
    tags: ["CLI", "MyAnimeList"],
    desc: {
      en: "CLI for adding, removing and updating anime on MyAnimeList.",
      ru: "CLI для добавления, удаления и обновления аниме на MyAnimeList."
    }
  },
  {
    id: "music",
    name: "Music Distribution",
    repo: "music-distribution-dashboard",
    lang: "TypeScript",
    cat: ["web"],
    color: "#ff8a5b",
    cover: "chart",
    tags: ["Dashboard"],
    desc: {
      en: "Dashboard for a music distribution service.",
      ru: "Дашборд для сервиса дистрибуции музыки."
    }
  },
  {
    id: "oregairu",
    name: "Oregairu Archive",
    repo: "ornjnjk",
    lang: "JavaScript",
    cat: ["web"],
    color: "#f87171",
    cover: "grid",
    tags: ["Website", "Vercel"],
    desc: {
      en: "Archive website deployed on Vercel.",
      ru: "Сайт-архив с деплоем на Vercel."
    },
    live: "https://oregairu-archive.vercel.app"
  },
  {
    id: "linkvista",
    name: "LinkVista",
    repo: "linkvista",
    lang: "Vue",
    cat: ["web"],
    color: "#34d399",
    cover: "links",
    tags: ["Vue", "Links"],
    desc: {
      en: "Links hub built with Vue.",
      ru: "Страница-хаб для ссылок на Vue."
    }
  }
];

/* Shown in "Activity" when the GitHub events API is unavailable. */
window.FEED_FALLBACK = [
  { type: "update", repo: "portfolio", date: "2026-10-17T15:11:55Z" },
  { type: "update", repo: "saykachi", date: "2026-10-10T22:42:04Z" },
  { type: "update", repo: "websitesoun", date: "2026-10-10T16:50:54Z" },
  { type: "update", repo: "AniLink", date: "2026-05-06T13:58:45Z" },
  { type: "update", repo: "AniLink-Website", date: "2026-05-06T13:51:27Z" },
  { type: "update", repo: "cfv1", date: "2026-03-18T17:32:11Z" },
  { type: "update", repo: "TermiDB", date: "2026-03-04T11:30:47Z" },
  { type: "update", repo: "homebrew-termidb", date: "2026-01-25T22:23:51Z" }
];

window.SERVICES = [
  { icon: "terminal", key: "tui" },
  { icon: "bot", key: "bots" },
  { icon: "code", key: "web" },
  { icon: "server", key: "api" }
];

window.TIMELINE = [
  { year: "2022", icon: "github", en: ["Hello, GitHub", "Created the account and pushed the first repositories."], ru: ["Привет, GitHub", "Завёл аккаунт и запушил первые репозитории."] },
  { year: "2023", icon: "bot", en: ["Bots & CLIs", "Discord bots, the Kaimyla bot and a MyAnimeList CLI."], ru: ["Боты и CLI", "Discord-боты, бот Kaimyla и CLI для MyAnimeList."] },
  { year: "2024", icon: "code", en: ["Into the web", "Landing pages and a music distribution dashboard."], ru: ["В веб", "Лендинги и дашборд для дистрибуции музыки."] },
  { year: "2025", icon: "server", en: ["APIs & Vue", "Sora Search API, LinkVista and more Vue projects."], ru: ["API и Vue", "Sora Search API, LinkVista и другие проекты на Vue."] },
  { year: "2026", icon: "terminal", en: ["TermiDB & AniLink", "A TUI database client with its own Homebrew tap and a fast AniLiberty client."], ru: ["TermiDB и AniLink", "TUI-клиент БД с собственным Homebrew tap и быстрый клиент AniLiberty."] }
];

window.I18N = {
  en: {
    "nav.home": "Home",
    "nav.projects": "Projects",
    "nav.stack": "Stack",
    "nav.journey": "Journey",
    "nav.terminal": "Terminal",
    "nav.terminalShort": "Term",
    "nav.contact": "Contact",
    "nav.settings": "Settings",
    "nav.github": "GitHub",
    "search.placeholder": "Search",
    "foot.hint": "Press",
    "ui.close": "Close",
    "ui.copied": "Link copied to clipboard",
    "ui.accentSet": "Accent: {name}",
    "ui.skySet": "Sky: {name}",
    "ui.motionOn": "Animations on",
    "ui.motionOff": "Animations off",

    "hero.build": "I build",
    "hero.roles": ["TUI tools", "Discord bots", "web apps", "REST APIs", "CLI utilities"],

    "sky.hint": "Click the sky",
    "sky.auto": "Auto",
    "sky.day": "Day",
    "sky.sunset": "Sunset",
    "sky.night": "Night",

    "home.activity": "Activity",
    "home.featured": "Featured",
    "home.about": "About",

    "feed.push": "Pushed {n} to {repo}",
    "feed.pushNoCount": "Pushed to {repo}",
    "feed.create": "Created repository {repo}",
    "feed.branch": "Created branch {ref} in {repo}",
    "feed.tag": "Tagged {ref} in {repo}",
    "feed.star": "Starred {repo}",
    "feed.fork": "Forked {repo}",
    "feed.release": "Released {ref} in {repo}",
    "feed.pr": "{action} a pull request in {repo}",
    "feed.issue": "{action} an issue in {repo}",
    "feed.comment": "Commented in {repo}",
    "feed.public": "Made {repo} public",
    "feed.delete": "Deleted {ref} in {repo}",
    "feed.update": "Updated {repo}",
    "feed.other": "Activity in {repo}",
    "feed.opened": "Opened",
    "feed.closed": "Closed",
    "feed.merged": "Merged",
    "kind.push": "Push",
    "kind.create": "Create",
    "kind.star": "Star",
    "kind.fork": "Fork",
    "kind.release": "Release",
    "kind.pr": "PR",
    "kind.issue": "Issue",
    "kind.comment": "Comment",
    "kind.public": "Public",
    "kind.delete": "Delete",
    "kind.update": "Update",
    "kind.other": "Event",
    "kind.project": "Project",
    "feed.live": "Live from GitHub",
    "feed.cached": "Recently updated repositories",
    "commits": ["commit", "commits"],

    "profile.desc": "Developer from Ukraine building TUI tools, Discord bots, web apps and REST APIs.",
    "profile.open": "Open to collabs",
    "profile.since": "Since {date}",
    "profile.repos": "public repos",
    "profile.stars": "stars",
    "profile.years": "years on GitHub",
    "profile.company": "Company",
    "profile.followers": "Followers",
    "profile.following": "Following",
    "profile.location": "Location",
    "profile.country": "Ukraine",
    "profile.time": "Local time",
    "profile.follow": "Follow",
    "profile.copy": "Copy link",

    "about.p1": "Hey! I'm Sayka — a developer from Ukraine, currently at MiraiLab Inc. I love building things that live in the terminal, bots that keep communities in order, and fast, minimal web apps.",
    "about.p2": "Lately I've been focused on TermiDB, a TUI database client & monitor, and AniLink, an open-source client for AniLiberty.",
    "about.p3": "This site is hand-made with plain HTML, CSS and JavaScript. The sky above is drawn in real time — try switching it to night.",

    "projects.eyebrow": "Selected work",
    "projects.filter": "Filter projects",
    "projects.count": ["project", "projects"],
    "cat.all": "All",
    "cat.tools": "Tools",
    "cat.web": "Web",
    "cat.bots": "Bots",
    "cat.api": "API",
    "project.open": "Open repository",
    "project.live": "Live site",
    "project.stars": "Stars",
    "project.lang": "Language",
    "project.category": "Category",
    "project.repo": "Repository",
    "project.featured": "Featured",
    "project.prev": "Previous project",
    "project.next": "Next project",
    "project.more": "More on GitHub",
    "project.moreText": "{n} public repositories",

    "stack.eyebrow": "Toolbox",
    "stack.sub": "What my repositories are made of.",
    "stack.langs": "Languages by repository",
    "stack.live": "live",
    "stack.cached": "cached",
    "stack.tools": "Toolbox",
    "stack.services": "What I do",
    "repos": ["repo", "repos"],

    "svc.tui": "TUI & CLI tools",
    "svc.bots": "Bots",
    "svc.web": "Web apps",
    "svc.api": "REST APIs",
    "svc.tuiText": "Keyboard-first tools for the terminal: database clients, monitors and handy CLIs.",
    "svc.botsText": "Discord and chat bots with moderation, automation and a bit of personality.",
    "svc.webText": "Fast, minimal interfaces with TypeScript and Vue, shipped to Vercel.",
    "svc.apiText": "Small, focused REST APIs in Python that wrap other services into something simple.",

    "journey.eyebrow": "Since 2022",
    "journey.sub": "From the first repository to TermiDB.",

    "contact.title": "Let's build something <span class=\"grad\">together.</span>",
    "contact.text": "I'm open to collaborations, freelance gigs and fun side projects. Pick any channel below — or just say hi on GitHub.",
    "contact.cta": "Say hi",
    "contact.where": "Find me",

    "settings.lang": "Language",
    "settings.accent": "Accent",
    "settings.sky": "Sky",
    "settings.motion": "Animations",

    "palette.label": "Command palette",
    "palette.placeholder": "Search projects, pages and actions…",
    "palette.move": "navigate",
    "palette.open": "open",
    "palette.views": "pages",
    "palette.groupViews": "Pages",
    "palette.groupProjects": "Projects",
    "palette.groupActions": "Actions",
    "palette.empty": "Nothing found for “{q}”",
    "act.lang": "Switch to Russian",
    "act.accent": "Next accent colour",
    "act.copy": "Copy link to this page",
    "act.github": "Open GitHub profile",
    "act.motion": "Toggle animations",
    "act.sky": "Sky: {name}",

    "term.sub": "Type <kbd>help</kbd> to get started. Try <kbd>neofetch</kbd>, <kbd>cd projects</kbd> or <kbd>sky night</kbd>.",
    "term.input": "Terminal command",
    "term.welcome": "Welcome to sayka's terminal. Type <b>help</b> to see what it can do.",
    "term.helpHead": "Available commands:",
    "term.cmd.help": "show this list",
    "term.cmd.about": "who am I",
    "term.cmd.projects": "list my projects",
    "term.cmd.open": "open a project",
    "term.cmd.cd": "go to a page",
    "term.cmd.stack": "tech I use",
    "term.cmd.contact": "how to reach me",
    "term.cmd.neofetch": "system info, but it's me",
    "term.cmd.sky": "change the sky",
    "term.cmd.theme": "change the accent colour",
    "term.cmd.lang": "switch language",
    "term.cmd.clear": "clear the screen",
    "term.notFound": "command not found: {cmd}. Try <b>help</b>.",
    "term.sudo": "Nice try. This incident will be reported.",
    "term.opening": "Opening {name}…",
    "term.openUsage": "Usage: open &lt;project&gt;. Try: {list}",
    "term.cdUsage": "Pages: {list}",
    "term.themeSet": "Accent set to {name}.",
    "term.themeUsage": "Themes: {list}",
    "term.skySet": "Sky set to {name}.",
    "term.skyUsage": "Usage: sky auto|day|sunset|night",
    "term.langSet": "Language switched to English.",
    "term.exit": "There is no escape. Type <b>help</b>.",
    "term.hire": "Great choice! Opening contacts…",
    "term.about": "Sayka — developer from Ukraine @ MiraiLab Inc. Building TUI tools, bots, web apps and REST APIs.",
    "term.uptime": "since"
  },

  ru: {
    "nav.home": "Главная",
    "nav.projects": "Проекты",
    "nav.stack": "Стек",
    "nav.journey": "Путь",
    "nav.terminal": "Терминал",
    "nav.terminalShort": "Терм",
    "nav.contact": "Контакты",
    "nav.settings": "Настройки",
    "nav.github": "GitHub",
    "search.placeholder": "Поиск",
    "foot.hint": "Нажми",
    "ui.close": "Закрыть",
    "ui.copied": "Ссылка скопирована",
    "ui.accentSet": "Акцент: {name}",
    "ui.skySet": "Небо: {name}",
    "ui.motionOn": "Анимации включены",
    "ui.motionOff": "Анимации выключены",

    "hero.build": "Я делаю",
    "hero.roles": ["TUI-утилиты", "Discord-ботов", "веб-приложения", "REST API", "CLI-инструменты"],

    "sky.hint": "Кликни по небу",
    "sky.auto": "Авто",
    "sky.day": "День",
    "sky.sunset": "Закат",
    "sky.night": "Ночь",

    "home.activity": "Активность",
    "home.featured": "Избранное",
    "home.about": "Обо мне",

    "feed.push": "Запушил {n} в {repo}",
    "feed.pushNoCount": "Запушил в {repo}",
    "feed.create": "Создал репозиторий {repo}",
    "feed.branch": "Создал ветку {ref} в {repo}",
    "feed.tag": "Добавил тег {ref} в {repo}",
    "feed.star": "Поставил звезду {repo}",
    "feed.fork": "Форкнул {repo}",
    "feed.release": "Выпустил {ref} в {repo}",
    "feed.pr": "{action} pull request в {repo}",
    "feed.issue": "{action} issue в {repo}",
    "feed.comment": "Прокомментировал в {repo}",
    "feed.public": "Открыл {repo}",
    "feed.delete": "Удалил {ref} в {repo}",
    "feed.update": "Обновил {repo}",
    "feed.other": "Активность в {repo}",
    "feed.opened": "Открыл",
    "feed.closed": "Закрыл",
    "feed.merged": "Смёржил",
    "kind.push": "Push",
    "kind.create": "Создание",
    "kind.star": "Звезда",
    "kind.fork": "Форк",
    "kind.release": "Релиз",
    "kind.pr": "PR",
    "kind.issue": "Issue",
    "kind.comment": "Коммент",
    "kind.public": "Публикация",
    "kind.delete": "Удаление",
    "kind.update": "Обновление",
    "kind.other": "Событие",
    "kind.project": "Проект",
    "feed.live": "Данные с GitHub",
    "feed.cached": "Недавно обновлённые репозитории",
    "commits": ["коммит", "коммита", "коммитов"],

    "profile.desc": "Разработчик из Украины: TUI-утилиты, Discord-боты, веб-приложения и REST API.",
    "profile.open": "Открыт к коллабам",
    "profile.since": "На GitHub с {year}",
    "profile.repos": "публичных репо",
    "profile.stars": "звёзд",
    "profile.years": "лет на GitHub",
    "profile.company": "Компания",
    "profile.followers": "Подписчики",
    "profile.following": "Подписки",
    "profile.location": "Локация",
    "profile.country": "Украина",
    "profile.time": "Местное время",
    "profile.follow": "Подписаться",
    "profile.copy": "Ссылка",

    "about.p1": "Привет! Я Sayka — разработчик из Украины, сейчас в MiraiLab Inc. Люблю делать штуки, которые живут в терминале, ботов, которые наводят порядок в сообществах, и быстрые минималистичные веб-приложения.",
    "about.p2": "Сейчас в фокусе TermiDB — TUI-клиент и монитор баз данных — и AniLink, open-source клиент для AniLiberty.",
    "about.p3": "Этот сайт сделан вручную на чистых HTML, CSS и JavaScript. Небо сверху рисуется в реальном времени — попробуй переключить на ночь.",

    "projects.eyebrow": "Избранные работы",
    "projects.filter": "Фильтр проектов",
    "projects.count": ["проект", "проекта", "проектов"],
    "cat.all": "Все",
    "cat.tools": "Утилиты",
    "cat.web": "Веб",
    "cat.bots": "Боты",
    "cat.api": "API",
    "project.open": "Открыть репозиторий",
    "project.live": "Сайт",
    "project.stars": "Звёзды",
    "project.lang": "Язык",
    "project.category": "Категория",
    "project.repo": "Репозиторий",
    "project.featured": "Избранное",
    "project.prev": "Предыдущий проект",
    "project.next": "Следующий проект",
    "project.more": "Ещё на GitHub",
    "project.moreText": "Публичных репозиториев: {n}",

    "stack.eyebrow": "Инструменты",
    "stack.sub": "Из чего сделаны мои репозитории.",
    "stack.langs": "Языки по репозиториям",
    "stack.live": "live",
    "stack.cached": "кэш",
    "stack.tools": "Инструменты",
    "stack.services": "Чем занимаюсь",
    "repos": ["репо", "репо", "репо"],

    "svc.tui": "TUI и CLI",
    "svc.bots": "Боты",
    "svc.web": "Веб-приложения",
    "svc.api": "REST API",
    "svc.tuiText": "Инструменты для терминала с управлением с клавиатуры: клиенты БД, мониторы и удобные CLI.",
    "svc.botsText": "Discord- и чат-боты: модерация, автоматизация и немного характера.",
    "svc.webText": "Быстрые минималистичные интерфейсы на TypeScript и Vue с деплоем на Vercel.",
    "svc.apiText": "Компактные REST API на Python, которые превращают сторонние сервисы в простой интерфейс.",

    "journey.eyebrow": "С 2022 года",
    "journey.sub": "От первого репозитория до TermiDB.",

    "contact.title": "Давай сделаем что-то <span class=\"grad\">вместе.</span>",
    "contact.text": "Открыт к сотрудничеству, фрилансу и интересным сайд-проектам. Пиши куда удобно — или просто загляни на GitHub.",
    "contact.cta": "Написать",
    "contact.where": "Где меня найти",

    "settings.lang": "Язык",
    "settings.accent": "Акцент",
    "settings.sky": "Небо",
    "settings.motion": "Анимации",

    "palette.label": "Командная палитра",
    "palette.placeholder": "Проекты, страницы и действия…",
    "palette.move": "выбор",
    "palette.open": "открыть",
    "palette.views": "страницы",
    "palette.groupViews": "Страницы",
    "palette.groupProjects": "Проекты",
    "palette.groupActions": "Действия",
    "palette.empty": "Ничего не найдено по «{q}»",
    "act.lang": "Switch to English",
    "act.accent": "Следующий акцентный цвет",
    "act.copy": "Скопировать ссылку на страницу",
    "act.github": "Открыть профиль на GitHub",
    "act.motion": "Вкл/выкл анимации",
    "act.sky": "Небо: {name}",

    "term.sub": "Набери <kbd>help</kbd>, чтобы начать. Попробуй <kbd>neofetch</kbd>, <kbd>cd projects</kbd> или <kbd>sky night</kbd>.",
    "term.input": "Команда терминала",
    "term.welcome": "Добро пожаловать в терминал sayka. Набери <b>help</b>, чтобы увидеть команды.",
    "term.helpHead": "Доступные команды:",
    "term.cmd.help": "список команд",
    "term.cmd.about": "кто я",
    "term.cmd.projects": "мои проекты",
    "term.cmd.open": "открыть проект",
    "term.cmd.cd": "перейти на страницу",
    "term.cmd.stack": "мой стек",
    "term.cmd.contact": "как со мной связаться",
    "term.cmd.neofetch": "инфо о системе, но это я",
    "term.cmd.sky": "сменить небо",
    "term.cmd.theme": "сменить акцентный цвет",
    "term.cmd.lang": "сменить язык",
    "term.cmd.clear": "очистить экран",
    "term.notFound": "команда не найдена: {cmd}. Попробуй <b>help</b>.",
    "term.sudo": "Хорошая попытка. Об этом инциденте будет доложено.",
    "term.opening": "Открываю {name}…",
    "term.openUsage": "Использование: open &lt;проект&gt;. Например: {list}",
    "term.cdUsage": "Страницы: {list}",
    "term.themeSet": "Акцент: {name}.",
    "term.themeUsage": "Темы: {list}",
    "term.skySet": "Небо: {name}.",
    "term.skyUsage": "Использование: sky auto|day|sunset|night",
    "term.langSet": "Язык переключён на русский.",
    "term.exit": "Выхода нет. Набери <b>help</b>.",
    "term.hire": "Отличный выбор! Открываю контакты…",
    "term.about": "Sayka — разработчик из Украины, MiraiLab Inc. Делаю TUI-утилиты, ботов, веб-приложения и REST API.",
    "term.uptime": "с"
  }
};
