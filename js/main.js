(() => {
  "use strict";

  const { SITE, PROJECTS, TIMELINE, SERVICES, FEED_FALLBACK, I18N, LANG_COLORS, Sky } = window;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const sysReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMac = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const icon = (id, cls) => `<svg${cls ? ` class="${cls}"` : ""}><use href="#i-${id}"/></svg>`;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // Storage can throw in private mode / sandboxed frames.
  const store = (area) => ({
    get(k) { try { return window[area].getItem(k); } catch { return null; } },
    set(k, v) { try { window[area].setItem(k, v); } catch { /* ignore */ } }
  });
  const local = store("localStorage");
  const session = store("sessionStorage");

  const VIEWS = ["home", "projects", "stack", "journey", "terminal", "contact"];
  const SKY_MODES = ["auto", "day", "sunset", "night"];
  const CAT_ICON = { tools: "terminal", web: "code", bots: "bot", api: "server" };
  const VIEW_ICON = { home: "home", projects: "grid", stack: "layers", journey: "route", terminal: "terminal", contact: "mail" };
  const SKY_ICON = { auto: "auto", day: "sun", sunset: "sunset", night: "moon" };

  /* ======================================================================
     State
     ====================================================================== */
  let lang = local.get("lang") || ((navigator.language || "").toLowerCase().startsWith("ru") ? "ru" : "en");
  if (!I18N[lang]) lang = "en";

  const yearsSince = (date) => Math.max(1, Math.floor((Date.now() - new Date(date)) / (365.25 * 864e5)));
  const state = {
    view: null,
    filter: "all",
    sky: SKY_MODES.includes(local.get("sky")) ? local.get("sky") : "auto",
    motion: local.get("motion") !== "off",
    accent: Math.max(0, SITE.accents.findIndex((a) => a.name === local.get("accent"))),
    gh: {
      live: false,
      loaded: false,
      repos: SITE.fallback.repos,
      followers: SITE.fallback.followers,
      following: SITE.fallback.following,
      stars: SITE.fallback.stars,
      years: yearsSince(SITE.joined),
      langs: { ...SITE.fallback.langs },
      starsMap: null,
      events: null
    }
  };
  const motionOK = () => state.motion && !sysReduced;

  /* ======================================================================
     i18n
     ====================================================================== */
  function t(key, vars) {
    let s = I18N[lang][key] ?? I18N.en[key] ?? key;
    if (vars && typeof s === "string") s = s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
    return s;
  }

  function plural(n, forms) {
    if (forms.length === 3) {
      const a = n % 10, b = n % 100;
      return forms[a === 1 && b !== 11 ? 0 : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 1 : 2];
    }
    return n === 1 ? forms[0] : forms[1];
  }

  const num = (n) => Number(n).toLocaleString(lang === "ru" ? "ru-RU" : "en-US");

  function relTime(date) {
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
    const diff = (new Date(date) - Date.now()) / 1000;
    const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
    for (const [unit, sec] of units) {
      if (Math.abs(diff) >= sec || unit === "minute") return rtf.format(Math.round(diff / sec), unit);
    }
    return "";
  }

  function applyStatic() {
    root.lang = lang;
    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":");
        el.setAttribute(attr, t(key));
      });
    });
    $$("[data-tip-key]").forEach((el) => { el.dataset.tip = t(el.dataset.tipKey); });
    const joined = new Date(SITE.joined);
    $("#sinceBadge").textContent = t("profile.since", {
      date: new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(joined),
      year: joined.getFullYear()
    });
  }

  function setLang(next) {
    if (!I18N[next] || next === lang) return;
    lang = next;
    local.set("lang", lang);
    applyStatic();
    renderDynamic();
  }

  /* ======================================================================
     Toast
     ====================================================================== */
  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2200);
  }

  async function copyLink() {
    const url = location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.append(ta);
      ta.select();
      try { document.execCommand("copy"); } catch { /* ignore */ }
      ta.remove();
    }
    toast(t("ui.copied"));
  }

  /* ======================================================================
     Preferences: accent, sky, motion
     ====================================================================== */
  function setAccent(i, announce) {
    state.accent = (i + SITE.accents.length) % SITE.accents.length;
    const a = SITE.accents[state.accent];
    root.style.setProperty("--accent", a.a);
    root.style.setProperty("--accent-2", a.b);
    local.set("accent", a.name);
    $$(".swatch").forEach((s, idx) => s.setAttribute("aria-checked", String(idx === state.accent)));
    if (announce) toast(t("ui.accentSet", { name: a.name }));
  }

  let sky = null;
  const resolveSky = (m) => (m === "auto" ? Sky.autoMode() : m);

  function setSky(mode, announce) {
    if (!SKY_MODES.includes(mode)) return;
    state.sky = mode;
    local.set("sky", mode);
    if (sky) sky.setMode(resolveSky(mode));
    $$("[data-sky]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.sky === mode)));
    if (announce) toast(t("ui.skySet", { name: t(`sky.${mode}`) }));
  }

  function setMotion(on, announce) {
    state.motion = on;
    local.set("motion", on ? "on" : "off");
    root.classList.toggle("reduce-motion", !on);
    $("#setMotion").setAttribute("aria-checked", String(on));
    if (sky) sky.setReduced(!motionOK());
    startTyped();
    if (announce) toast(t(on ? "ui.motionOn" : "ui.motionOff"));
  }

  /* ======================================================================
     Pointer: ambient light + spotlight cards
     ====================================================================== */
  function initPointer() {
    let last = null;
    let raf = 0;
    const frame = () => {
      raf = 0;
      root.style.setProperty("--ax", `${last.clientX}px`);
      root.style.setProperty("--ay", `${last.clientY}px`);
      const spot = last.target instanceof Element ? last.target.closest("[data-spot]") : null;
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${last.clientX - r.left}px`);
        spot.style.setProperty("--my", `${last.clientY - r.top}px`);
      }
    };
    addEventListener("pointermove", (e) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(frame);
    }, { passive: true });
  }

  /* ======================================================================
     Counters
     ====================================================================== */
  const counted = new WeakSet();
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      counted.add(e.target);
      animateCount(e.target);
      countIO.unobserve(e.target);
    });
  }, { threshold: 0.3 });

  function animateCount(el) {
    const to = Number(state.gh[el.dataset.count]) || 0;
    const from = Number(el.dataset.value) || 0;
    el.dataset.value = to;
    if (!motionOK() || from === to) { el.textContent = num(to); return; }
    const start = performance.now();
    const dur = 1400;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = num(Math.round(from + (to - from) * e));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function initCounts() {
    $$("[data-count]").forEach((el) => {
      el.dataset.value = "0";
      el.textContent = "0";
      countIO.observe(el);
    });
  }

  const refreshCounts = () => $$("[data-count]").forEach((el) => { if (counted.has(el)) animateCount(el); });

  /* ======================================================================
     Tabs
     ====================================================================== */
  function makeTabs(el, onSelect) {
    const ind = $(".tabs__ind", el);
    const btns = $$('[role="tab"]', el);
    const current = () => btns.find((b) => b.getAttribute("aria-selected") === "true") || btns[0];
    const sync = () => {
      const b = current();
      if (!b || !b.offsetWidth) return;
      ind.style.setProperty("--x", `${b.offsetLeft}px`);
      ind.style.setProperty("--w", `${b.offsetWidth}px`);
    };
    const select = (b, focus) => {
      btns.forEach((x) => {
        const on = x === b;
        x.setAttribute("aria-selected", String(on));
        x.tabIndex = on ? 0 : -1;
      });
      sync();
      if (focus) b.focus();
      onSelect(b.dataset.tab);
    };
    btns.forEach((b) => b.addEventListener("click", () => {
      if (b.getAttribute("aria-selected") !== "true") select(b);
    }));
    el.addEventListener("keydown", (e) => {
      const i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      const n = { ArrowRight: (i + 1) % btns.length, ArrowLeft: (i - 1 + btns.length) % btns.length, Home: 0, End: btns.length - 1 }[e.key];
      if (n === undefined) return;
      e.preventDefault();
      select(btns[n], true);
    });
    return { sync, select };
  }

  /* ======================================================================
     Covers (small animated scenes for projects)
     ====================================================================== */
  const CHART = [42, 66, 50, 80, 58, 92, 70, 86, 62, 96, 74];

  function coverHTML(p) {
    let inner = "";
    switch (p.cover) {
      case "term":
        inner = `<span class="v-term">${p.lines.map((l, i) => `<span class="ln${l.startsWith("$") ? " cmd" : ""}" style="--i:${i}">${esc(l)}</span>`).join("")}</span>`;
        break;
      case "grid":
        inner = `<span class="v-grid">${Array.from({ length: 8 }, (_, i) => `<i style="--i:${i}"${i === 1 ? ' class="a"' : i === 6 ? ' class="b"' : ""}></i>`).join("")}</span>`;
        break;
      case "chat":
        inner = `<span class="v-chat">${p.chat.map((m, i) => `<span style="--i:${i}">${esc(m)}</span>`).join("")}<span class="typing" style="--i:${p.chat.length}"><b></b><b></b><b></b></span></span>`;
        break;
      case "scan":
        inner = `<span class="v-scan"><span class="v-scan__frame"></span><span class="v-scan__json">{<br>&nbsp;"anilist": <u>21</u>,<br>&nbsp;"episode": <u>12</u>,<br>&nbsp;"from": <s>"04:21"</s>,<br>&nbsp;"similarity": <u>0.97</u><br>}</span></span>`;
        break;
      case "chart":
        inner = `<span class="v-chart">${CHART.map((h, i) => `<i style="--i:${i};--h:${h}%"></i>`).join("")}</span>`;
        break;
      case "links":
        inner = `<span class="v-links"><span class="ava"></span>${[0, 1, 2, 3].map((i) => `<span style="--i:${i}"></span>`).join("")}</span>`;
        break;
      default:
        break;
    }
    return `<span class="cover" style="--c:${p.color}">${inner}</span>`;
  }

  const projectStars = (p) => (state.gh.starsMap ? state.gh.starsMap[p.repo.toLowerCase()] : undefined);
  const langHTML = (p) => `<span class="lang"><i style="--c:${p.lang ? LANG_COLORS[p.lang] || p.color : p.color}"></i>${esc(p.lang || p.tags[0])}</span>`;
  const starsHTML = (p) => {
    const n = projectStars(p);
    return `<span class="stars" data-stars="${esc(p.repo)}"${n == null ? " hidden" : ""}>${icon("star")}<b>${n ?? 0}</b></span>`;
  };

  /* ======================================================================
     Home: feed, featured
     ====================================================================== */
  const FEED_KIND = {
    push: ["commit", "var(--accent)", "push"],
    update: ["commit", "var(--accent)", "update"],
    create: ["plus", "var(--green)", "create"],
    branch: ["fork", "var(--green)", "create"],
    tag: ["tag", "var(--pink)", "create"],
    star: ["star", "var(--yellow)", "star"],
    fork: ["fork", "var(--blue)", "fork"],
    release: ["tag", "var(--pink)", "release"],
    pr: ["pr", "var(--violet)", "pr"],
    issue: ["issue", "var(--green)", "issue"],
    comment: ["chat", "var(--text-2)", "comment"],
    public: ["eye", "var(--blue)", "public"],
    delete: ["minus", "var(--red)", "delete"],
    other: ["sparkle", "var(--text-2)", "other"]
  };

  function mapEvent(ev) {
    const full = ev.repo?.name || "";
    const repo = full.startsWith(`${SITE.github}/`) ? full.slice(SITE.github.length + 1) : full;
    const p = ev.payload || {};
    const base = { repo, date: ev.created_at, url: `https://github.com/${full}` };
    switch (ev.type) {
      case "PushEvent": {
        const n = p.distinct_size ?? p.size ?? (Array.isArray(p.commits) ? p.commits.length : null);
        return { ...base, type: "push", n: n || null, url: `https://github.com/${full}/commits` };
      }
      case "CreateEvent":
        return { ...base, type: p.ref_type === "repository" ? "create" : p.ref_type === "tag" ? "tag" : "branch", ref: p.ref };
      case "WatchEvent": return { ...base, type: "star" };
      case "ForkEvent": return { ...base, type: "fork", url: p.forkee?.html_url || base.url };
      case "ReleaseEvent": return { ...base, type: "release", ref: p.release?.tag_name, url: p.release?.html_url || base.url };
      case "PullRequestEvent":
        return { ...base, type: "pr", action: p.pull_request?.merged ? "merged" : p.action === "closed" ? "closed" : "opened", url: p.pull_request?.html_url || base.url };
      case "IssuesEvent": return { ...base, type: "issue", action: p.action === "closed" ? "closed" : "opened", url: p.issue?.html_url || base.url };
      case "IssueCommentEvent":
      case "CommitCommentEvent":
      case "PullRequestReviewCommentEvent":
        return { ...base, type: "comment", url: p.comment?.html_url || base.url };
      case "PublicEvent": return { ...base, type: "public" };
      case "DeleteEvent": return { ...base, type: "delete", ref: p.ref };
      default: return { ...base, type: "other" };
    }
  }

  // Collapse consecutive pushes to the same repository.
  function mergeEvents(list) {
    const out = [];
    for (const ev of list) {
      const prev = out[out.length - 1];
      if (prev && ev.type === "push" && prev.type === "push" && prev.repo === ev.repo) {
        prev.n = prev.n && ev.n ? prev.n + ev.n : prev.n || ev.n;
        continue;
      }
      out.push({ ...ev });
    }
    return out;
  }

  function feedText(it) {
    const repo = `<b>${esc(it.repo)}</b>`;
    const ref = esc(it.ref || "");
    switch (it.type) {
      case "push":
        return it.n ? t("feed.push", { n: `${it.n} ${plural(it.n, t("commits"))}`, repo }) : t("feed.pushNoCount", { repo });
      case "pr":
      case "issue":
        return t(`feed.${it.type}`, { action: t(`feed.${it.action}`), repo });
      default:
        return t(`feed.${it.type}`, { repo, ref });
    }
  }

  function renderFeed() {
    const list = $("#feed");
    const note = $("#feedNote");
    if (!state.gh.loaded) {
      list.innerHTML = Array.from({ length: 5 }, () => '<li class="skeleton"></li>').join("");
      note.textContent = "";
      return;
    }
    const live = Array.isArray(state.gh.events) && state.gh.events.length > 0;
    const items = (live ? state.gh.events : FEED_FALLBACK.map((f) => ({ ...f, url: `https://github.com/${SITE.github}/${f.repo}` }))).slice(0, 8);
    list.className = "feed stagger";
    list.innerHTML = items.map((it, i) => {
      const [ic, color, kind] = FEED_KIND[it.type] || FEED_KIND.other;
      return `<li style="--i:${i}"><a class="row" data-spot href="${esc(it.url)}" target="_blank" rel="noopener">
        <span class="row__icon" style="--c:${color}">${icon(ic)}</span>
        <span class="row__text">${feedText(it)}</span>
        <span class="row__meta">${t(`kind.${kind}`)} • ${relTime(it.date)}</span>
        ${icon("external", "row__go")}
      </a></li>`;
    }).join("");
    note.textContent = live ? t("feed.live") : t("feed.cached");
    note.classList.toggle("is-live", live);
  }

  function renderFeatured() {
    $("#featured").className = "feed stagger";
    $("#featured").innerHTML = PROJECTS.filter((p) => p.featured).map((p, i) => `
      <li style="--i:${i}"><button type="button" class="row row--wrap" data-spot data-project="${p.id}">
        <span class="row__icon" style="--c:${p.color}">${icon(CAT_ICON[p.cat[0]] || "box")}</span>
        <span class="row__text"><b>${esc(p.name)}</b><small>${esc(p.desc[lang] || p.desc.en)}</small></span>
        <span class="row__meta">${esc(p.lang || p.tags[0])}</span>
        ${icon("chevron", "row__go")}
      </button></li>`).join("");
  }

  /* ======================================================================
     Projects
     ====================================================================== */
  function renderProjects() {
    const grid = $("#projGrid");
    const visible = PROJECTS.filter((p) => state.filter === "all" || p.cat.includes(state.filter));
    grid.innerHTML = visible.map((p, i) => `
      <button type="button" class="pcard" data-spot data-project="${p.id}" style="--i:${i};--c:${p.color}">
        <span class="pcard__cover">${coverHTML(p)}${p.featured ? `<span class="pcard__badge">${t("project.featured")}</span>` : ""}</span>
        <span class="pcard__body">
          <span class="pcard__top"><span class="pcard__title">${esc(p.name)}</span>${starsHTML(p)}</span>
          <span class="pcard__desc">${esc(p.desc[lang] || p.desc.en)}</span>
          <span class="pcard__meta">${langHTML(p)}<span>${p.cat.map((c) => t(`cat.${c}`)).join(" · ")}</span></span>
        </span>
      </button>`).join("") + `
      <a class="pcard pcard--more" data-spot href="https://github.com/${SITE.github}?tab=repositories" target="_blank" rel="noopener" style="--i:${visible.length}">
        <span class="more__icon">${icon("github")}</span>
        <span class="pcard__title">${t("project.more")}</span>
        <span class="pcard__desc">${t("project.moreText", { n: num(state.gh.repos) })}</span>
      </a>`;
    $("#projCount").textContent = `${visible.length} ${plural(visible.length, t("projects.count"))}`;
  }

  function updateStars() {
    $$("[data-stars]").forEach((el) => {
      const n = state.gh.starsMap?.[el.dataset.stars.toLowerCase()];
      if (n == null) return;
      el.querySelector("b").textContent = n;
      el.hidden = false;
    });
  }

  /* ---------- Drawer ---------- */
  const drawer = $("#drawer");
  let drawerIdx = -1;

  function renderDrawer() {
    const p = PROJECTS[drawerIdx];
    const repoUrl = `https://github.com/${SITE.github}/${p.repo}`;
    const n = projectStars(p);
    const ext = ' target="_blank" rel="noopener"';
    $("#drawerPanel").innerHTML = `
      <header class="drawer__head">
        <span class="drawer__crumbs">${t("nav.projects")} / <b>${esc(p.name)}</b></span>
        <div class="drawer__nav">
          <button class="icon-btn" type="button" data-step="-1" aria-label="${t("project.prev")}">${icon("arrow-left")}</button>
          <button class="icon-btn" type="button" data-step="1" aria-label="${t("project.next")}">${icon("arrow-right")}</button>
          <button class="icon-btn" type="button" data-close aria-label="${t("ui.close")}">${icon("x")}</button>
        </div>
      </header>
      <div class="drawer__cover" style="--c:${p.color}">${coverHTML(p)}</div>
      <div class="drawer__body">
        <h2 class="drawer__title" id="drawerTitle" style="--i:0">${esc(p.name)}</h2>
        <p class="drawer__desc" style="--i:1">${esc(p.desc[lang] || p.desc.en)}</p>
        <div class="badges" style="--i:2">${p.featured ? `<span class="badge badge--ok">${icon("star")}${t("project.featured")}</span>` : ""}${p.tags.map((x) => `<span class="badge">${esc(x)}</span>`).join("")}</div>
        <dl class="stats-list" style="--i:3">
          <div><dt>${icon("code")}<span>${t("project.lang")}</span></dt><dd>${langHTML(p)}</dd></div>
          <div><dt>${icon("star")}<span>${t("project.stars")}</span></dt><dd>${n ?? "—"}</dd></div>
          <div><dt>${icon("grid")}<span>${t("project.category")}</span></dt><dd>${p.cat.map((c) => t(`cat.${c}`)).join(" · ")}</dd></div>
          <div class="is-warm"><dt>${icon("github")}<span>${t("project.repo")}</span></dt><dd>${esc(p.repo)}</dd></div>
        </dl>
        <div class="actions" style="--i:4">
          <a class="btn btn--primary" href="${repoUrl}"${ext}>${icon("github")}<span>${t("project.open")}</span></a>
          ${p.live ? `<a class="btn" href="${esc(p.live)}"${ext}>${icon("external")}<span>${t("project.live")}</span></a>` : ""}
          ${p.extra ? `<a class="btn" href="${esc(p.extra.url)}"${ext}>${icon("external")}<span>${esc(p.extra.label)}</span></a>` : ""}
        </div>
      </div>`;
  }

  function openProject(id) {
    const i = PROJECTS.findIndex((p) => p.id === id);
    if (i < 0) return;
    drawerIdx = i;
    renderDrawer();
    if (!drawer.open) drawer.showModal();
    $('[data-close]', drawer)?.focus({ preventScroll: true });
  }

  function stepProject(d) {
    drawerIdx = (drawerIdx + d + PROJECTS.length) % PROJECTS.length;
    renderDrawer();
    $(`[data-step="${d}"]`, drawer)?.focus({ preventScroll: true });
  }

  /* ---------- Dialog helpers ---------- */
  function closeDialog(d) {
    if (!d.open || d.classList.contains("is-closing")) return;
    if (!motionOK()) { d.close(); return; }
    d.classList.add("is-closing");
    setTimeout(() => {
      d.classList.remove("is-closing");
      d.close();
    }, 220);
  }

  function initDialogs() {
    $$("dialog").forEach((d) => {
      d.addEventListener("cancel", (e) => { e.preventDefault(); closeDialog(d); });
      d.addEventListener("click", (e) => {
        if (e.target === d || e.target.closest("[data-close]")) closeDialog(d);
      });
    });
    drawer.addEventListener("click", (e) => {
      const step = e.target.closest("[data-step]");
      if (step) stepProject(Number(step.dataset.step));
    });
    drawer.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") stepProject(1);
      else if (e.key === "ArrowLeft") stepProject(-1);
    });
  }

  /* ======================================================================
     Stack, journey, contact
     ====================================================================== */
  function renderStack() {
    const langs = Object.entries(state.gh.langs).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const max = langs[0]?.[1] || 1;
    $("#langBars").innerHTML = langs.map(([name, n], i) => `
      <li class="bar" style="--i:${i};--c:${LANG_COLORS[name] || "var(--accent)"}">
        <span class="bar__name"><i></i>${esc(name)}</span>
        <span class="bar__track"><span class="bar__fill" style="--w:${((n / max) * 100).toFixed(1)}%"></span></span>
        <span class="bar__count">${n} ${plural(n, t("repos"))}</span>
      </li>`).join("");
    const src = $("#langSource");
    src.textContent = t(state.gh.live ? "stack.live" : "stack.cached");
    src.classList.toggle("is-live", state.gh.live);

    $("#toolChips").innerHTML = SITE.tools.map((x, i) => `<span class="chip" style="--i:${i}"><i></i>${esc(x)}</span>`).join("");
    $("#services").innerHTML = SERVICES.map((s, i) => `
      <li class="service" style="--i:${i}">
        <span class="service__icon">${icon(s.icon)}</span>
        <b>${t(`svc.${s.key}`)}</b>
        <p>${t(`svc.${s.key}Text`)}</p>
      </li>`).join("");
  }

  function renderJourney() {
    $("#journey").innerHTML = TIMELINE.map((it, i) => {
      const [title, text] = it[lang] || it.en;
      return `<li style="--i:${i}">
        <span class="journey__dot">${icon(it.icon)}</span>
        <article class="card" data-spot>
          <span class="journey__year">${it.year}</span>
          <h3 class="journey__title">${esc(title)}</h3>
          <p class="journey__text">${esc(text)}</p>
        </article>
      </li>`;
    }).join("");
  }

  function getSocials() {
    const s = SITE.socials || {};
    return [
      { label: "GitHub", handle: `@${SITE.github}`, url: `https://github.com/${SITE.github}`, icon: "github", color: "var(--text)" },
      s.telegram && { label: "Telegram", handle: s.telegram.replace(/^https?:\/\/(t\.me\/)?/, "@"), url: s.telegram, icon: "send", color: "var(--blue)" },
      s.discord && { label: "Discord", handle: "Discord", url: s.discord, icon: "chat", color: "var(--violet)" },
      s.email && { label: "Email", handle: s.email, url: `mailto:${s.email}`, icon: "mail", color: "var(--warm)", mail: true }
    ].filter(Boolean);
  }

  function renderContact() {
    const socials = getSocials();
    $("#contactLinks").innerHTML = socials.map((s, i) => `
      <li style="--i:${i}"><a class="row" data-spot href="${esc(s.url)}"${s.mail ? "" : ' target="_blank" rel="noopener"'}>
        <span class="row__icon" style="--c:${s.color}">${icon(s.icon)}</span>
        <span class="row__text"><b>${s.label}</b></span>
        <span class="row__meta">${esc(s.handle)}</span>
        ${icon("external", "row__go")}
      </a></li>`).join("");
    const primary = socials.find((s) => s.label === "Telegram") || socials.find((s) => s.mail) || socials[0];
    const hi = $("#sayHi");
    hi.href = primary.url;
    if (primary.mail) { hi.removeAttribute("target"); hi.removeAttribute("rel"); }
  }

  /* ======================================================================
     Typed roles, clock
     ====================================================================== */
  let typedToken = 0;
  function startTyped() {
    const el = $("#typed");
    const roles = t("hero.roles");
    const token = ++typedToken;
    if (!motionOK()) { el.textContent = roles[0]; return; }
    let ri = 0, ci = 0, deleting = false;
    el.textContent = "";
    const step = () => {
      if (token !== typedToken) return;
      const word = roles[ri];
      if (!deleting) {
        el.textContent = word.slice(0, ++ci);
        if (ci === word.length) { deleting = true; return setTimeout(step, 1900); }
        return setTimeout(step, 55 + Math.random() * 60);
      }
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; return setTimeout(step, 320); }
      setTimeout(step, 30);
    };
    step();
  }

  let clockFmt = null;
  let clockOffset = "";
  function makeClock() {
    try {
      clockFmt = new Intl.DateTimeFormat(lang === "ru" ? "ru-RU" : "en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: SITE.timezone });
      clockOffset = new Intl.DateTimeFormat("en-US", { timeZone: SITE.timezone, timeZoneName: "shortOffset" })
        .formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value || "";
    } catch {
      clockFmt = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      clockOffset = "";
    }
  }
  function tickClock() {
    const text = `${clockFmt.format(new Date())}${clockOffset ? ` · ${clockOffset}` : ""}`;
    $$("[data-clock]").forEach((el) => { el.textContent = text; });
  }

  /* ======================================================================
     Router
     ====================================================================== */
  let tabsHome = null;
  let tabsProj = null;

  function syncIndicators() {
    const side = $('#sideNav a[aria-current="page"]');
    if (side) $(".side-nav__pill").style.setProperty("--y", `${side.offsetTop}px`);
    const bar = $('#tabbar a[aria-current="page"]');
    if (bar && bar.offsetWidth) {
      const ind = $(".tabbar__ind");
      ind.style.setProperty("--x", `${bar.offsetLeft}px`);
      ind.style.setProperty("--w", `${bar.offsetWidth}px`);
    }
    tabsHome?.sync();
    tabsProj?.sync();
  }

  const onEnter = {
    home: () => {},
    projects: renderProjects,
    stack: renderStack,
    journey: renderJourney,
    terminal: () => bootTerminal(),
    contact: () => {}
  };

  function parseHash() {
    const [view, arg] = location.hash.replace(/^#\/?/, "").split("/");
    return { view: VIEWS.includes(view) ? view : "home", arg };
  }

  function go(view) {
    const hash = view === "home" ? "#/" : `#/${view}`;
    if (location.hash !== hash) location.hash = hash;
    else route();
  }

  function showView(name) {
    if (name === state.view) return;
    const prev = state.view;
    state.view = name;
    $$(".view").forEach((v) => {
      const on = v.dataset.view === name;
      v.hidden = !on;
      v.classList.toggle("is-entering", false);
    });
    const next = $(`.view[data-view="${name}"]`);
    $$("[data-anim]", next).forEach((el, i) => el.style.setProperty("--i", i));
    void next.offsetWidth;
    next.classList.add("is-entering");

    $$("#sideNav a, #tabbar a").forEach((a) => {
      if (a.dataset.view === name) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    const crumb = $("#crumb");
    crumb.textContent = t(`nav.${name}`);
    crumb.classList.remove("is-swap");
    void crumb.offsetWidth;
    crumb.classList.add("is-swap");
    document.title = name === "home" ? "Sayka — Developer" : `${t(`nav.${name}`)} — Sayka`;

    if (prev) window.scrollTo({ top: 0, behavior: "instant" });
    onEnter[name]();
    sky?.setActive(name === "home");
    requestAnimationFrame(syncIndicators);
  }

  function route() {
    const { view, arg } = parseHash();
    showView(view);
    if (view === "projects" && arg) openProject(arg);
  }

  /* ======================================================================
     Command palette
     ====================================================================== */
  const palette = $("#palette");
  const palInput = $("#palInput");
  const palList = $("#palList");
  let palItems = [];
  let palIndex = 0;
  const GROUPS = { views: 0, projects: 1, actions: 2 };

  function paletteSource() {
    const en = (key, vars) => {
      let s = I18N.en[key] || "";
      if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
      return s;
    };
    const views = VIEWS.map((v, i) => ({ group: "views", label: t(`nav.${v}`), kw: `${v} ${en(`nav.${v}`)}`, icon: VIEW_ICON[v], kbd: String(i + 1), run: () => go(v) }));
    const projects = PROJECTS.map((p) => ({
      group: "projects", label: p.name, sub: p.desc[lang] || p.desc.en,
      icon: CAT_ICON[p.cat[0]] || "box", color: p.color, run: () => openProject(p.id)
    }));
    const actions = [
      { label: t("act.lang"), kw: "language english russian язык", icon: "globe", run: () => setLang(lang === "en" ? "ru" : "en") },
      { label: t("act.accent"), kw: `${en("act.accent")} theme цвет`, icon: "palette", run: () => setAccent(state.accent + 1, true) },
      ...SKY_MODES.map((m) => ({ label: t("act.sky", { name: t(`sky.${m}`) }), kw: `sky ${m}`, icon: SKY_ICON[m], run: () => { go("home"); setSky(m, true); } })),
      { label: t("act.copy"), kw: en("act.copy"), icon: "link", run: copyLink },
      { label: t("act.github"), kw: en("act.github"), icon: "github", run: () => window.open(`https://github.com/${SITE.github}`, "_blank", "noopener") },
      { label: t("act.motion"), kw: `${en("act.motion")} motion`, icon: "wave", run: () => setMotion(!state.motion, true) }
    ].map((a) => ({ group: "actions", ...a }));
    return [...views, ...projects, ...actions];
  }

  function score(q, it) {
    if (!q) return 1;
    const label = it.label.toLowerCase();
    if (label.startsWith(q)) return 4;
    if (label.includes(q)) return 3;
    if (`${it.sub || ""} ${it.kw || ""}`.toLowerCase().includes(q)) return 2;
    let j = 0;
    for (const ch of label) {
      if (ch === q[j]) j++;
      if (j === q.length) return 1;
    }
    return 0;
  }

  function highlight(label, q) {
    const i = q ? label.toLowerCase().indexOf(q) : -1;
    if (i < 0) return esc(label);
    return `${esc(label.slice(0, i))}<mark>${esc(label.slice(i, i + q.length))}</mark>${esc(label.slice(i + q.length))}`;
  }

  function renderPalette() {
    const q = palInput.value.trim().toLowerCase();
    palItems = paletteSource()
      .map((it) => ({ ...it, score: score(q, it) }))
      .filter((it) => it.score > 0)
      .sort((a, b) => GROUPS[a.group] - GROUPS[b.group] || b.score - a.score);
    palIndex = 0;
    if (!palItems.length) {
      palList.innerHTML = `<li class="pal-empty">${t("palette.empty", { q: esc(palInput.value.trim()) })}</li>`;
      palInput.removeAttribute("aria-activedescendant");
      return;
    }
    let html = "";
    let group = null;
    const groupKey = { views: "palette.groupViews", projects: "palette.groupProjects", actions: "palette.groupActions" };
    palItems.forEach((it, i) => {
      if (it.group !== group) {
        group = it.group;
        html += `<li class="pal-group" role="presentation">${t(groupKey[group])}</li>`;
      }
      html += `<li class="pal-item" role="option" id="pal-${i}" data-i="${i}" aria-selected="false">
        <span class="pal-item__icon"${it.color ? ` style="--c:${it.color}"` : ""}>${icon(it.icon)}</span>
        <span class="pal-item__label">${highlight(it.label, q)}</span>
        ${it.sub ? `<span class="pal-item__sub">${esc(it.sub)}</span>` : ""}
        ${it.kbd ? `<kbd>${it.kbd}</kbd>` : ""}
      </li>`;
    });
    palList.innerHTML = html;
    setPalIndex(0);
  }

  function setPalIndex(i) {
    if (!palItems.length) return;
    palIndex = (i + palItems.length) % palItems.length;
    $$(".pal-item", palList).forEach((el) => el.setAttribute("aria-selected", String(Number(el.dataset.i) === palIndex)));
    const active = $(`#pal-${palIndex}`);
    palInput.setAttribute("aria-activedescendant", `pal-${palIndex}`);
    active?.scrollIntoView({ block: "nearest" });
  }

  function runPalette(i) {
    const it = palItems[i];
    if (!it) return;
    palette.close();
    it.run();
  }

  function openPalette() {
    if (palette.open) return;
    $$("dialog[open]").forEach((d) => d.close());
    palInput.value = "";
    renderPalette();
    palette.showModal();
    palInput.focus();
  }

  function initPalette() {
    palInput.addEventListener("input", renderPalette);
    palInput.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setPalIndex(palIndex + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setPalIndex(palIndex - 1); }
      else if (e.key === "Enter") { e.preventDefault(); runPalette(palIndex); }
    });
    palList.addEventListener("pointermove", (e) => {
      const item = e.target.closest(".pal-item");
      if (item && Number(item.dataset.i) !== palIndex) setPalIndex(Number(item.dataset.i));
    });
    palList.addEventListener("click", (e) => {
      const item = e.target.closest(".pal-item");
      if (item) runPalette(Number(item.dataset.i));
    });
    $$("[data-open-palette]").forEach((b) => b.addEventListener("click", openPalette));
    const hint = isMac ? "⌘K" : "Ctrl K";
    $("#kbdHint").textContent = hint;
    $("#kbdHint2").textContent = hint;
  }

  /* ======================================================================
     Settings
     ====================================================================== */
  function initSettings() {
    const dlg = $("#settings");
    $("#setAccent").innerHTML = SITE.accents.map((a, i) =>
      `<button type="button" class="swatch" role="radio" aria-checked="${i === state.accent}" aria-label="${a.name}" title="${a.name}" style="--a:${a.a};--b:${a.b}" data-accent="${i}"></button>`
    ).join("");
    $("#setAccent").addEventListener("click", (e) => {
      const b = e.target.closest("[data-accent]");
      if (b) setAccent(Number(b.dataset.accent));
    });
    $("#setLang").addEventListener("click", (e) => {
      const b = e.target.closest("[data-lang]");
      if (b) setLang(b.dataset.lang);
      syncSettings();
    });
    $("#setMotion").addEventListener("click", () => setMotion(!state.motion));
    $$("[data-open-settings]").forEach((b) => b.addEventListener("click", () => {
      syncSettings();
      dlg.showModal();
    }));
  }

  function syncSettings() {
    $$("#setLang [data-lang]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.lang === lang)));
    $$(".swatch").forEach((s, i) => s.setAttribute("aria-checked", String(i === state.accent)));
    $("#setMotion").setAttribute("aria-checked", String(state.motion));
  }

  /* ======================================================================
     Terminal
     ====================================================================== */
  let bootTerminal = () => {};

  function initTerminal() {
    const out = $("#termOut");
    const input = $("#termIn");
    const history = [];
    let hi = 0;
    let booted = false;

    const print = (html, cls = "") => {
      const d = document.createElement("div");
      d.className = `t-line ${cls}`;
      d.innerHTML = html;
      out.append(d);
      out.scrollTop = out.scrollHeight;
    };
    const findProject = (q) => {
      const s = (q || "").toLowerCase();
      return PROJECTS.find((p) => p.id === s || p.name.toLowerCase() === s || p.repo.toLowerCase() === s);
    };

    const cmds = {
      help() {
        const rows = [["help"], ["about"], ["projects"], ["open <name>", "open"], ["cd <page>", "cd"], ["stack"], ["contact"], ["neofetch"], ["sky <mode>", "sky"], ["theme <name>", "theme"], ["lang [en|ru]", "lang"], ["clear"]];
        print(t("term.helpHead"), "t-accent");
        print(`<div class="t-grid">${rows.map(([c, k]) => `<b>${esc(c)}</b><span>${t(`term.cmd.${k || c}`)}</span>`).join("")}</div>`);
      },
      about() { print(t("term.about")); },
      whoami() { print("sayka"); },
      projects() {
        print(`<div class="t-grid">${PROJECTS.map((p) => `<b class="t-accent">${p.id}</b><span>${esc(p.desc[lang] || p.desc.en)}</span>`).join("")}</div>`);
        print("→ open &lt;name&gt;", "t-dim");
      },
      ls() { print(PROJECTS.map((p) => `<span class="t-accent">${p.id}/</span>`).join("  ")); },
      open(arg) {
        const p = findProject(arg);
        if (!p) return print(t("term.openUsage", { list: PROJECTS.slice(0, 3).map((x) => x.id).join(", ") }), "t-err");
        print(t("term.opening", { name: esc(p.name) }), "t-ok");
        setTimeout(() => openProject(p.id), 250);
      },
      cd(arg) {
        const v = (arg || "").replace(/^\.?\/?|\/$/g, "").toLowerCase();
        if (v === "~" || v === "" || v === "..") return go("home");
        if (!VIEWS.includes(v)) return print(t("term.cdUsage", { list: VIEWS.join(", ") }), "t-err");
        go(v);
      },
      stack() { print([...Object.keys(state.gh.langs), ...SITE.tools].map((s) => `<b>${esc(s)}</b>`).join(" · ")); },
      contact() {
        print(getSocials().map((s) => `${s.label.padEnd(9, " ")}<a href="${esc(s.url)}"${s.mail ? "" : ' target="_blank" rel="noopener"'}>${esc(s.url.replace(/^mailto:|^https?:\/\//, ""))}</a>`).join("\n"));
      },
      neofetch() {
        const logo = ["  ▄▄▄▄▄▄ ", " █▀    ▀ ", " ▀█▄▄▄▄  ", "      ▀█ ", " ▄    ▄█ ", "  ▀▀▀▀▀  "].join("\n");
        const info = [
          `<b class="t-accent">sayka</b>@<b class="t-accent">${SITE.domain}</b>`,
          "─────────────────────",
          `<b>Location</b>: ${t("profile.country")}`,
          "<b>Company</b>: MiraiLab Inc.",
          `<b>Uptime</b>: ${t("term.uptime")} ${new Date(SITE.joined).getFullYear()}`,
          `<b>Repos</b>: ${state.gh.repos}`,
          `<b>Stars</b>: ${state.gh.stars}`,
          `<b>Followers</b>: ${state.gh.followers}`,
          `<b>Langs</b>: ${Object.keys(state.gh.langs).slice(0, 4).join(", ")}`,
          SITE.accents.map((a) => `<span class="t-swatch" style="background:${a.a}"></span>`).join("")
        ].join("\n");
        print(`<div class="t-neo"><pre>${logo}</pre><div>${info}</div></div>`);
      },
      sky(arg) {
        const m = (arg || "").toLowerCase();
        if (!SKY_MODES.includes(m)) return print(t("term.skyUsage"), "t-err");
        setSky(m);
        print(t("term.skySet", { name: t(`sky.${m}`) }), "t-ok");
      },
      theme(arg) {
        const list = SITE.accents.map((a) => a.name).join(", ");
        const i = SITE.accents.findIndex((a) => a.name === (arg || "").toLowerCase());
        if (i < 0) return print(t("term.themeUsage", { list }), arg ? "t-err" : "");
        setAccent(i);
        print(t("term.themeSet", { name: SITE.accents[i].name }), "t-ok");
      },
      lang(arg) {
        const next = arg ? arg.toLowerCase() : lang === "en" ? "ru" : "en";
        if (!I18N[next]) return print("en | ru", "t-err");
        setLang(next);
        print(t("term.langSet"), "t-ok");
      },
      clear() { out.innerHTML = ""; },
      cls() { cmds.clear(); },
      date() { print(new Date().toString()); },
      echo(...args) { print(esc(args.join(" "))); },
      sudo() { print(t("term.sudo"), "t-err"); },
      exit() { print(t("term.exit")); },
      hire() {
        print(t("term.hire"), "t-ok");
        setTimeout(() => go("contact"), 500);
      },
      github() { window.open(`https://github.com/${SITE.github}`, "_blank", "noopener"); }
    };

    const run = (raw) => {
      const line = raw.trim();
      print(esc(line), "t-cmd");
      if (!line) return;
      history.push(line);
      hi = history.length;
      const [name, ...args] = line.split(/\s+/);
      const key = name.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(cmds, key)) cmds[key](...args);
      else print(t("term.notFound", { cmd: esc(name) }), "t-err");
    };

    const complete = (value) => {
      const [cmd, arg] = value.split(/\s+/);
      if (arg === undefined) return Object.keys(cmds).find((c) => c.startsWith(cmd.toLowerCase()) && c !== cmd);
      const pools = { open: PROJECTS.map((p) => p.id), cd: VIEWS, sky: SKY_MODES, theme: SITE.accents.map((a) => a.name), lang: ["en", "ru"] };
      const hit = (pools[cmd] || []).find((x) => x.startsWith(arg.toLowerCase()) && x !== arg);
      return hit ? `${cmd} ${hit}` : null;
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        run(input.value);
        input.value = "";
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (hi > 0) input.value = history[--hi];
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (hi < history.length - 1) input.value = history[++hi];
        else { hi = history.length; input.value = ""; }
      } else if (e.key === "Tab" && input.value.trim()) {
        const hit = complete(input.value.trim());
        if (hit) { e.preventDefault(); input.value = hit; }
      } else if (e.key.toLowerCase() === "l" && e.ctrlKey) {
        e.preventDefault();
        cmds.clear();
      }
    });

    $("#termBody").addEventListener("click", (e) => {
      if (e.target.closest("a") || String(getSelection())) return;
      input.focus({ preventScroll: true });
    });

    bootTerminal = async () => {
      if (booted) return;
      booted = true;
      print(t("term.welcome"));
      if (!motionOK()) { cmds.neofetch(); return; }
      await sleep(600);
      for (const ch of "neofetch") {
        if (document.activeElement === input) { input.value = ""; return; }
        input.value += ch;
        await sleep(80);
      }
      await sleep(250);
      if (document.activeElement === input) { input.value = ""; return; }
      input.value = "";
      run("neofetch");
    };
  }

  /* ======================================================================
     GitHub data
     ====================================================================== */
  async function fetchJSON(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    try {
      const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/vnd.github+json" } });
      if (!res.ok) throw new Error(String(res.status));
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async function fetchGitHub() {
    const base = `https://api.github.com/users/${SITE.github}`;
    const [u, r, ev] = await Promise.allSettled([
      fetchJSON(base),
      fetchJSON(`${base}/repos?per_page=100&sort=pushed`),
      fetchJSON(`${base}/events/public?per_page=40`)
    ]);
    if ([u, r, ev].every((x) => x.status !== "fulfilled")) return null;
    const data = { t: Date.now() };
    if (u.status === "fulfilled") {
      const v = u.value;
      data.user = { repos: v.public_repos, followers: v.followers, following: v.following, created: v.created_at };
    }
    if (r.status === "fulfilled" && Array.isArray(r.value)) {
      data.repos = r.value.filter((x) => !x.fork).map((x) => ({ name: x.name, stars: x.stargazers_count, lang: x.language }));
    }
    if (ev.status === "fulfilled" && Array.isArray(ev.value)) {
      data.events = mergeEvents(ev.value.map(mapEvent).filter((x) => x.type !== "branch" && x.type !== "delete")).slice(0, 10);
    }
    return data;
  }

  function applyGitHub(data) {
    const gh = state.gh;
    if (data.user) {
      gh.repos = data.user.repos;
      gh.followers = data.user.followers;
      gh.following = data.user.following;
      if (data.user.created) gh.years = yearsSince(data.user.created);
    }
    if (data.repos) {
      gh.starsMap = Object.fromEntries(data.repos.map((x) => [x.name.toLowerCase(), x.stars]));
      gh.stars = data.repos.reduce((s, x) => s + (x.stars || 0), 0);
      const langs = {};
      data.repos.forEach((x) => { if (x.lang) langs[x.lang] = (langs[x.lang] || 0) + 1; });
      if (Object.keys(langs).length) gh.langs = langs;
    }
    if (data.events && data.events.length) gh.events = data.events;
    gh.live = !!(data.user || data.repos || data.events);
  }

  async function loadGitHub() {
    const key = "gh-v2";
    let data = null;
    try { data = JSON.parse(session.get(key)); } catch { data = null; }
    if (!data || Date.now() - data.t > 15 * 60 * 1000) {
      const fallbackTimer = setTimeout(() => {
        if (state.gh.loaded) return;
        state.gh.loaded = true;
        renderFeed();
      }, 2500);
      data = await fetchGitHub().catch(() => null);
      clearTimeout(fallbackTimer);
      if (data) session.set(key, JSON.stringify(data));
    }
    if (data) applyGitHub(data);
    state.gh.loaded = true;
    renderFeed();
    refreshCounts();
    updateStars();
    if (state.view === "stack") renderStack();
    const more = $(".pcard--more .pcard__desc");
    if (more) more.textContent = t("project.moreText", { n: num(state.gh.repos) });
  }

  /* ======================================================================
     Re-render everything that depends on language
     ====================================================================== */
  function renderDynamic() {
    renderFeed();
    renderFeatured();
    renderContact();
    if (state.view && onEnter[state.view] && state.view !== "terminal") onEnter[state.view]();
    if (state.view) {
      $("#crumb").textContent = t(`nav.${state.view}`);
      document.title = state.view === "home" ? "Sayka — Developer" : `${t(`nav.${state.view}`)} — Sayka`;
    }
    $$("[data-count]").forEach((el) => { if (counted.has(el)) el.textContent = num(Number(el.dataset.value) || 0); });
    if (palette.open) renderPalette();
    if (drawer.open) renderDrawer();
    syncSettings();
    makeClock();
    tickClock();
    startTyped();
    requestAnimationFrame(syncIndicators);
  }

  /* ======================================================================
     Global keyboard shortcuts
     ====================================================================== */
  function initShortcuts() {
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (palette.open) closeDialog(palette);
        else openPalette();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.closest && e.target.closest("input, textarea, [contenteditable]")) return;
      if ($("dialog[open]")) return;
      if (e.key === "/") {
        e.preventDefault();
        openPalette();
      } else if (/^[1-6]$/.test(e.key)) {
        go(VIEWS[Number(e.key) - 1]);
      }
    });
  }

  /* ======================================================================
     Boot
     ====================================================================== */
  setAccent(state.accent);
  root.classList.toggle("reduce-motion", !state.motion);
  $$("[data-status]").forEach((el) => { el.hidden = !SITE.available; });
  $("#year").textContent = new Date().getFullYear();

  applyStatic();
  makeClock();
  tickClock();
  setInterval(tickClock, 1000);

  tabsHome = makeTabs($("#homeTabs"), (tab) => {
    $$("#homeTabs ~ .tab-panel").forEach((p) => { p.hidden = p.id !== `panel-${tab}`; });
  });
  tabsProj = makeTabs($("#projTabs"), (tab) => {
    state.filter = tab;
    renderProjects();
  });

  sky = new Sky($("#sky"), { mode: resolveSky(state.sky), reduced: !motionOK() });
  setSky(state.sky);
  $$("[data-sky]").forEach((b) => b.addEventListener("click", () => setSky(b.dataset.sky, b.closest(".settings") === null)));
  const hint = $("#skyHint");
  $("#sky").addEventListener("pointerdown", () => hint.classList.add("is-gone"), { once: true });
  setTimeout(() => hint.classList.add("is-gone"), 9000);
  setInterval(() => { if (state.sky === "auto") sky.setMode(Sky.autoMode()); }, 5 * 60 * 1000);

  // Rows and cards that open the project drawer.
  document.addEventListener("click", (e) => {
    const p = e.target.closest("[data-project]");
    if (p) openProject(p.dataset.project);
    if (e.target.closest("[data-copy-link]")) copyLink();
  });

  initPointer();
  initDialogs();
  initPalette();
  initSettings();
  initTerminal();
  initShortcuts();
  initCounts();

  renderFeed();
  renderFeatured();
  renderContact();
  startTyped();

  addEventListener("hashchange", route);
  addEventListener("resize", syncIndicators);
  if (document.fonts) document.fonts.ready.then(syncIndicators);
  route();

  loadGitHub();
})();
