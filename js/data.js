/* ==========================================================================
   Site content — edit this file to update the portfolio.
   ========================================================================== */

window.SITE = {
  name: "Sayka",
  github: "saykachi",
  timezone: "Europe/Kyiv",
  since: 2022,
  available: true, // shows the "Open to collabs" badge on the avatar

  // Extra contact links. Empty values are hidden.
  socials: {
    telegram: "", // e.g. "https://t.me/username"
    discord: "",  // e.g. "https://discord.com/users/123456789"
    email: ""     // e.g. "hello@example.com"
  },

  // Fallback numbers if the GitHub API is unreachable.
  stats: { repos: 26, followers: 34 },

  stack: [
    ["TypeScript", "JavaScript", "Python", "Vue", "Node.js", "HTML", "CSS"],
    ["Discord API", "REST", "TUI", "CLI", "Homebrew", "Ruby", "Git", "Vercel"]
  ],

  accents: [
    { name: "periwinkle", a: "#7c8cff", b: "#c08cff" },
    { name: "mint", a: "#4ade9e", b: "#5ee7df" },
    { name: "coral", a: "#ff7a59", b: "#ffb86b" },
    { name: "sakura", a: "#ff6fae", b: "#c38bff" }
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
  Ruby: "#701516"
};

/* visual: term | grid | chat | scan | chart | links */
window.PROJECTS = [
  {
    id: "termidb",
    name: "TermiDB",
    repo: "TermiDB",
    cat: ["tools"],
    featured: true,
    visual: "term",
    lines: ["$ brew tap saykachi/termidb", "$ termidb", "┌ TermiDB ─────────────", "│ ● connected", "│ ▸ tables   ▸ queries", "└ monitor ▁▂▅▃▆▂▇"],
    tags: ["TUI", "Database", "Homebrew"],
    desc: {
      en: "The ultimate TUI database client & monitor. Ships with its own Homebrew tap.",
      ru: "Мощный TUI-клиент и монитор баз данных. Ставится через собственный Homebrew tap."
    },
    extra: { label: "brew tap", url: "https://github.com/saykachi/homebrew-termidb" }
  },
  {
    id: "anilink",
    name: "AniLink",
    repo: "AniLink",
    lang: "TypeScript",
    cat: ["web", "tools"],
    featured: true,
    visual: "grid",
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
    visual: "scan",
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
    visual: "chat",
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
    visual: "chat",
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
    visual: "term",
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
    visual: "chart",
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
    visual: "grid",
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
    visual: "links",
    tags: ["Vue", "Links"],
    desc: {
      en: "Links hub built with Vue.",
      ru: "Страница-хаб для ссылок на Vue."
    }
  }
];

window.TIMELINE = [
  { year: "2022", en: ["Hello, GitHub", "Created the account and pushed the first repositories."], ru: ["Привет, GitHub", "Завёл аккаунт и запушил первые репозитории."] },
  { year: "2023", en: ["Bots & CLIs", "Discord bots, the Kaimyla bot and a MyAnimeList CLI."], ru: ["Боты и CLI", "Discord-боты, бот Kaimyla и CLI для MyAnimeList."] },
  { year: "2024", en: ["Into the web", "Landing pages and a music distribution dashboard."], ru: ["В веб", "Лендинги и дашборд для дистрибуции музыки."] },
  { year: "2025", en: ["APIs & Vue", "Sora Search API, LinkVista and more Vue projects."], ru: ["API и Vue", "Sora Search API, LinkVista и другие проекты на Vue."] },
  { year: "2026", en: ["TermiDB & AniLink", "A TUI database client with its own Homebrew tap and a fast AniLiberty client."], ru: ["TermiDB и AniLink", "TUI-клиент БД с собственным Homebrew tap и быстрый клиент AniLiberty."] }
];

window.I18N = {
  en: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.works": "Works",
    "nav.contact": "Contact",
    "nav.talk": "Let's talk",
    "ui.accent": "Change accent colour",
    "ui.lang": "Switch language",
    "ui.menu": "Toggle menu",
    "ui.copy": "Copy link to this page",
    "ui.copied": "Link copied to clipboard",
    "ui.accentSet": "Accent: {name}",

    "hero.kicker": "Developer",
    "hero.status": "Open to collabs",
    "hero.build": "I build",
    "hero.roles": ["TUI tools", "Discord bots", "web apps", "REST APIs", "CLI utilities"],
    "hero.location": "Ukraine",
    "marquee.lead": "Latest work and <b>featured</b>",

    "cred.kicker": "More about me",
    "cred.title": "Credentials",
    "proj.kicker": "Showcase",
    "proj.title": "Projects",
    "proj.bg": "MY WORKS",
    "stack.kicker": "Toolbox",
    "stack.title": "Tech Stack",
    "services.kicker": "Specialization",
    "services.title": "Services Offering",
    "profiles.kicker": "Stay with me",
    "profiles.title": "Profiles",
    "stats.years": "Years on<br>GitHub",
    "stats.repos": "Public<br>repos",
    "stats.followers": "GitHub<br>followers",
    "cta.title": "Let's<br>work <span class=\"grad\">together.</span>",

    "svc.tui": "TUI & CLI tools",
    "svc.bots": "Bots",
    "svc.web": "Web apps",
    "svc.api": "REST APIs",
    "svc.tuiText": "Keyboard-first tools for the terminal: database clients, monitors and handy CLIs.",
    "svc.botsText": "Discord and chat bots with moderation, automation and a bit of personality.",
    "svc.webText": "Fast, minimal interfaces with TypeScript and Vue, shipped to Vercel.",
    "svc.apiText": "Small, focused REST APIs in Python that wrap other services into something simple.",

    "about.kicker": "About",
    "about.title": "Code that feels <em>good</em> to use.",
    "about.bioKicker": "Hello there",
    "about.p1": "Hey! I'm Sayka — a developer from Ukraine, currently at MiraiLab Inc. I love building things that live in the terminal, bots that keep communities in order, and fast, minimal web apps.",
    "about.p2": "Lately I've been focused on TermiDB, a TUI database client & monitor, and AniLink, an open-source client for AniLiberty. Every project is a chance to make something a little faster and a little nicer to use.",
    "about.github": "Follow on GitHub",
    "about.stackKicker": "Stack",
    "about.stackTitle": "Languages & tools I reach for",
    "about.journeyKicker": "Journey",
    "about.journeyTitle": "The path so far",

    "works.kicker": "Selected works",
    "works.title": "Things I've <em>built</em>.",
    "works.filter": "Filter projects",
    "works.all": "All",
    "works.tools": "Tools",
    "works.web": "Web",
    "works.bots": "Bots",
    "works.api": "API",
    "works.code": "Code",
    "works.live": "Live",
    "works.moreTitle": "More on GitHub",
    "works.moreText": "{n} public repositories and counting.",
    "works.featured": "Featured",

    "contact.kicker": "Contact",
    "contact.title": "Have an idea?<br>Let's make it <span class=\"grad\">real.</span>",
    "contact.text": "I'm open to collaborations, freelance gigs and fun side projects. Drop me a line on any of the platforms below.",
    "contact.btn": "Say hi",
    "contact.ring": "OPEN TO NEW PROJECTS • LET'S TALK • ",
    "contact.time": "Local time",
    "contact.based": "Based in",

    "footer.made": "Designed & built from scratch",
    "footer.top": "Back to top",

    "term.hint": "press <kbd>/</kbd> to focus",
    "term.input": "Terminal command",
    "term.welcome": "Welcome to sayka's terminal. Type <b>help</b> to see what it can do.",
    "term.helpHead": "Available commands:",
    "term.cmd.help": "show this list",
    "term.cmd.about": "who am I",
    "term.cmd.projects": "list my projects",
    "term.cmd.open": "open a project on GitHub",
    "term.cmd.stack": "tech I use",
    "term.cmd.contact": "how to reach me",
    "term.cmd.neofetch": "system info, but it's me",
    "term.cmd.theme": "change the accent colour",
    "term.cmd.lang": "switch language",
    "term.cmd.clear": "clear the screen",
    "term.notFound": "command not found: {cmd}. Try <b>help</b>.",
    "term.sudo": "Nice try. This incident will be reported.",
    "term.opening": "Opening {name}…",
    "term.openUsage": "Usage: open &lt;project&gt;. Try: {list}",
    "term.themeSet": "Accent set to {name}.",
    "term.themeUsage": "Themes: {list}",
    "term.langSet": "Language switched to English.",
    "term.exit": "There is no escape. Type <b>help</b>.",
    "term.hire": "Great choice! Scrolling to contacts…",
    "term.about": "Sayka — developer from Ukraine @ MiraiLab Inc. Building TUI tools, bots, web apps and REST APIs.",
    "term.contact": "GitHub: {gh}",
    "term.uptime": "since"
  },

  ru: {
    "nav.home": "Главная",
    "nav.about": "Обо мне",
    "nav.works": "Работы",
    "nav.contact": "Контакты",
    "nav.talk": "Связаться",
    "ui.accent": "Сменить акцентный цвет",
    "ui.lang": "Сменить язык",
    "ui.menu": "Открыть меню",
    "ui.copy": "Скопировать ссылку на страницу",
    "ui.copied": "Ссылка скопирована",
    "ui.accentSet": "Акцент: {name}",

    "hero.kicker": "Разработчик",
    "hero.status": "Открыт к коллабам",
    "hero.build": "Я делаю",
    "hero.roles": ["TUI-утилиты", "Discord-ботов", "веб-приложения", "REST API", "CLI-инструменты"],
    "hero.location": "Украина",
    "marquee.lead": "Свежие работы и <b>избранное</b>",

    "cred.kicker": "Больше обо мне",
    "cred.title": "Обо мне",
    "proj.kicker": "Витрина",
    "proj.title": "Проекты",
    "proj.bg": "РАБОТЫ",
    "stack.kicker": "Инструменты",
    "stack.title": "Стек",
    "services.kicker": "Специализация",
    "services.title": "Чем занимаюсь",
    "profiles.kicker": "Будем на связи",
    "profiles.title": "Профили",
    "stats.years": "Лет на<br>GitHub",
    "stats.repos": "Публичных<br>репо",
    "stats.followers": "Подписчиков<br>на GitHub",
    "cta.title": "Давай<br>работать <span class=\"grad\">вместе.</span>",

    "svc.tui": "TUI и CLI",
    "svc.bots": "Боты",
    "svc.web": "Веб-приложения",
    "svc.api": "REST API",
    "svc.tuiText": "Инструменты для терминала с управлением с клавиатуры: клиенты БД, мониторы и удобные CLI.",
    "svc.botsText": "Discord- и чат-боты: модерация, автоматизация и немного характера.",
    "svc.webText": "Быстрые минималистичные интерфейсы на TypeScript и Vue с деплоем на Vercel.",
    "svc.apiText": "Компактные REST API на Python, которые превращают сторонние сервисы в простой интерфейс.",

    "about.kicker": "Обо мне",
    "about.title": "Код, которым <em>приятно</em> пользоваться.",
    "about.bioKicker": "Привет",
    "about.p1": "Я Sayka — разработчик из Украины, сейчас в MiraiLab Inc. Люблю делать штуки, которые живут в терминале, ботов, которые наводят порядок в сообществах, и быстрые минималистичные веб-приложения.",
    "about.p2": "Сейчас в фокусе TermiDB — TUI-клиент и монитор баз данных — и AniLink, open-source клиент для AniLiberty. Каждый проект — шанс сделать что-то чуть быстрее и чуть удобнее.",
    "about.github": "Подписаться на GitHub",
    "about.stackKicker": "Стек",
    "about.stackTitle": "Языки и инструменты, с которыми работаю",
    "about.journeyKicker": "Путь",
    "about.journeyTitle": "Как всё шло",

    "works.kicker": "Избранные работы",
    "works.title": "Что я <em>сделал</em>.",
    "works.filter": "Фильтр проектов",
    "works.all": "Все",
    "works.tools": "Утилиты",
    "works.web": "Веб",
    "works.bots": "Боты",
    "works.api": "API",
    "works.code": "Код",
    "works.live": "Сайт",
    "works.moreTitle": "Ещё на GitHub",
    "works.moreText": "{n} публичных репозиториев — и это не предел.",
    "works.featured": "Избранное",

    "contact.kicker": "Контакты",
    "contact.title": "Есть идея?<br>Давай сделаем её <span class=\"grad\">реальной.</span>",
    "contact.text": "Открыт к сотрудничеству, фрилансу и интересным сайд-проектам. Пиши на любой из площадок ниже.",
    "contact.btn": "Написать",
    "contact.ring": "ОТКРЫТ К ПРОЕКТАМ • НАПИШИ МНЕ • ",
    "contact.time": "Местное время",
    "contact.based": "Нахожусь в",

    "footer.made": "Дизайн и код с нуля",
    "footer.top": "Наверх",

    "term.hint": "нажми <kbd>/</kbd> для фокуса",
    "term.input": "Команда терминала",
    "term.welcome": "Добро пожаловать в терминал sayka. Набери <b>help</b>, чтобы увидеть команды.",
    "term.helpHead": "Доступные команды:",
    "term.cmd.help": "список команд",
    "term.cmd.about": "кто я",
    "term.cmd.projects": "мои проекты",
    "term.cmd.open": "открыть проект на GitHub",
    "term.cmd.stack": "мой стек",
    "term.cmd.contact": "как со мной связаться",
    "term.cmd.neofetch": "инфо о системе, но это я",
    "term.cmd.theme": "сменить акцентный цвет",
    "term.cmd.lang": "сменить язык",
    "term.cmd.clear": "очистить экран",
    "term.notFound": "команда не найдена: {cmd}. Попробуй <b>help</b>.",
    "term.sudo": "Хорошая попытка. Об этом инциденте будет доложено.",
    "term.opening": "Открываю {name}…",
    "term.openUsage": "Использование: open &lt;проект&gt;. Например: {list}",
    "term.themeSet": "Акцент: {name}.",
    "term.themeUsage": "Темы: {list}",
    "term.langSet": "Язык переключён на русский.",
    "term.exit": "Выхода нет. Набери <b>help</b>.",
    "term.hire": "Отличный выбор! Листаю к контактам…",
    "term.about": "Sayka — разработчик из Украины, MiraiLab Inc. Делаю TUI-утилиты, ботов, веб-приложения и REST API.",
    "term.contact": "GitHub: {gh}",
    "term.uptime": "с"
  }
};
