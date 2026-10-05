/* CIELO APARTAMENTOS — interacciones
   Config primero: hasta que WHATSAPP no tenga la línea real de ventas,
   todos los CTA de WhatsApp caen al correo (mailto) para no perder leads. */

const CONFIG = {
  // Línea real de ventas en formato internacional, solo dígitos (ej: "573201234567").
  whatsappNumber: "573332889545", // línea de ventas de Cielo (+57 333 288 9545)
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
    sub: "Apartamentos de 70 a 117 m² sobre el Anillo Vial de Villavicencio.",
  },
  invertir: {
    title: "Tu inversión,<br />en el punto más alto",
    sub: "Preventa sobre el Anillo Vial, con el respaldo de los 37 años de Construcciones Urbanas.",
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

/* ---- firma (2,65 m y precio): al entrar en pantalla los dos números
   cuentan desde cero y la regla de la escena crece hasta el techo. */
const firmaEl = document.querySelector(".firma");
if (firmaEl && "IntersectionObserver" in window) {
  const fio = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      firmaEl.classList.add("is-in");
      firmaEl.querySelectorAll("[data-count]").forEach(animateCount);
      fio.disconnect();
    },
    { threshold: 0.3 }
  );
  fio.observe(firmaEl);
} else if (firmaEl) {
  firmaEl.classList.add("is-in");
}

/* ---- espacio flexible: la palabra del titular rota entre usos */
document.querySelectorAll(".flexi-word[data-words]").forEach((el) => {
  const words = el.dataset.words.split("|");
  if (reduceMotion || words.length < 2) return;
  let i = 0;
  setInterval(() => {
    el.classList.add("is-out");
    setTimeout(() => {
      i = (i + 1) % words.length;
      el.textContent = words[i];
      el.classList.remove("is-out");
    }, 320);
  }, 2600);
});

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
      sel: ".split-copy h2, .zones-head h2, .deck-head h2, .backed > h2, .where-head h2, .tour-copy h2, .faq-section > h2, .band-text h2, .visit-title, .typologies-head h2, .tour360-title, .schedule-title",
      variant: "motion-title",
    },
    {
      sel: ".sec-kicker, .band-points, .intro-kicker, .intro-claim, .intro-lede, .split-copy p, .zones-head p, .deck-head p, .backed-body p, .where-head p, .tour-copy p, .typologies-head p, .visit-sub, .schedule-sub",
      variant: "",
    },
    { sel: ".stat, .faq-item, .where-facts li, .backed-facts div, .hero2-keys li, .intro-keys li, .cuarto-list li", variant: "" },
    { sel: ".typology-card", variant: "motion-up" },
    { sel: ".modelo-gal, .flexi-fig, .backed-media, .where-photo, .visit-form", variant: "motion-media" },
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
  [".stats", ".where-facts", ".cuarto-list", ".backed-facts", ".ed-duo", ".faq"].forEach((parentSel) => {
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
// brand moments: la página ya no usa el formato de fondo oscuro con
// palabras cruzándose; las dos secciones que lo usaban se reemplazaron
// por piezas de marca y por la planta de implantación.
const tourFloats = [...document.querySelectorAll("[data-float]")];
const zoomEls = [...document.querySelectorAll("[data-zoom]")];
const slideEls = [...document.querySelectorAll("[data-slide]")];

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

    // renders que flotan en direcciones opuestas: los del recorrido 360
    // (.tour) y los del apartamento modelo (.split). El scope se busca
    // entre ambos porque cada sección tiene su propio alto de referencia.
    tourFloats.forEach((el) => {
      const scope = el.closest(".tour, .split, .backed");
      if (!scope) return;
      const r = scope.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const t = clamp((vh - r.top) / (vh + r.height), 0, 1);
        const dir = Number(el.dataset.float || 1);
        // amplitud por elemento: 56px sirve en secciones cortas, pero en
        // bloques altos ese recorrido se diluye y no se percibe.
        const amp = Number(el.dataset.floatAmp || 56);
        el.style.setProperty("--fy", `${((t - 0.5) * dir * amp).toFixed(1)}px`);
      }
    });

    // zoom ligado al scroll: la imagen crece mientras la sección atraviesa
    // la pantalla, el mismo recurso que la tarjeta del hero. --zg va de 0
    // a 1 y el CSS decide cuánto crece.
    zoomEls.forEach((el) => {
      const scope = el.closest("[data-zoom-scope]") || el.parentElement;
      if (!scope) return;
      const r = scope.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const t = clamp((vh - r.top) / (vh + r.height), 0, 1);
        el.style.setProperty("--zg", t.toFixed(3));
      }
    });

    // palabras que se cruzan: entran desde lados opuestos con el scroll.
    // --sx va de -amp a +amp según la dirección de cada una.
    slideEls.forEach((el) => {
      const scope = el.closest("[data-slide-scope]") || el.parentElement;
      if (!scope) return;
      const r = scope.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      const t = clamp((vh - r.top) / (vh + r.height), 0, 1) * 2 - 1; // -1..1
      const dir = Number(el.dataset.slide || 1);
      const amp = Math.min(260, window.innerWidth * 0.2);
      el.style.setProperty("--sx", `${(t * dir * amp).toFixed(1)}px`);
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

/* ------------------------------------------------ zonas sociales
   Pestañas: alternan el panel visible, en escritorio y en celular. Con
   las flechas del teclado se pasa de una a otra. */
(function () {
  const tabsEl = document.getElementById("zoneTabs");
  const track = document.getElementById("zonePanels");
  if (!tabsEl || !track) return;
  const tabs = [...tabsEl.querySelectorAll(".ztab")];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));

  function go(i) {
    tabs.forEach((t, k) => {
      const on = k === i;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      panels[k].classList.toggle("is-active", on);
    });
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => go(i));
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const n = (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
      go(n);
      tabs[n].focus();
    });
  });
  go(Math.max(0, tabs.findIndex((t) => t.classList.contains("is-active"))));

  /* Enlaces a un ambiente concreto (el desplegable "Zonas sociales" del
     menú y el del menú móvil): abren su pestaña y bajan a la sección. El
     panel de destino puede estar oculto, así que el salto por ancla del
     navegador no serviría. También cubre llegar con #zona-… en la URL. */
  const section = document.getElementById("zonas");
  function openByHash(hash, smooth) {
    const i = panels.findIndex((p) => p && "#" + p.id === hash);
    if (i < 0) return false;
    go(i);
    section?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    return true;
  }
  document.querySelectorAll('a[href^="#zona-"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      if (openByHash(a.getAttribute("href"), !reduceMotion)) e.preventDefault();
    });
  });
  if (location.hash) openByHash(location.hash, false);
})();

/* -------------------------------------------- zonas y visor por ambiente
   Cada panel con [data-zviewer] muestra un render a la vez. Las zonas y
   las miniaturas con data-zimg cambian el render; las zonas que
   pertenecen al render visible quedan resaltadas. */
document.querySelectorAll("[data-zviewer]").forEach((viewer) => {
  const panel = viewer.closest(".zpanel") || viewer;
  const figs = [...viewer.querySelectorAll("[data-zfig]")];
  const triggers = [...panel.querySelectorAll("[data-zimg]")];
  function show(key) {
    figs.forEach((f) => f.classList.toggle("is-shown", f.dataset.zfig === key));
    triggers.forEach((t) => {
      const on = t.dataset.zimg === key;
      t.classList.toggle("is-on", on);
      if (t.tagName === "BUTTON") t.setAttribute("aria-pressed", String(on));
    });
  }
  triggers.forEach((t) => t.addEventListener("click", () => show(t.dataset.zimg)));
  const first = figs.find((f) => f.classList.contains("is-shown")) || figs[0];
  if (first) show(first.dataset.zfig);
});

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
