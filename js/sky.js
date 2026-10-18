/* ==========================================================================
   Sky — procedural, animated anime-style sky for the banner.
   Clouds, a tree, bushes, sun / moon, stars, fireflies and birds,
   all drawn on a single canvas with mouse parallax.
   ========================================================================== */
(() => {
  "use strict";

  const PALETTES = {
    day: {
      sky: [[0, "#2a5fae"], [0.5, "#4f8fdb"], [0.82, "#9ccaf1"], [1, "#d3e9f8"]],
      light: { x: 0.1, y: -0.15, rgb: "255,250,232", a: 0.5 },
      rays: 0.08,
      cloud: { light: "#ffffff", mid: "#e6eef9", shade: "#a9badb", base: "#8399c6", band: "rgba(88,108,168,0.5)" },
      farAlpha: 0.7,
      bushBack: ["#2b5d48", "#47805e", "#77b07a"],
      bushFront: ["#12291d", "#214c36", "#3d7a4b", "#7fbf6a"],
      leaf: ["#132a1d", "#265539", "#4a8c55", "#93cf74"],
      trunk: ["#211a16", "#46372b"],
      bird: "rgba(28,38,58,0.8)",
      stars: 0
    },
    sunset: {
      sky: [[0, "#262760"], [0.42, "#77478d"], [0.78, "#df7f7a"], [1, "#f8c58b"]],
      light: { x: 0.26, y: 0.66, rgb: "255,186,128", a: 0.6 },
      rays: 0.05,
      cloud: { light: "#ffe6c8", mid: "#f3ad9b", shade: "#9a6e9f", base: "#6a4d86", band: "rgba(66,42,98,0.55)" },
      farAlpha: 0.75,
      bushBack: ["#392d4f", "#5a4468", "#9c6878"],
      bushFront: ["#18121f", "#2c2140", "#55395a", "#c47b6e"],
      leaf: ["#18121f", "#2c2140", "#573c60", "#d08670"],
      trunk: ["#140d16", "#3a2933"],
      bird: "rgba(40,20,46,0.85)",
      stars: 0.2,
      sun: { x: 0.26, y: 0.7, r: 0.075 }
    },
    night: {
      sky: [[0, "#04060f"], [0.5, "#0c1434"], [0.84, "#1b285a"], [1, "#2a3a74"]],
      light: { x: 0.15, y: 0.2, rgb: "180,198,255", a: 0.22 },
      rays: 0,
      cloud: { light: "#aab7e6", mid: "#6874b0", shade: "#333d76", base: "#212856", band: "rgba(8,12,36,0.6)" },
      farAlpha: 0.5,
      bushBack: ["#0e1828", "#19293e", "#2b445e"],
      bushFront: ["#05090f", "#0c1523", "#192940", "#3d6088"],
      leaf: ["#05090f", "#0d1828", "#1d3350", "#41658f"],
      trunk: ["#04060b", "#18202e"],
      bird: "rgba(0,0,0,0)",
      stars: 1,
      moon: { x: 0.15, y: 0.2, r: 0.05 },
      fireflies: true
    }
  };

  const lerp = (a, b, t) => a + (b - a) * t;
  const TAU = Math.PI * 2;

  function rng32(seed) {
    let a = seed | 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function canvas(w, h, dpr) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.ceil(w * dpr));
    c.height = Math.max(1, Math.ceil(h * dpr));
    const g = c.getContext("2d");
    g.scale(dpr, dpr);
    return [c, g];
  }

  function circle(g, x, y, r) {
    g.beginPath();
    g.arc(x, y, Math.max(0.1, r), 0, TAU);
    g.fill();
  }

  /* ---------- Geometry (palette independent, normalised) ---------- */

  // A cumulus cloud: puffs in units of the cloud width, base at y = 0.
  function cloudShape(rand) {
    const puffs = [];
    const n = 10 + Math.floor(rand() * 6);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const mid = 1 - Math.abs(t - 0.5) * 2;
      const r = (0.06 + 0.08 * mid) * (0.8 + rand() * 0.4);
      puffs.push({
        x: (t - 0.5) * 0.84 + (rand() - 0.5) * 0.05,
        y: -r * (0.3 + rand() * 0.4) - mid * 0.07,
        r
      });
    }
    const towers = 3 + Math.floor(rand() * 3);
    for (let i = 0; i < towers; i++) {
      const r = 0.07 + rand() * 0.06;
      puffs.push({ x: (rand() - 0.5) * 0.5, y: -(0.13 + rand() * 0.14), r });
    }
    puffs.sort((a, b) => b.y - a.y);
    return puffs;
  }

  function makeGeometry(seed) {
    const rand = rng32(seed);
    const layers = [
      { n: 5, w: [0.4, 0.6], y: [0.28, 0.48], speed: 4, depth: 0.25, far: true },
      { n: 3, w: [0.75, 1.05], y: [0.55, 0.7], speed: 7, depth: 0.5 },
      { n: 2, w: [1.35, 1.7], y: [0.88, 0.98], speed: 10, depth: 0.75 }
    ];
    const clouds = [];
    layers.forEach((L, li) => {
      for (let i = 0; i < L.n; i++) {
        clouds.push({
          layer: li,
          puffs: cloudShape(rand),
          w: lerp(L.w[0], L.w[1], rand()),
          x: ((i + rand() * 0.7) / L.n) * 1.35 - 0.2,
          y: lerp(L.y[0], L.y[1], rand()),
          speed: L.speed * (0.8 + rand() * 0.4),
          depth: L.depth,
          far: !!L.far
        });
      }
    });

    const stars = Array.from({ length: 170 }, () => ({
      x: rand(), y: rand() * 0.78,
      r: rand() < 0.92 ? 0.6 + rand() * 0.7 : 1.5 + rand() * 0.6,
      p: rand() * TAU, s: 0.6 + rand() * 2.2
    }));

    // Tree, in units of the tree scale, origin at the trunk base.
    const branches = [
      [-0.03, -0.9, -0.46, -1.26, 0.04],
      [-0.02, -1.15, -0.3, -1.56, 0.03],
      [0.02, -1.0, 0.32, -1.34, 0.032],
      [0, -1.3, 0.12, -1.72, 0.026],
      [-0.04, -0.62, -0.28, -0.8, 0.022]
    ];
    const clusters = [
      [-0.25, -1.06, 0.15], [0.28, -1.12, 0.15], [-0.3, -0.84, 0.11],
      [-0.5, -1.3, 0.2], [-0.56, -1.62, 0.17], [-0.32, -1.6, 0.22],
      [0, -1.46, 0.22], [-0.1, -1.78, 0.24], [0.16, -1.72, 0.23],
      [0.36, -1.42, 0.22], [0.44, -1.78, 0.2]
    ].map(([x, y, r]) => ({ x, y, r, seed: Math.floor(rand() * 1e9), phase: rand() * TAU }));

    const bumps = (count, from, to, rMin, rMax, yMin, yMax) =>
      Array.from({ length: count }, (_, i) => ({
        x: lerp(from, to, (i + rand() * 0.8) / count),
        y: lerp(yMin, yMax, rand()),
        r: lerp(rMin, rMax, rand()),
        seed: Math.floor(rand() * 1e9)
      }));

    return {
      clouds, stars, branches, clusters,
      bushBack: [...bumps(18, -0.04, 1.04, 0.08, 0.13, 0.9, 0.95), ...bumps(7, -0.03, 0.24, 0.12, 0.18, 0.82, 0.88)],
      bushFront: bumps(22, -0.05, 1.05, 0.07, 0.12, 1.0, 1.05)
    };
  }

  /* ---------- Sprite renderers ---------- */

  function renderCloud(cl, pal, unit, dpr) {
    const W = cl.w * unit;
    const puffs = cl.puffs.map((p) => ({ x: p.x * W, y: p.y * W, r: p.r * W }));
    const pad = 4;
    let minX = Infinity, maxX = -Infinity, minY = Infinity;
    puffs.forEach((p) => {
      minX = Math.min(minX, p.x - p.r);
      maxX = Math.max(maxX, p.x + p.r);
      minY = Math.min(minY, p.y - p.r);
    });
    const maxY = W * 0.035;
    const w = maxX - minX + pad * 2;
    const h = maxY - minY + pad * 2;
    const [c, g] = canvas(w, h, dpr);
    g.translate(pad - minX, pad - minY);

    g.save();
    g.beginPath();
    g.rect(minX - pad, minY - pad, w, maxY - minY + pad);
    g.clip();

    // Cel-shaded layers: silhouette, shade, mid tone, highlight.
    g.fillStyle = pal.cloud.base;
    puffs.forEach((p) => circle(g, p.x, p.y + p.r * 0.12, p.r));
    g.fillStyle = pal.cloud.shade;
    puffs.forEach((p) => circle(g, p.x, p.y, p.r));
    g.globalCompositeOperation = "source-atop";
    g.fillStyle = pal.cloud.mid;
    puffs.forEach((p) => circle(g, p.x - p.r * 0.1, p.y - p.r * 0.24, p.r * 0.84));
    g.fillStyle = pal.cloud.light;
    puffs.forEach((p) => circle(g, p.x - p.r * 0.22, p.y - p.r * 0.42, p.r * 0.58));

    const bandH = W * 0.14;
    const band = g.createLinearGradient(0, maxY - bandH, 0, maxY);
    band.addColorStop(0, "rgba(0,0,0,0)");
    band.addColorStop(1, pal.cloud.band);
    g.fillStyle = band;
    g.fillRect(minX - pad, maxY - bandH, w, bandH);
    g.restore();

    return { img: c, ox: minX - pad, oy: minY - pad, w, h };
  }

  // A clump of leaves lit from the top-left.
  function paintFoliage(g, cx, cy, R, colors, seed) {
    const rand = rng32(seed);
    const blobs = Array.from({ length: 16 }, () => {
      const a = rand() * TAU;
      const d = Math.sqrt(rand()) * R * 0.72;
      return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.85, r: R * (0.28 + rand() * 0.22) };
    });
    const edge = Array.from({ length: 22 }, () => {
      const a = rand() * TAU;
      const d = R * (0.82 + rand() * 0.2);
      return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.85, r: R * (0.05 + rand() * 0.06), lit: Math.sin(a) < -0.2 && Math.cos(a) < 0.4 };
    });

    g.fillStyle = colors[0];
    blobs.forEach((b) => circle(g, b.x, b.y, b.r));
    edge.forEach((b) => circle(g, b.x, b.y, b.r));

    g.fillStyle = colors[1];
    blobs.forEach((b) => { if (b.y < cy + R * 0.25) circle(g, b.x - b.r * 0.12, b.y - b.r * 0.2, b.r * 0.8); });
    edge.forEach((b) => { if (b.lit) circle(g, b.x, b.y, b.r); });

    g.fillStyle = colors[2];
    blobs.forEach((b) => {
      if ((b.x - cx) * 0.7 + (b.y - cy) < -R * 0.12) circle(g, b.x - b.r * 0.25, b.y - b.r * 0.32, b.r * 0.52);
    });

    if (colors[3]) {
      g.fillStyle = colors[3];
      g.globalAlpha = 0.75;
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (1.05 + rand() * 0.55);
        const d = R * (0.35 + rand() * 0.5);
        circle(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.85, R * (0.035 + rand() * 0.04));
      }
      g.globalAlpha = 1;
    }
  }

  /* ---------- Sky ---------- */

  class Sky {
    constructor(el, { mode = "day", reduced = false } = {}) {
      this.el = el;
      this.ctx = el.getContext("2d");
      this.mode = PALETTES[mode] ? mode : "day";
      this.reduced = reduced;
      this.geo = makeGeometry(20221630);
      this.mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
      this.birds = [];
      this.shooting = [];
      this.fireflies = [];
      this.assets = null;
      this.prev = null;
      this.fade = 1;
      this.visible = true;
      this.active = true;
      this.raf = 0;
      this.last = 0;
      this.nextBirds = 3;
      this.nextShoot = 4;

      this.resize = this.resize.bind(this);
      this.loop = this.loop.bind(this);

      new ResizeObserver(() => {
        clearTimeout(this.rt);
        this.rt = setTimeout(this.resize, 120);
      }).observe(el);
      new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting;
        this.kick();
      }).observe(el);
      document.addEventListener("visibilitychange", () => this.kick());

      addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        if (!r.width) return;
        this.mouse.tx = Math.min(1.2, Math.max(-0.2, (e.clientX - r.left) / r.width));
        this.mouse.ty = Math.min(1.2, Math.max(-0.2, (e.clientY - r.top) / r.height));
      }, { passive: true });

      el.addEventListener("pointerdown", (e) => {
        const r = el.getBoundingClientRect();
        this.interact((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
      });

      this.resize();
    }

    /* public API */
    setMode(mode) {
      if (!PALETTES[mode] || mode === this.mode) return;
      this.mode = mode;
      if (!this.W) return;
      this.prev = this.assets;
      this.assets = this.build(mode);
      this.fade = this.reduced ? 1 : 0;
      if (this.reduced) this.prev = null;
      this.kick(true);
    }

    setReduced(v) {
      this.reduced = v;
      this.kick(true);
    }

    setActive(v) {
      this.active = v;
      this.kick();
    }

    interact(x, y) {
      if (this.mode === "night") this.spawnShootingStar(x, y);
      else this.spawnFlock(x, y);
      this.kick(true);
    }

    /* internals */
    resize() {
      const r = this.el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      this.dpr = Math.min(2, window.devicePixelRatio || 1);
      this.W = r.width;
      this.H = r.height;
      this.el.width = Math.round(this.W * this.dpr);
      this.el.height = Math.round(this.H * this.dpr);
      this.unit = Math.min(this.H, this.W / 2.6);
      this.treeS = Math.min(this.H * 0.62, this.W * 0.3);
      this.prev = null;
      this.assets = this.build(this.mode);
      this.initFireflies();
      this.kick(true);
    }

    build(mode) {
      const pal = PALETTES[mode];
      const { W, H, dpr, unit } = this;
      return {
        pal,
        bg: this.renderBg(pal),
        clouds: this.geo.clouds.map((cl) => renderCloud(cl, pal, unit, dpr)),
        bushBack: this.renderBushes(this.geo.bushBack, pal.bushBack, W, H, unit, dpr),
        bushFront: this.renderBushes(this.geo.bushFront, pal.bushFront, W, H, unit, dpr),
        tree: this.renderTree(pal)
      };
    }

    renderBg(pal) {
      const { W, H, dpr } = this;
      const [c, g] = canvas(W, H, dpr);
      const sky = g.createLinearGradient(0, 0, 0, H);
      pal.sky.forEach(([o, col]) => sky.addColorStop(o, col));
      g.fillStyle = sky;
      g.fillRect(0, 0, W, H);

      const L = pal.light;
      const lx = L.x * W, ly = L.y * H;
      const glow = g.createRadialGradient(lx, ly, 0, lx, ly, Math.max(W, H) * 0.85);
      glow.addColorStop(0, `rgba(${L.rgb},${L.a})`);
      glow.addColorStop(1, `rgba(${L.rgb},0)`);
      g.fillStyle = glow;
      g.fillRect(0, 0, W, H);

      if (pal.rays) {
        const rand = rng32(7);
        g.save();
        g.globalCompositeOperation = "lighter";
        const R = Math.hypot(W, H) * 1.1;
        for (let i = 0; i < 6; i++) {
          const a = 0.32 + i * 0.13 + rand() * 0.05;
          const d = 0.015 + rand() * 0.03;
          const grad = g.createLinearGradient(lx, ly, lx + Math.cos(a) * R * 0.7, ly + Math.sin(a) * R * 0.7);
          grad.addColorStop(0, `rgba(${L.rgb},${pal.rays})`);
          grad.addColorStop(1, `rgba(${L.rgb},0)`);
          g.fillStyle = grad;
          g.beginPath();
          g.moveTo(lx, ly);
          g.lineTo(lx + Math.cos(a - d) * R, ly + Math.sin(a - d) * R);
          g.lineTo(lx + Math.cos(a + d) * R, ly + Math.sin(a + d) * R);
          g.fill();
        }
        g.restore();
      }

      const u = this.unit;
      if (pal.sun) {
        const sx = pal.sun.x * W, sy = pal.sun.y * H, sr = pal.sun.r * u * 2.2;
        const halo = g.createRadialGradient(sx, sy, sr * 0.6, sx, sy, sr * 5);
        halo.addColorStop(0, "rgba(255,214,160,0.55)");
        halo.addColorStop(1, "rgba(255,170,120,0)");
        g.fillStyle = halo;
        g.fillRect(0, 0, W, H);
        const disc = g.createRadialGradient(sx, sy - sr * 0.3, 0, sx, sy, sr);
        disc.addColorStop(0, "#fff4dc");
        disc.addColorStop(1, "#ffc98a");
        g.fillStyle = disc;
        circle(g, sx, sy, sr);
      }

      if (pal.moon) {
        const mx = pal.moon.x * W, my = pal.moon.y * H, mr = pal.moon.r * u * 2.2;
        const halo = g.createRadialGradient(mx, my, mr * 0.8, mx, my, mr * 6);
        halo.addColorStop(0, "rgba(200,214,255,0.28)");
        halo.addColorStop(1, "rgba(200,214,255,0)");
        g.fillStyle = halo;
        g.fillRect(0, 0, W, H);
        const disc = g.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, 0, mx, my, mr);
        disc.addColorStop(0, "#fbfdff");
        disc.addColorStop(1, "#c9d3f0");
        g.fillStyle = disc;
        circle(g, mx, my, mr);
        g.fillStyle = "rgba(150,165,210,0.35)";
        circle(g, mx + mr * 0.3, my - mr * 0.15, mr * 0.18);
        circle(g, mx - mr * 0.25, my + mr * 0.35, mr * 0.12);
        circle(g, mx + mr * 0.05, my + mr * 0.1, mr * 0.08);
      }
      return c;
    }

    renderBushes(bumps, colors, W, H, unit, dpr) {
      const margin = 40;
      const [c, g] = canvas(W + margin * 2, H, dpr);
      g.translate(margin, 0);
      bumps.forEach((b) => {
        const R = b.r * unit;
        const x = b.x * W, y = b.y * H;
        paintFoliage(g, x, y, R, colors, b.seed);
      });
      return { img: c, margin };
    }

    renderTree(pal) {
      const s = this.treeS, dpr = this.dpr;
      const w = s * 1.5, h = s * 2.1;
      const ox = w * 0.62, oy = h - s * 0.05; // trunk base inside sprite
      const [trunk, g] = canvas(w, h, dpr);
      g.translate(ox, oy);

      g.strokeStyle = pal.trunk[0];
      g.lineCap = "round";
      this.geo.branches.forEach(([x1, y1, x2, y2, wd]) => {
        g.lineWidth = wd * s;
        g.beginPath();
        g.moveTo(x1 * s, y1 * s);
        g.quadraticCurveTo(lerp(x1, x2, 0.5) * s, (lerp(y1, y2, 0.5) + 0.06) * s, x2 * s, y2 * s);
        g.stroke();
      });
      g.fillStyle = pal.trunk[0];
      g.beginPath();
      g.moveTo(-0.15 * s, 0.06 * s);
      g.quadraticCurveTo(-0.07 * s, -0.55 * s, -0.08 * s, -1.55 * s);
      g.lineTo(0.03 * s, -1.55 * s);
      g.quadraticCurveTo(0.03 * s, -0.55 * s, 0.15 * s, 0.06 * s);
      g.closePath();
      g.fill();
      g.strokeStyle = pal.trunk[1];
      g.lineWidth = s * 0.012;
      g.beginPath();
      g.moveTo(-0.11 * s, 0);
      g.quadraticCurveTo(-0.055 * s, -0.55 * s, -0.065 * s, -1.3 * s);
      g.stroke();

      const clusters = this.geo.clusters.map((cl) => {
        const R = cl.r * s * 1.2;
        const size = R * 2.5;
        const [c, cg] = canvas(size, size, dpr);
        paintFoliage(cg, size / 2, size / 2, R, pal.leaf, cl.seed);
        return { img: c, x: cl.x * s - size / 2, y: cl.y * s - size / 2, size, phase: cl.phase };
      });
      return { trunk, w, h, ox, oy, clusters };
    }

    initFireflies() {
      const rand = rng32(99);
      this.fireflies = Array.from({ length: 22 }, () => ({
        x: rand(), y: 0.62 + rand() * 0.34,
        vx: (rand() - 0.5) * 0.02, vy: (rand() - 0.5) * 0.02,
        p: rand() * TAU
      }));
      if (!this.glow) {
        const [c, g] = canvas(24, 24, 1);
        const grad = g.createRadialGradient(12, 12, 0, 12, 12, 12);
        grad.addColorStop(0, "rgba(240,255,170,1)");
        grad.addColorStop(0.25, "rgba(210,255,120,0.7)");
        grad.addColorStop(1, "rgba(180,255,90,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, 24, 24);
        this.glow = c;
      }
    }

    spawnFlock(x, y) {
      const n = 5 + Math.floor(Math.random() * 3);
      const dir = x > 0.6 ? -1 : 1;
      for (let i = 0; i < n; i++) {
        const row = Math.ceil(i / 2);
        const side = i % 2 ? 1 : -1;
        this.birds.push({
          x: x - dir * row * 0.025,
          y: Math.min(0.8, Math.max(0.08, y)) + side * row * 0.035,
          vx: dir * (0.05 + Math.random() * 0.012),
          vy: -0.006 - Math.random() * 0.01,
          s: 0.8 + Math.random() * 0.5,
          p: Math.random() * TAU
        });
      }
    }

    spawnShootingStar(x, y) {
      this.shooting.push({ x, y: Math.min(0.7, y), vx: 0.55 + Math.random() * 0.25, vy: 0.22 + Math.random() * 0.1, life: 1 });
    }

    kick(force) {
      const shouldRun = this.visible && this.active && !document.hidden && !this.reduced;
      if (shouldRun && !this.raf) {
        this.last = performance.now();
        this.raf = requestAnimationFrame(this.loop);
      } else if (!shouldRun && force && this.assets) {
        this.fade = 1;
        this.prev = null;
        this.draw(performance.now() / 1000);
      }
    }

    loop(now) {
      this.raf = 0;
      if (!(this.visible && this.active && !document.hidden && !this.reduced)) return;
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.update(dt);
      this.draw(now / 1000);
      this.raf = requestAnimationFrame(this.loop);
    }

    update(dt) {
      const m = this.mouse;
      m.x += (m.tx - m.x) * Math.min(1, dt * 3);
      m.y += (m.ty - m.y) * Math.min(1, dt * 3);

      if (this.prev) {
        this.fade = Math.min(1, this.fade + dt / 0.9);
        if (this.fade >= 1) this.prev = null;
      }

      const { W } = this;
      this.geo.clouds.forEach((cl, i) => {
        cl.x += (cl.speed * dt) / W;
        const sp = this.assets.clouds[i];
        if (cl.x * W + sp.ox > W + 60) cl.x = -(sp.w + sp.ox + 60) / W;
      });

      this.birds.forEach((b) => {
        b.x += b.vx * dt * 2;
        b.y += b.vy * dt * 2;
        b.p += dt * 11;
      });
      this.birds = this.birds.filter((b) => b.x > -0.1 && b.x < 1.1 && b.y > -0.1);

      this.shooting.forEach((s) => {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt * 1.1;
      });
      this.shooting = this.shooting.filter((s) => s.life > 0);

      if (this.mode === "night") {
        this.fireflies.forEach((f) => {
          f.vx += (Math.random() - 0.5) * dt * 0.02;
          f.vy += (Math.random() - 0.5) * dt * 0.02;
          f.vx = Math.max(-0.02, Math.min(0.02, f.vx));
          f.vy = Math.max(-0.015, Math.min(0.015, f.vy));
          f.x = (f.x + f.vx * dt + 1) % 1;
          f.y = Math.max(0.58, Math.min(0.98, f.y + f.vy * dt));
          f.p += dt * 2;
        });
        this.nextShoot -= dt;
        if (this.nextShoot <= 0) {
          this.spawnShootingStar(Math.random() * 0.5, Math.random() * 0.3);
          this.nextShoot = 6 + Math.random() * 8;
        }
      } else {
        this.nextBirds -= dt;
        if (this.nextBirds <= 0) {
          this.spawnFlock(Math.random() < 0.5 ? -0.02 : 1.02, 0.18 + Math.random() * 0.35);
          this.nextBirds = 10 + Math.random() * 10;
        }
      }
    }

    drawScene(A, t, alpha) {
      const { ctx, W, H } = this;
      const px = this.mouse.x - 0.5, py = this.mouse.y - 0.5;
      ctx.globalAlpha = alpha;
      ctx.drawImage(A.bg, 0, 0, W, H);

      if (A.pal.stars) {
        ctx.fillStyle = "#fff";
        this.geo.stars.forEach((s) => {
          ctx.globalAlpha = alpha * A.pal.stars * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.s + s.p)));
          ctx.fillRect(s.x * W - px * 6, s.y * H - py * 3, s.r, s.r);
        });
        ctx.globalAlpha = alpha;
      }

      this.geo.clouds.forEach((cl, i) => {
        const sp = A.clouds[i];
        ctx.globalAlpha = alpha * (cl.far ? A.pal.farAlpha : 1);
        ctx.drawImage(sp.img, cl.x * W + sp.ox - px * cl.depth * 36, cl.y * H + sp.oy - py * cl.depth * 14, sp.w, sp.h);
      });
      ctx.globalAlpha = alpha;

      const bb = A.bushBack;
      ctx.drawImage(bb.img, -bb.margin - px * 28, -py * 6, W + bb.margin * 2, H);

      const T = A.tree;
      const tx = W - this.treeS * 0.4 - px * 34;
      const ty = H - py * 8;
      ctx.drawImage(T.trunk, tx - T.ox, ty - T.oy, T.w, T.h);
      const sway = this.reduced ? 0 : 1;
      T.clusters.forEach((c) => {
        const dx = Math.sin(t * 0.9 + c.phase) * this.treeS * 0.008 * sway;
        const dy = Math.cos(t * 0.7 + c.phase) * this.treeS * 0.004 * sway;
        ctx.drawImage(c.img, tx + c.x + dx, ty + c.y + dy, c.size, c.size);
      });

      const bf = A.bushFront;
      ctx.drawImage(bf.img, -bf.margin - px * 40, -py * 8, W + bf.margin * 2, H);
      ctx.globalAlpha = 1;
    }

    draw(t) {
      if (!this.assets) return;
      const { ctx, W, H, dpr } = this;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (this.prev) this.drawScene(this.prev, t, 1);
      this.drawScene(this.assets, t, this.prev ? this.fade : 1);

      const pal = this.assets.pal;
      const px = this.mouse.x - 0.5;

      // birds
      ctx.strokeStyle = pal.bird;
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      this.birds.forEach((b) => {
        const x = b.x * W - px * 20, y = b.y * H;
        const s = 6 * b.s * (this.unit / 260 + 0.4);
        const flap = Math.sin(b.p) * s * 0.5;
        const dir = Math.sign(b.vx) || 1;
        ctx.beginPath();
        ctx.moveTo(x - s * dir, y - flap);
        ctx.quadraticCurveTo(x - s * 0.45 * dir, y - s * 0.35, x, y);
        ctx.quadraticCurveTo(x + s * 0.45 * dir, y - s * 0.35, x + s * dir, y - flap);
        ctx.stroke();
      });

      // shooting stars
      this.shooting.forEach((s) => {
        const x = s.x * W, y = s.y * H;
        const len = 90 * Math.max(0.3, s.life);
        const tail = ctx.createLinearGradient(x, y, x - s.vx * len, y - s.vy * len);
        tail.addColorStop(0, `rgba(255,255,255,${Math.min(1, s.life)})`);
        tail.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = tail;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - s.vx * len, y - s.vy * len);
        ctx.stroke();
      });

      // fireflies
      if (pal.fireflies && this.glow) {
        const a = this.prev ? this.fade : 1;
        this.fireflies.forEach((f) => {
          ctx.globalAlpha = a * (0.25 + 0.75 * (0.5 + 0.5 * Math.sin(f.p)));
          const size = 14 + 6 * Math.sin(f.p * 0.7);
          ctx.drawImage(this.glow, f.x * W - size / 2 - px * 40, f.y * H - size / 2, size, size);
        });
        ctx.globalAlpha = 1;
      }
    }
  }

  Sky.autoMode = () => {
    const h = new Date().getHours();
    if (h >= 7 && h < 17) return "day";
    if ((h >= 17 && h < 20) || (h >= 5 && h < 7)) return "sunset";
    return "night";
  };

  window.Sky = Sky;
})();
