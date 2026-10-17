(() => {
  "use strict";

  const { SITE, PROJECTS, TIMELINE, I18N, LANG_COLORS } = window;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const icon = (id) => `<svg><use href="#i-${id}"/></svg>`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // Storage can throw in private mode / sandboxed frames.
  const store = (area) => ({
    get(k) { try { return window[area].getItem(k); } catch { return null; } },
    set(k, v) { try { window[area].setItem(k, v); } catch { /* ignore */ } }
  });
  const local = store("localStorage");
  const session = store("sessionStorage");

  /* ======================================================================
     i18n
     ====================================================================== */
  let lang = local.get("lang") || ((navigator.language || "").toLowerCase().startsWith("ru") ? "ru" : "en");
  if (!I18N[lang]) lang = "en";
  const langListeners = [];

  function t(key, vars) {
    let s = I18N[lang][key] ?? I18N.en[key] ?? key;
    if (vars && typeof s === "string") s = s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
    return s;
  }

  function applyLang() {
    root.lang = lang;
    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":");
        el.setAttribute(attr, t(key));
      });
    });
    $("#langBtn").textContent = lang === "en" ? "RU" : "EN";
    langListeners.forEach((fn) => fn());
  }

  function setLang(next) {
    if (!I18N[next] || next === lang) return;
    lang = next;
    local.set("lang", lang);
    applyLang();
  }

  /* ======================================================================
     Word splitting for headings
     ====================================================================== */
  function splitWords(el) {
    const nodes = [...el.childNodes];
    el.textContent = "";
    let i = 0;
    const wrap = (node) => {
      const w = document.createElement("span");
      const inner = document.createElement("span");
      w.className = "w";
      inner.className = "w__i";
      inner.style.setProperty("--i", i++);
      inner.append(node);
      w.append(inner);
      return w;
    };
    for (const n of nodes) {
      if (n.nodeType === Node.TEXT_NODE) {
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          el.append(/^\s+$/.test(part) ? document.createTextNode(" ") : wrap(document.createTextNode(part)));
        });
      } else if (n.nodeName === "BR") {
        el.append(n);
      } else {
        el.append(wrap(n));
      }
    }
  }

  function resplit() {
    $$("[data-split]").forEach((el) => {
      splitWords(el);
      if (el.classList.contains("is-in")) {
        el.classList.remove("is-in");
        void el.offsetWidth;
        el.classList.add("is-in");
      }
    });
  }

  /* ======================================================================
     Reveal on scroll
     ====================================================================== */
  let revealReady = false;
  const io = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting).forEach((e, idx) => {
      e.target.style.setProperty("--d", `${idx * 80}ms`);
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  function observeReveals(scope = document) {
    if (!revealReady) return;
    $$("[data-reveal]:not(.is-in), [data-split]:not(.is-in)", scope).forEach((el) => {
      if (reduced) el.classList.add("is-in");
      else io.observe(el);
    });
  }

  /* ======================================================================
     Preloader
     ====================================================================== */
  function preload(done) {
    const pre = $(".preloader");
    const finish = () => {
      root.classList.add("is-loaded");
      setTimeout(() => pre && pre.remove(), 1200);
      setTimeout(done, reduced ? 0 : 380);
    };
    if (!pre || reduced) return finish();

    const count = $("#preCount");
    const bar = $(".preloader__bar i");
    const start = performance.now();
    const dur = 1100;
    let loaded = document.readyState === "complete";
    window.addEventListener("load", () => { loaded = true; }, { once: true });

    const tick = (now) => {
      const ready = loaded || now - start > 3500;
      let p = Math.min((now - start) / dur, 1);
      if (!ready) p = Math.min(p, 0.9);
      const eased = 1 - Math.pow(1 - p, 3);
      count.textContent = Math.round(eased * 100);
      bar.style.setProperty("--p", eased.toFixed(3));
      if (p < 1 || !ready) requestAnimationFrame(tick);
      else setTimeout(finish, 150);
    };
    requestAnimationFrame(tick);
  }

  /* ======================================================================
     Accent colour
     ====================================================================== */
  let accentIdx = Math.max(0, SITE.accents.findIndex((a) => a.name === local.get("accent")));

  function setAccent(i, from) {
    accentIdx = (i + SITE.accents.length) % SITE.accents.length;
    const a = SITE.accents[accentIdx];
    root.style.setProperty("--accent", a.a);
    root.style.setProperty("--accent-2", a.b);
    local.set("accent", a.name);
    if (from && !reduced) {
      const r = from.getBoundingClientRect();
      const flash = document.createElement("div");
      flash.className = "accent-flash";
      flash.style.setProperty("--fx", `${r.left + r.width / 2}px`);
      flash.style.setProperty("--fy", `${r.top + r.height / 2}px`);
      flash.addEventListener("animationend", () => flash.remove());
      document.body.append(flash);
    }
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

  /* ======================================================================
     Pointer: cursor, background spotlight, card glow & tilt
     ====================================================================== */
  function initPointer() {
    const grid = $(".bg__grid");
    const orb = $(".bg__orb--1");
    const dot = $(".cursor");
    const ring = $(".cursor-ring");
    const label = $(".cursor-ring__label");
    const customCursor = finePointer && !reduced;
    const allowTilt = finePointer && !reduced;

    let last = null;
    let raf = 0;
    let tilted = null;
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, down = false;

    const resetTilt = (card) => {
      card.classList.remove("is-tilting");
      card.style.transform = "";
    };

    const frame = () => {
      raf = 0;
      const e = last;
      grid.style.setProperty("--cx", `${e.clientX}px`);
      grid.style.setProperty("--cy", `${e.clientY}px`);
      orb.style.setProperty("--ox", `${(e.clientX / innerWidth - 0.5) * 140}px`);
      orb.style.setProperty("--oy", `${(e.clientY / innerHeight - 0.5) * 140}px`);

      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;

      // Spotlight: light up every card of the hovered grid relative to the pointer.
      const host = target.closest("[data-glow]");
      const single = target.closest(".card");
      const cards = host ? host.querySelectorAll(":scope > .card") : single ? [single] : [];
      for (const c of cards) {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--mx", `${e.clientX - r.left}px`);
        c.style.setProperty("--my", `${e.clientY - r.top}px`);
      }

      if (!allowTilt) return;
      const card = target.closest("[data-tilt]");
      if (tilted && tilted !== card) resetTilt(tilted);
      tilted = card;
      if (card) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        const max = Math.min(7, 2600 / r.width);
        card.classList.add("is-tilting");
        card.style.transform = `perspective(1000px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
      }
    };

    addEventListener("pointermove", (e) => {
      last = e;
      mx = e.clientX;
      my = e.clientY;
      if (customCursor) {
        root.classList.add("cursor-visible");
        dot.style.transform = `translate(${mx}px, ${my}px)`;
      }
      if (!raf) raf = requestAnimationFrame(frame);
    }, { passive: true });

    document.addEventListener("mouseout", (e) => {
      if (e.relatedTarget) return;
      root.classList.remove("cursor-visible");
      if (tilted) { resetTilt(tilted); tilted = null; }
    });

    if (!customCursor) return;
    root.classList.add("has-cursor");

    addEventListener("pointerdown", () => { down = true; });
    addEventListener("pointerup", () => { down = false; });

    document.addEventListener("pointerover", (e) => {
      const el = e.target instanceof Element ? e.target.closest("a, button, input, [data-cursor], .service, .pill, .stat") : null;
      ring.classList.remove("is-hover", "is-label", "is-text");
      if (!el) return;
      if (el.matches("input")) return ring.classList.add("is-text");
      if (el.dataset.cursor) {
        label.textContent = el.dataset.cursor;
        ring.classList.add("is-label");
      } else {
        ring.classList.add("is-hover");
      }
    });

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx.toFixed(1)}px, ${ry.toFixed(1)}px) scale(${down ? 0.8 : 1})`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  function initMagnetic() {
    if (!finePointer || reduced) return;
    $$(".magnetic").forEach((el) => {
      const strength = el.classList.contains("orb-btn") ? 0.35 : 0.3;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ======================================================================
     Header: scroll state, nav indicator, progress, mobile menu
     ====================================================================== */
  const header = $("#header");
  let menuOpen = false;

  function moveIndicator(ind, el) {
    if (!ind || !el) return;
    ind.style.setProperty("--x", `${el.offsetLeft}px`);
    ind.style.setProperty("--y", `${el.offsetTop}px`);
    ind.style.setProperty("--w", `${el.offsetWidth}px`);
    ind.style.setProperty("--h", `${el.offsetHeight}px`);
  }

  function initHeader() {
    const progress = $(".progress");
    const nav = $(".nav");
    const navInd = $(".nav__indicator");
    const links = $$(".nav__link");
    let lastY = scrollY;
    let ticking = false;

    const onScroll = () => {
      ticking = false;
      const y = scrollY;
      header.classList.toggle("is-scrolled", y > 20);
      if (Math.abs(y - lastY) > 4) {
        header.classList.toggle("is-hidden", y > lastY && y > 320 && !menuOpen && !header.contains(document.activeElement));
        lastY = y;
      }
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.setProperty("--progress", max > 0 ? (y / max).toFixed(4) : 0);
    };
    addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    header.addEventListener("focusin", () => header.classList.remove("is-hidden"));
    onScroll();

    // Active section
    const active = () => $(".nav__link.is-active");
    const setActive = (id) => {
      links.forEach((l) => {
        const on = l.getAttribute("href") === `#${id}`;
        l.classList.toggle("is-active", on);
        if (on) l.setAttribute("aria-current", "true");
        else l.removeAttribute("aria-current");
      });
      if (!nav.matches(":hover")) moveIndicator(navInd, active());
    };
    const sectionIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["home", "about", "works", "contact"].forEach((id) => sectionIO.observe(document.getElementById(id)));

    links.forEach((l) => l.addEventListener("pointerenter", () => moveIndicator(navInd, l)));
    nav.addEventListener("pointerleave", () => moveIndicator(navInd, active()));

    const syncIndicators = () => {
      moveIndicator(navInd, active());
      moveIndicator($(".filters__indicator"), $(".filter.is-active"));
    };
    addEventListener("resize", syncIndicators);
    langListeners.push(() => requestAnimationFrame(syncIndicators));
    if (document.fonts) document.fonts.ready.then(syncIndicators);
    syncIndicators();

    // Mobile menu
    const burger = $("#burger");
    const menu = $("#mobileMenu");
    const toggleMenu = (open = !menuOpen) => {
      menuOpen = open;
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
      if (open) {
        menu.hidden = false;
        header.classList.remove("is-hidden");
        requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add("is-open")));
        setTimeout(() => { if (menuOpen) $("a", menu).focus({ preventScroll: true }); }, 300);
      } else {
        menu.classList.remove("is-open");
        setTimeout(() => { if (!menuOpen) menu.hidden = true; }, reduced ? 0 : 700);
      }
    };
    burger.addEventListener("click", () => toggleMenu());
    $$("a", menu).forEach((a) => a.addEventListener("click", () => toggleMenu(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menuOpen) {
        toggleMenu(false);
        burger.focus();
      }
    });
    addEventListener("resize", () => { if (menuOpen && innerWidth > 900) toggleMenu(false); });
  }

  /* ======================================================================
     Hero widgets
     ====================================================================== */
  let typedToken = 0;
  function startTyped() {
    const el = $("#typed");
    const roles = t("hero.roles");
    const token = ++typedToken;
    if (reduced) { el.textContent = roles[0]; return; }
    let ri = 0, ci = 0, deleting = false;
    el.textContent = "";
    const step = () => {
      if (token !== typedToken) return;
      const word = roles[ri];
      if (!deleting) {
        el.textContent = word.slice(0, ++ci);
        if (ci === word.length) { deleting = true; return setTimeout(step, 1800); }
        return setTimeout(step, 60 + Math.random() * 60);
      }
      el.textContent = word.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        ri = (ri + 1) % roles.length;
        return setTimeout(step, 320);
      }
      setTimeout(step, 32);
    };
    step();
  }

  function buildHeroMarquee() {
    const track = $("#heroMarquee .marquee__track");
    const item = (html) => `<span class="marquee__item">${html}<i></i></span>`;
    const seq = [t("marquee.lead"), ...PROJECTS.slice(0, 6).map((p) => `<b>${esc(p.name)}</b>`)].map(item).join("");
    track.innerHTML = seq + seq;
    track.style.setProperty("--dur", "48s");
  }

  function buildPills() {
    $$("[data-pills]").forEach((track) => {
      const row = SITE.stack[Number(track.dataset.pills)] || [];
      const half = row.map((name) => `<span class="pill"><i style="--c:${LANG_COLORS[name] || "var(--accent)"}"></i>${esc(name)}</span>`).join("");
      track.innerHTML = half + half + half + half;
    });
  }

  function initMiniWindow() {
    const screens = $$(".mini-window .screen");
    const title = $(".mini-window__title");
    if (reduced || screens.length < 2) return;
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      screens[i].classList.remove("is-active");
      i = (i + 1) % screens.length;
      screens[i].classList.add("is-active");
      title.textContent = screens[i].dataset.title;
    }, 2600);
  }

  function initSignature() {
    const card = $(".card--cred");
    const sig = $(".signature");
    card.addEventListener("pointerenter", () => {
      if (!card.classList.contains("is-in") || reduced) return;
      sig.classList.add("redraw");
      void sig.getBoundingClientRect();
      sig.classList.remove("redraw");
    });
  }

  function initServices() {
    const card = $(".card--services");
    const items = $$(".service", card);
    if (reduced) return;
    let hot = 0;
    setInterval(() => {
      const hovering = card.matches(":hover") || card.contains(document.activeElement);
      items.forEach((s, i) => s.classList.toggle("is-hot", !hovering && i === hot));
      hot = (hot + 1) % items.length;
    }, 1600);
  }

  /* ======================================================================
     Socials
     ====================================================================== */
  function getSocials() {
    const s = SITE.socials || {};
    return [
      { label: "GitHub", url: `https://github.com/${SITE.github}`, icon: "github" },
      s.telegram && { label: "Telegram", url: s.telegram, icon: "send" },
      s.discord && { label: "Discord", url: s.discord, icon: "chat" },
      s.email && { label: "Email", url: `mailto:${s.email}`, icon: "mail", mail: true }
    ].filter(Boolean);
  }

  function buildSocials() {
    const socials = getSocials();
    const target = (s) => (s.mail ? "" : ' target="_blank" rel="noopener"');

    $("#contactLinks").innerHTML = socials
      .map((s) => `<li><a href="${esc(s.url)}"${target(s)} data-cursor="${s.label}">${icon(s.icon)}${s.label}</a></li>`)
      .join("");

    const copyBtn = $("#copyLink");
    socials.slice(1).forEach((s) => {
      const a = document.createElement("a");
      a.className = "social magnetic";
      a.href = s.url;
      a.setAttribute("aria-label", s.label);
      a.dataset.cursor = s.label;
      if (!s.mail) { a.target = "_blank"; a.rel = "noopener"; }
      a.innerHTML = icon(s.icon);
      copyBtn.before(a);
    });

    const primary = socials.find((s) => s.label === "Telegram") || socials.find((s) => s.mail) || socials[0];
    const hi = $("#sayHi");
    hi.href = primary.url;
    if (primary.mail) { hi.removeAttribute("target"); hi.removeAttribute("rel"); }

    $("#status").hidden = !SITE.available;

    copyBtn.addEventListener("click", async () => {
      const url = location.href.split("#")[0];
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
    });
  }

  /* ======================================================================
     Stats + live GitHub data
     ====================================================================== */
  const statValues = {
    years: new Date().getFullYear() - SITE.since,
    repos: SITE.stats.repos,
    followers: SITE.stats.followers
  };
  let stars = null;
  let statsSeen = false;

  function renderStat(el, value) {
    const pad = Number(el.dataset.pad) || 0;
    el.textContent = (el.dataset.prefix || "") + String(Math.round(value)).padStart(pad, "0");
  }

  function animateStats() {
    $$("[data-count]").forEach((el) => {
      const to = statValues[el.dataset.count];
      const from = Number(el.dataset.value) || 0;
      el.dataset.value = to;
      if (reduced || from === to) return renderStat(el, to);
      const start = performance.now();
      const dur = 1800;
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        renderStat(el, from + (to - from) * e);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  function initStats() {
    $$("[data-count]").forEach((el) => renderStat(el, 0));
    const statsIO = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      statsSeen = true;
      animateStats();
      statsIO.disconnect();
    }, { threshold: 0.4 });
    statsIO.observe($(".card--stats"));
  }

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

  async function loadGitHub() {
    const key = "gh-cache-v1";
    let data = null;
    try { data = JSON.parse(session.get(key)); } catch { data = null; }

    if (!data || Date.now() - data.t > 30 * 60 * 1000) {
      try {
        const base = `https://api.github.com/users/${SITE.github}`;
        const [user, repos] = await Promise.all([fetchJSON(base), fetchJSON(`${base}/repos?per_page=100`)]);
        data = {
          t: Date.now(),
          repos: user.public_repos,
          followers: user.followers,
          created: user.created_at,
          stars: Object.fromEntries(repos.map((r) => [r.name.toLowerCase(), r.stargazers_count]))
        };
        session.set(key, JSON.stringify(data));
      } catch {
        return; // offline or rate limited — keep fallback numbers
      }
    }

    statValues.repos = data.repos;
    statValues.followers = data.followers;
    if (data.created) {
      statValues.years = Math.max(1, Math.floor((Date.now() - new Date(data.created)) / (365.25 * 864e5)));
    }
    stars = data.stars;
    if (statsSeen) animateStats();
    updateStars();
    const more = $("#moreText");
    if (more) more.textContent = t("works.moreText", { n: statValues.repos });
  }

  function updateStars() {
    if (!stars) return;
    $$("[data-stars]").forEach((el) => {
      const n = stars[el.dataset.stars.toLowerCase()];
      if (n == null) return;
      el.textContent = n;
      el.parentElement.hidden = false;
    });
  }

  /* ======================================================================
     Works
     ====================================================================== */
  const CHART = [42, 66, 50, 80, 58, 92, 70, 86, 62, 96, 74];

  function visualHTML(p) {
    switch (p.visual) {
      case "term":
        return `<div class="v-term">${p.lines
          .map((l, i) => `<p style="--i:${i}"${l.startsWith("$") ? ' class="cmd"' : ""}>${esc(l)}</p>`)
          .join("")}</div>`;
      case "grid":
        return `<div class="v-grid">${Array.from({ length: 8 }, (_, i) => `<i style="--i:${i}"${i === 1 ? ' class="a"' : i === 6 ? ' class="b"' : ""}></i>`).join("")}</div>`;
      case "chat":
        return `<div class="v-chat">${p.chat.map((m, i) => `<span style="--i:${i}">${esc(m)}</span>`).join("")}<span class="typing" style="--i:${p.chat.length}"><b></b><b></b><b></b></span></div>`;
      case "scan":
        return `<div class="v-scan"><div class="v-scan__frame"></div><div class="v-scan__json">{<br>&nbsp;"anilist": <u>21</u>,<br>&nbsp;"episode": <u>12</u>,<br>&nbsp;"from": <s>"04:21"</s>,<br>&nbsp;"similarity": <u>0.97</u><br>}</div></div>`;
      case "chart":
        return `<div class="v-chart">${CHART.map((h, i) => `<i style="--i:${i};--h:${h}%"></i>`).join("")}</div>`;
      case "links":
        return `<div class="v-links"><div class="ava"></div>${[0, 1, 2, 3].map((i) => `<span style="--i:${i}"></span>`).join("")}</div>`;
      default:
        return "";
    }
  }

  function projectHTML(p) {
    const repoUrl = `https://github.com/${SITE.github}/${p.repo}`;
    const badge = p.lang
      ? `<span class="lang"><i style="--c:${LANG_COLORS[p.lang] || "var(--accent)"}"></i>${esc(p.lang)}</span>`
      : `<span class="lang"><i style="--c:var(--accent)"></i>${esc(p.tags[0])}</span>`;
    const starCount = stars ? stars[p.repo.toLowerCase()] : null;
    const ext = ' target="_blank" rel="noopener"';

    return `<article class="card project${p.featured ? " project--featured" : ""}" data-id="${p.id}" data-cat="${p.cat.join(" ")}" data-reveal data-tilt style="view-transition-name:p-${p.id}">
      <div class="project__visual">${p.featured ? `<span class="project__badge">${t("works.featured")}</span>` : ""}${visualHTML(p)}</div>
      <div class="project__body">
        <div class="project__meta">${badge}<span class="stars"${starCount == null ? " hidden" : ""}>${icon("star")}<b data-stars="${esc(p.repo)}">${starCount ?? 0}</b></span></div>
        <h3 class="project__title">${esc(p.name)}</h3>
        <p class="project__desc">${esc(p.desc[lang] || p.desc.en)}</p>
        <div class="tags">${p.tags.map((x) => `<span>${esc(x)}</span>`).join("")}</div>
        <div class="project__links">
          <a class="chip-link" href="${repoUrl}"${ext} data-cursor="Code">${icon("github")}${t("works.code")}</a>
          ${p.live ? `<a class="chip-link chip-link--accent" href="${esc(p.live)}"${ext} data-cursor="Live">${t("works.live")}${icon("external")}</a>` : ""}
          ${p.extra ? `<a class="chip-link" href="${esc(p.extra.url)}"${ext}>${esc(p.extra.label)}${icon("external")}</a>` : ""}
        </div>
      </div>
    </article>`;
  }

  let filter = "all";

  function renderProjects() {
    const grid = $("#worksGrid");
    const more = `<a class="card project project--more" href="https://github.com/${SITE.github}?tab=repositories" target="_blank" rel="noopener" data-cat="all" data-reveal data-tilt data-cursor="GitHub" style="view-transition-name:p-more">
      <span class="more__icon">${icon("github")}</span>
      <h3 class="project__title">${t("works.moreTitle")}</h3>
      <p class="project__desc" id="moreText">${t("works.moreText", { n: statValues.repos })}</p>
      <span class="arrow-btn">${icon("arrow")}</span>
    </a>`;
    grid.innerHTML = PROJECTS.map(projectHTML).join("") + more;
    applyFilter(false);
    observeReveals(grid);
  }

  function applyFilter(animate = true) {
    const cards = $$("#worksGrid > .project");
    const run = () => cards.forEach((c) => {
      const cats = c.dataset.cat.split(" ");
      c.hidden = !(filter === "all" || cats.includes("all") || cats.includes(filter));
    });
    if (animate && document.startViewTransition && !reduced) document.startViewTransition(run);
    else run();
  }

  function initFilters() {
    const ind = $(".filters__indicator");
    $$(".filter").forEach((btn) => btn.addEventListener("click", () => {
      if (btn.dataset.filter === filter) return;
      filter = btn.dataset.filter;
      $$(".filter").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      moveIndicator(ind, btn);
      applyFilter();
    }));
  }

  /* ======================================================================
     Timeline
     ====================================================================== */
  function renderTimeline() {
    $("#timeline").innerHTML = TIMELINE.map((it, i) => {
      const [title, text] = it[lang] || it.en;
      return `<li style="--i:${i}"><span class="tl__year">${it.year}</span><b class="tl__title">${esc(title)}</b><span class="tl__text">${esc(text)}</span></li>`;
    }).join("");
  }

  /* ======================================================================
     Contact: rotating ring text + clock
     ====================================================================== */
  function updateRing() {
    const tp = $("#ringText");
    tp.textContent = t("contact.ring").repeat(2);
    tp.setAttribute("textLength", String(Math.floor(2 * Math.PI * 78) - 4));
    tp.setAttribute("lengthAdjust", "spacing");
  }

  let clockFmt = null;
  function initClock() {
    const el = $("#clock");
    const makeFmt = () => {
      try {
        clockFmt = new Intl.DateTimeFormat(lang === "ru" ? "ru-RU" : "en-GB", {
          hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: SITE.timezone
        });
      } catch {
        clockFmt = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      }
    };
    let offset = "";
    try {
      offset = new Intl.DateTimeFormat("en-US", { timeZone: SITE.timezone, timeZoneName: "shortOffset" })
        .formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value || "";
    } catch { offset = ""; }

    const tick = () => { el.textContent = `${clockFmt.format(new Date())}${offset ? ` · ${offset}` : ""}`; };
    makeFmt();
    tick();
    setInterval(tick, 1000);
    langListeners.push(() => { makeFmt(); tick(); });
  }

  /* ======================================================================
     Interactive terminal
     ====================================================================== */
  function initTerminal() {
    const out = $("#termOut");
    const input = $("#termIn");
    const body = $("#termBody");
    const history = [];
    let hi = 0;

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
        const rows = [["help"], ["about"], ["projects"], ["open <name>", "open"], ["stack"], ["contact"], ["neofetch"], ["theme [name]", "theme"], ["lang [en|ru]", "lang"], ["clear"]];
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
        window.open(`https://github.com/${SITE.github}/${p.repo}`, "_blank", "noopener");
      },
      stack() { print(SITE.stack.flat().map((s) => `<b>${esc(s)}</b>`).join(" · ")); },
      contact() {
        print(getSocials().map((s) => `${s.label.padEnd(9, " ")}<a href="${esc(s.url)}"${s.mail ? "" : ' target="_blank" rel="noopener"'}>${esc(s.url.replace(/^mailto:|^https?:\/\//, ""))}</a>`).join("\n"));
      },
      neofetch() {
        const logo = ["  ▄▄▄▄▄▄ ", " █▀    ▀ ", " ▀█▄▄▄▄  ", "      ▀█ ", " ▄    ▄█ ", "  ▀▀▀▀▀  "].join("\n");
        const info = [
          `<b class="t-accent">sayka</b>@<b class="t-accent">github</b>`,
          "─────────────────",
          `<b>Location</b>: ${t("hero.location")}`,
          "<b>Company</b>: MiraiLab Inc.",
          `<b>Uptime</b>: ${t("term.uptime")} ${SITE.since}`,
          `<b>Repos</b>: ${statValues.repos}`,
          `<b>Followers</b>: ${statValues.followers}`,
          `<b>Langs</b>: ${SITE.stack[0].slice(0, 4).join(", ")}`,
          SITE.accents.map((a) => `<span class="t-swatch" style="background:${a.a}"></span>`).join("")
        ].join("\n");
        print(`<div class="t-neo"><pre>${logo}</pre><div>${info}</div></div>`);
      },
      theme(arg) {
        const list = SITE.accents.map((a) => a.name).join(", ");
        if (!arg) return print(t("term.themeUsage", { list }));
        const i = SITE.accents.findIndex((a) => a.name === arg.toLowerCase());
        if (i < 0) return print(t("term.themeUsage", { list }), "t-err");
        setAccent(i, $("#accentBtn"));
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
        setTimeout(() => $("#contact").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }), 500);
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
      const fn = Object.prototype.hasOwnProperty.call(cmds, name.toLowerCase()) ? cmds[name.toLowerCase()] : null;
      if (fn) fn(...args);
      else print(t("term.notFound", { cmd: esc(name) }), "t-err");
    };

    const complete = (value) => {
      const [cmd, arg] = value.split(/\s+/);
      if (arg === undefined) {
        return Object.keys(cmds).find((c) => c.startsWith(cmd.toLowerCase()) && c !== cmd);
      }
      const pool = cmd === "open" ? PROJECTS.map((p) => p.id) : cmd === "theme" ? SITE.accents.map((a) => a.name) : cmd === "lang" ? ["en", "ru"] : [];
      const hit = pool.find((x) => x.startsWith(arg.toLowerCase()) && x !== arg);
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

    body.addEventListener("click", (e) => {
      if (e.target.closest("a") || String(getSelection())) return;
      input.focus({ preventScroll: true });
    });

    // "/" focuses the terminal from anywhere on the page.
    document.addEventListener("keydown", (e) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target.closest && e.target.closest("input, textarea, [contenteditable]")) return;
      e.preventDefault();
      $("#terminal").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      input.focus({ preventScroll: true });
    });

    // Boot sequence once the terminal scrolls into view.
    const boot = async () => {
      print(t("term.welcome"));
      if (reduced) return cmds.neofetch();
      await sleep(500);
      for (const ch of "neofetch") {
        if (document.activeElement === input) { input.value = ""; return; }
        input.value += ch;
        await sleep(85);
      }
      await sleep(250);
      if (document.activeElement === input) { input.value = ""; return; }
      input.value = "";
      run("neofetch");
    };
    const termIO = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      termIO.disconnect();
      boot();
    }, { threshold: 0.35 });
    termIO.observe($("#terminal"));
  }

  /* ======================================================================
     Boot
     ====================================================================== */
  setAccent(accentIdx);
  buildPills();
  buildSocials();

  langListeners.push(resplit, buildHeroMarquee, startTyped, renderProjects, renderTimeline, updateRing);
  applyLang();

  $("#langBtn").addEventListener("click", () => setLang(lang === "en" ? "ru" : "en"));
  $("#accentBtn").addEventListener("click", (e) => {
    setAccent(accentIdx + 1, e.currentTarget);
    toast(t("ui.accentSet", { name: SITE.accents[accentIdx].name }));
  });
  $("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));
  $("#year").textContent = new Date().getFullYear();

  initPointer();
  initMagnetic();
  initHeader();
  initFilters();
  initMiniWindow();
  initSignature();
  initServices();
  initClock();

  preload(() => {
    revealReady = true;
    observeReveals();
    initStats();
    initTerminal();
  });

  loadGitHub();
})();
