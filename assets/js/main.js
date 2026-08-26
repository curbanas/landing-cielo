/* CIELO APARTAMENTOS — interacciones
   Config primero: hasta que WHATSAPP no tenga la línea real de ventas,
   todos los CTA de WhatsApp caen al correo (mailto) para no perder leads. */

const CONFIG = {
  // Línea real de ventas en formato internacional, solo dígitos (ej: "573201234567").
  whatsappNumber: "573176387297", // línea de ventas de Cielo (+57 317 638 7297)
  email: "ventas@curbanas.com",
};

const WHATSAPP_PLACEHOLDER = "573200000000";
const whatsappReady =
  /^\d{10,15}$/.test(CONFIG.whatsappNumber) &&
  CONFIG.whatsappNumber !== WHATSAPP_PLACEHOLDER;

function contactHref(text) {
  if (whatsappReady) {
    return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
  }
  return `mailto:${CONFIG.email}?subject=${encodeURIComponent("Cielo Apartamentos — información")}&body=${encodeURIComponent(text)}`;
}

/* Enlaces con data-wa: abren WhatsApp (o correo) con mensaje prellenado.
   Mantienen el href="#visita" como destino si el navegador bloquea popups. */
document.querySelectorAll("[data-wa]").forEach((el) => {
  el.addEventListener("click", (e) => {
    const msg = el.getAttribute("data-wa-msg") || "Hola, quiero información de Cielo Apartamentos.";
    const url = contactHref(msg);
    e.preventDefault();
    window.open(url, "_blank", "noopener");
  });
});

/* ------------------------------------------------------- banda de marca
   El logo compacto del nav aparece cuando la banda del logo grande sale
   de cuadro (que es justo cuando el nav empieza a quedarse pegado).
   Va por IntersectionObserver, no por scroll: el rAF del motor es solo
   para animación. Si el navegador no soporta IO, nunca se pone .is-top
   y el logo compacto queda visible siempre. */
const brandrow = document.getElementById("brandrow");
const navBar = document.getElementById("nav");
if (brandrow && navBar && "IntersectionObserver" in window) {
  navBar.classList.add("is-top");
  new IntersectionObserver(
    ([entry]) => navBar.classList.toggle("is-top", entry.isIntersecting),
    { threshold: 0 }
  ).observe(brandrow);
}

/* -------------------------------------------------------------- drawer */
const drawer = document.getElementById("drawer");
const navToggle = document.getElementById("navToggle");

function setDrawer(open) {
  drawer.classList.toggle("is-open", open);
  drawer.setAttribute("aria-hidden", String(!open));
  navToggle.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
}
navToggle?.addEventListener("click", () => setDrawer(!drawer.classList.contains("is-open")));
document.getElementById("drawerClose")?.addEventListener("click", () => setDrawer(false));
drawer?.querySelectorAll("[data-close]").forEach((a) =>
  a.addEventListener("click", () => setDrawer(false))
);

/* -------------------------------------------------- hero toggle (tabs) */
const heroCopy = document.getElementById("heroCopy");
const heroTitle = document.getElementById("heroTitle");
const heroSub = document.getElementById("heroSub");
const tabVivir = document.getElementById("tabVivir");
const tabInvertir = document.getElementById("tabInvertir");

const HERO_COPY = {
  vivir: {
    title: "Vive, invierte y<br />respira más alto",
    sub: "Apartamentos de 70 a 116 m² sobre el Anillo Vial de Villavicencio. Desde $460 millones.",
  },
  invertir: {
    title: "Tu inversión,<br />en el punto más alto",
    sub: "Preventa sobre el Anillo Vial, con el respaldo de más de tres décadas de Construcciones Urbanas.",
  },
};

function setHero(mode) {
  const active = mode === "invertir" ? tabInvertir : tabVivir;
  const inactive = mode === "invertir" ? tabVivir : tabInvertir;
  active.classList.add("is-active");
  active.setAttribute("aria-selected", "true");
  inactive.classList.remove("is-active");
  inactive.setAttribute("aria-selected", "false");

  heroCopy.classList.remove("is-swapping");
  void heroCopy.offsetWidth; // reinicia la animación
  heroCopy.classList.add("is-swapping");
  heroTitle.innerHTML = HERO_COPY[mode].title;
  heroSub.textContent = HERO_COPY[mode].sub;
}
tabVivir?.addEventListener("click", () => setHero("vivir"));
tabInvertir?.addEventListener("click", () => setHero("invertir"));

/* ------------------------------------------------- contadores animados */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateCount(el) {
  const target = el.getAttribute("data-count");
  const decimal = target.includes(",");
  const end = parseFloat(target.replace(",", "."));
  if (reduceMotion) {
    el.textContent = target;
    return;
  }
  const dur = 1400;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = end * eased;
    el.textContent = decimal
      ? val.toFixed(2).replace(".", ",")
      : String(Math.round(val));
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}

const statsEl = document.getElementById("stats");
if (statsEl && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statsEl.querySelectorAll(".stat-num").forEach(animateCount);
          io.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );
  io.observe(statsEl);
} else if (statsEl) {
  statsEl.querySelectorAll(".stat-num").forEach((el) => {
    el.textContent = el.getAttribute("data-count");
  });
}

/* ========================================================== MOTION ENGINE
   Un solo rAF gobierna todo lo ligado al scroll (hero, carriles, deck,
   brand moments, odómetros, parallax); los reveals van por
   IntersectionObserver. El estado inicial se aplica desde aquí,
   nunca desde el CSS base: sin JS la página se ve completa — los
   crawlers de IA no ejecutan JavaScript. */

/* ---- 1. reveals diagonales con escalonado por grupo */
if ("IntersectionObserver" in window && !reduceMotion) {
  const MOTION_GROUPS = [
    {
      sel: ".split-copy h2, .zones-head h2, .deck-head h2, .backed > h2, .where-copy h2, .tour-copy h2, .faq-section > h2, .band-text h2, .visit-title, .typologies-head h2, .tour360-title, .schedule-title",
      variant: "motion-title",
    },
    {
      sel: ".intro-kicker, .intro-lede, .intro-note, .split-copy p, .zones-head p, .deck-head p, .backed p, .where-copy p, .tour-copy p, .visit-sub, .schedule-sub",
      variant: "",
    },
    { sel: ".stat, .faq-item, .where-chips li, .feature-group, .hero-backed", variant: "" },
    { sel: ".zitem, .znum, .typology-card", variant: "motion-up" },
    { sel: ".split-media, .backed-media, .where-map, .visit-form", variant: "motion-media" },
  ];

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-motion-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  MOTION_GROUPS.forEach(({ sel, variant }) => {
    document.querySelectorAll(sel).forEach((el) => {
      el.classList.add("is-motion-ready");
      if (variant) el.classList.add(variant);
      io.observe(el);
    });
  });

  // escalonado: los hermanos de una misma rejilla entran en cascada
  [".stats", ".zlane", ".where-chips", ".faq"].forEach((parentSel) => {
    document.querySelectorAll(parentSel).forEach((parent) => {
      [...parent.children].forEach((child, i) => {
        child.style.setProperty("--motion-delay", `${Math.min(i, 5) * 80}ms`);
      });
    });
  });

  /* Red de seguridad: el estado inicial de un reveal es opacity:0, así que
     si el observer nunca entrega (pestaña en segundo plano al cargar, fallo
     del motor) el contenido quedaría invisible. Pasados 4 s se revela todo
     lo pendiente: la animación es un adorno, el contenido no es negociable. */
  const failsafe = () => {
    document
      .querySelectorAll(".is-motion-ready:not(.is-motion-in)")
      .forEach((el) => el.classList.add("is-motion-in"));
  };
  setTimeout(failsafe, 4000);
  window.addEventListener("pagehide", failsafe);
}

/* ---- 2. odómetros: construye las columnas de dígitos (0-9) */
const odoTiles = [];
document.querySelectorAll("[data-odometer]").forEach((tile) => {
  const odo = tile.querySelector(".odo");
  if (!odo) return;
  const target = tile.getAttribute("data-odometer");
  if (reduceMotion) {
    odo.textContent = target;
    return;
  }
  odo.textContent = "";
  const digits = [];
  for (const ch of target) {
    if (/\d/.test(ch)) {
      const col = document.createElement("span");
      col.className = "odo-digit";
      const strip = document.createElement("span");
      strip.className = "odo-strip";
      for (let d = 0; d <= 9; d++) {
        const b = document.createElement("b");
        b.textContent = String(d);
        strip.appendChild(b);
      }
      col.appendChild(strip);
      odo.appendChild(col);
      digits.push({ strip, value: Number(ch) });
    } else {
      const sep = document.createElement("span");
      sep.className = "odo-sep";
      sep.textContent = ch;
      odo.appendChild(sep);
    }
  }
  odoTiles.push({ tile, digits });
});

/* ---- 3. scroll driver: un solo rAF para todo */
const heroStack = document.getElementById("heroStack");
const zonesGrid = document.getElementById("zonesGrid");
const zlanes = zonesGrid ? [...zonesGrid.querySelectorAll(".zlane")] : [];
const deckSlots = [...document.querySelectorAll(".deck-slot")];
const bmoments = [...document.querySelectorAll("[data-bm]")].map((sec) => ({
  sec,
  media: sec.querySelector("[data-bm-media]"),
  w1: sec.querySelector("[data-bm-w1]"),
  w2: sec.querySelector("[data-bm-w2]"),
}));
const pxInners = document.querySelectorAll(".px-inner");
const tourFloats = [...document.querySelectorAll("[data-float]")];

if (!reduceMotion) {
  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  let ticking = false;

  function onScroll() {
    const vh = window.innerHeight;

    // hero: fase A (escala del device) y fase B (palabra + caption)
    if (heroStack) {
      const range = heroStack.offsetHeight - vh;
      const raw = range > 0 ? clamp(-heroStack.getBoundingClientRect().top / range, 0, 1) : 0;
      const p2 = clamp((raw - 0.55) / 0.4, 0, 1);
      heroStack.style.setProperty("--p1", clamp(raw / 0.5, 0, 1).toFixed(4));
      heroStack.style.setProperty("--p2", p2.toFixed(4));
      heroStack.classList.toggle("is-cta", p2 > 0.6);
    }

    // zonas: carriles laterales suben más rápido que el central
    if (zonesGrid && zlanes.length) {
      const r = zonesGrid.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const t = clamp((vh - r.top) / (vh + r.height), 0, 1);
        zlanes.forEach((lane) => {
          const side = lane.dataset.zlane !== undefined;
          const travel = side ? -120 : -32;
          lane.style.setProperty("--zy", `${(t * travel).toFixed(1)}px`);
        });
      }
    }

    // odómetros: cada dígito rueda de 0 a su valor mientras la tile cruza
    odoTiles.forEach(({ tile, digits }) => {
      const r = tile.getBoundingClientRect();
      const p = clamp((vh * 0.92 - r.top) / (vh * 0.55), 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      digits.forEach(({ strip, value }) => {
        strip.style.setProperty("--od", (value * eased).toFixed(3));
      });
    });

    // deck: la card se escala/oscurece según cuánto la cubre la siguiente
    deckSlots.forEach((slot, i) => {
      const card = slot.querySelector(".deck-card");
      if (!card) return;
      const next = deckSlots[i + 1];
      if (!next) {
        card.style.setProperty("--c", "0");
        return;
      }
      const cr = card.getBoundingClientRect();
      const nr = next.getBoundingClientRect();
      const c = clamp((cr.bottom - nr.top) / (cr.height * 0.92), 0, 1);
      card.style.setProperty("--c", c.toFixed(3));
    });

    // brand moments: fondo en parallax y palabras cruzándose (±)
    bmoments.forEach(({ sec, media, w1, w2 }) => {
      const r = sec.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      const t = clamp((vh - r.top) / (vh + r.height), 0, 1) * 2 - 1; // -1..1
      const shift = Math.min(280, window.innerWidth * 0.22);
      if (media) media.style.setProperty("--bmy", `${(t * r.height * 0.1).toFixed(1)}px`);
      if (w1) w1.style.setProperty("--bm1x", `${(t * shift).toFixed(1)}px`);
      if (w2) w2.style.setProperty("--bm2x", `${(-t * shift).toFixed(1)}px`);
    });

    // parallax: el inner (128% de alto) se desplaza dentro del marco
    pxInners.forEach((inner) => {
      const frame = inner.parentElement;
      const r = frame.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const t = clamp((vh - r.top) / (vh + r.height), 0, 1); // 0..1
        const travel = inner.offsetHeight - frame.offsetHeight;
        inner.style.transform = `translate3d(0, ${-travel * t}px, 0)`;
      }
    });

    // tour: los renders flotan en direcciones opuestas
    tourFloats.forEach((img) => {
      const r = img.closest(".tour").getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const t = clamp((vh - r.top) / (vh + r.height), 0, 1);
        const dir = Number(img.dataset.float || 1);
        img.style.setProperty("--fy", `${((t - 0.5) * dir * 56).toFixed(1)}px`);
      }
    });

    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
  // Con la pestaña en segundo plano rAF se pausa; al volver, el flag podría
  // quedar atascado y congelar el scroll. Se resincroniza al reactivarse.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      ticking = false;
      onScroll();
    }
  });
  // expuesto para poder verificar el motor desde herramientas
  window.__cieloSync = () => { ticking = false; onScroll(); };
  onScroll();
}

/* --------------------------------------------------- formulario → WhatsApp */
const form = document.getElementById("visitForm");
form?.addEventListener("submit", (e) => {
  e.preventDefault();

  let valid = true;
  form.querySelectorAll("[required]").forEach((field) => {
    const ok = field.type === "checkbox" ? field.checked : field.checkValidity();
    field.classList.toggle("is-invalid", !ok);
    if (!ok) valid = false;
  });
  if (!valid) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const msg = [
    "Hola, quiero agendar una visita al apartamento modelo de Cielo.",
    `Nombre: ${data.get("nombre")}`,
    `Celular: +57 ${data.get("celular")}`,
    `Email: ${data.get("email")}`,
    `Tipología de interés: ${data.get("tipologia")}`,
  ].join("\n");

  window.open(contactHref(msg), "_blank", "noopener");
});

/* Los campos limpian su estado de error al corregirse */
form?.querySelectorAll("input, select").forEach((field) => {
  field.addEventListener("input", () => field.classList.remove("is-invalid"));
});
