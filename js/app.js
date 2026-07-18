/* =========================================================
   Who's the Best Car? — Application Engine
   One screen, one button: the five cars show their scores,
   glide into 1–5 order, and the winner gets the crown.
   ========================================================= */
"use strict";

/* ---------------- State ---------------- */
let lang = "ar";
let soundOn = true;
let running = false;
let compareStage = "idle"; /* idle | ranked */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const t = () => I18N[lang];
const carName = (car) => (lang === "ar" ? car.ar : car.en);
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const carTotal = (car) => +car.scores.reduce((a, b) => a + b, 0).toFixed(1);
const carOVR = (car) => Math.round(carTotal(car) * 2); /* /50 → /100 */
const rankedCars = () => FINAL_RANK_IDS.map((id) => CARS.find((c) => c.id === id));
const MEDALS = ["🥇", "🥈", "🥉", "4", "5"];

/* ---------------- Language ---------------- */
function applyLanguage(next) {
  lang = next;
  const html = document.documentElement;
  html.lang = lang;
  html.dir = t().dir;
  $$("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (t()[key] !== undefined) el.textContent = t()[key];
  });
  renderGrid(compareStage === "ranked");
  try { localStorage.setItem("uls-lang", lang); } catch (_) { /* storage blocked */ }
}

/* ---------------- Sounds (WebAudio, no assets) ---------------- */
let audioCtx = null;
function ctx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
function tone(freq, dur, type = "sine", gain = 0.05, when = 0) {
  if (!soundOn) return;
  try {
    const ac = ctx();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, ac.currentTime + when);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + when + dur);
    o.connect(g).connect(ac.destination);
    o.start(ac.currentTime + when);
    o.stop(ac.currentTime + when + dur + 0.05);
  } catch (_) { /* audio unavailable */ }
}
const sfx = {
  click: () => tone(660, 0.12, "triangle", 0.06),
  tick: () => tone(1180, 0.05, "sine", 0.025),
  whoosh: () => { tone(220, 0.35, "sawtooth", 0.02); tone(330, 0.3, "sine", 0.03, 0.05); },
  fanfare: () => {
    [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.5, "triangle", 0.07, i * 0.16));
    tone(196, 1.4, "sine", 0.05, 0.2);
  },
};

/* ---------------- Particles ---------------- */
function startParticles() {
  const canvas = $("#particles");
  const g = canvas.getContext("2d");
  let w, h;
  const N = 60;
  const ps = [];
  const resize = () => { w = canvas.width = innerWidth; h = canvas.height = innerHeight; };
  resize();
  addEventListener("resize", resize);
  for (let i = 0; i < N; i++) {
    ps.push({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      r: 0.6 + Math.random() * 1.8,
      vy: 0.12 + Math.random() * 0.4, vx: (Math.random() - 0.5) * 0.15,
      tw: Math.random() * Math.PI * 2, ts: 0.008 + Math.random() * 0.02,
    });
  }
  (function frame() {
    g.clearRect(0, 0, w, h);
    for (const p of ps) {
      p.y -= p.vy; p.x += p.vx; p.tw += p.ts;
      if (p.y < -8) { p.y = h + 8; p.x = Math.random() * w; }
      if (p.x < -8) p.x = w + 8; else if (p.x > w + 8) p.x = -8;
      const a = 0.25 + Math.sin(p.tw) * 0.22;
      g.beginPath();
      g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      g.fillStyle = `rgba(208, 214, 223, ${Math.max(a, 0.04)})`;
      g.fill();
    }
    requestAnimationFrame(frame);
  })();
}

/* ---------------- Confetti ---------------- */
let confettiPieces = [];
let confettiRunning = false;
function burstConfetti(count = 160) {
  const canvas = $("#confetti");
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const colors = ["#d4af37", "#f6dc8d", "#ffffff", "#c9ced6", "#8f97a2"];
  for (let i = 0; i < count; i++) {
    confettiPieces.push({
      x: innerWidth / 2 + (Math.random() - 0.5) * innerWidth * 0.55,
      y: innerHeight * (0.12 + Math.random() * 0.2),
      vx: (Math.random() - 0.5) * 11,
      vy: -(5 + Math.random() * 9),
      w: 5 + Math.random() * 7, h: 8 + Math.random() * 8,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.25,
      color: colors[(Math.random() * colors.length) | 0],
      life: 240,
    });
  }
  if (!confettiRunning) {
    confettiRunning = true;
    const g = canvas.getContext("2d");
    (function frame() {
      g.clearRect(0, 0, canvas.width, canvas.height);
      confettiPieces = confettiPieces.filter((p) => p.life > 0 && p.y < canvas.height + 30);
      for (const p of confettiPieces) {
        p.vy += 0.22; p.x += p.vx; p.y += p.vy;
        p.vx *= 0.992; p.rot += p.vr; p.life--;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.rot);
        g.globalAlpha = Math.min(1, p.life / 70);
        g.fillStyle = p.color;
        g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        g.restore();
      }
      if (confettiPieces.length) requestAnimationFrame(frame);
      else { confettiRunning = false; g.clearRect(0, 0, canvas.width, canvas.height); }
    })();
  }
}

/* ---------------- Car cards ---------------- */
function carCard(car, i, ranked) {
  const ovr = carOVR(car);
  const rank = ranked ? FINAL_RANK_IDS.indexOf(car.id) : -1;
  const stats = CATEGORIES.map((cat, ci) => {
    const v = Math.round(car.scores[ci] * 10);
    return `
      <div class="fstat" title="${lang === "ar" ? cat.ar : cat.en}">
        <span class="fs-icon">${cat.icon}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${ranked ? v : 0}%" data-w="${v}"></div></div>
        <span class="fs-val" data-target="${v}">${ranked ? v : 0}</span>
      </div>`;
  }).join("");
  return `
    <article class="fifa-card${ranked && rank === 0 ? " champ" : ""}" data-car="${car.id}"
             tabindex="0" role="button" aria-label="${carName(car)}"
             style="animation-delay:${i * 80}ms">
      <span class="rank-badge">${ranked ? MEDALS[rank] : ""}</span>
      ${ranked && rank === 0 ? `<span class="crown-mini">👑</span>` : ""}
      <div class="fifa-top">
        <div class="fifa-ovr">
          <span class="num" data-target="${ovr}">${ranked ? ovr : "؟"}</span>
          <span class="lbl">OVR</span>
        </div>
        ${logoHTML(car)}
      </div>
      ${photoHTML(car, "grid")}
      <h3>${carName(car)}</h3>
      <div class="fifa-stats">${stats}</div>
    </article>`;
}

function renderGrid(ranked = false) {
  const grid = $("#fifa-grid");
  const order = ranked ? rankedCars() : CARS;
  grid.classList.toggle("ranked", ranked);
  grid.innerHTML = order.map((car, i) => carCard(car, i, ranked)).join("");
  grid.querySelectorAll(".fifa-card").forEach((el) => {
    el.addEventListener("click", () => openModal(el.dataset.car));
    el.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openModal(el.dataset.car); }
    });
  });
  document.body.classList.toggle("won", ranked);
}

/* ---------------- Modal: big photo + scores, no reading required ---------------- */
function openModal(carId) {
  sfx.click();
  const car = CARS.find((c) => c.id === carId);
  const ovr = carOVR(car);
  const stats = CATEGORIES.map((cat, ci) => {
    const v = Math.round(car.scores[ci] * 10);
    return `
      <div class="mstat">
        <span class="ms-icon">${cat.icon}</span>
        <span class="ms-name">${lang === "ar" ? cat.ar : cat.en}</span>
        <div class="bar-track"><div class="bar-fill" style="width:0" data-w="${v}%"></div></div>
        <b class="ms-val">${v}</b>
      </div>`;
  }).join("");
  $("#modal-content").innerHTML = `
    <div class="modal-hero">
      ${logoHTML(car)}
      ${photoHTML(car, "modal")}
      <h2 class="gold-text">${carName(car)}</h2>
      <div class="modal-ovr"><span>${ovr}</span> OVR</div>
    </div>
    <div class="modal-stats">${stats}</div>`;
  $("#modal-backdrop").classList.add("open");
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() =>
    requestAnimationFrame(() =>
      $$("#modal-content .bar-fill").forEach((el) => (el.style.width = el.dataset.w))
    )
  );
}
function closeModal() {
  $("#modal-backdrop").classList.remove("open");
  document.body.style.overflow = "";
}

/* ---------------- Counters ---------------- */
function animateInt(el, target, dur) {
  const start = performance.now();
  (function step(now) {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased);
    if (p < 1) requestAnimationFrame(step);
  })(performance.now());
}

/* ---------------- One-click comparison ---------------- */
async function runComparison() {
  if (running) return;
  running = true;
  sfx.click();
  $("#compare-btn").disabled = true;

  /* 1 — scores pop on every card */
  sfx.whoosh();
  $$("#fifa-grid .fifa-card").forEach((cardEl, i) => {
    setTimeout(() => {
      cardEl.querySelectorAll(".fstat").forEach((row, j) => {
        const fill = row.querySelector(".bar-fill");
        const val = row.querySelector(".fs-val");
        setTimeout(() => {
          fill.style.width = `${fill.dataset.w}%`;
          animateInt(val, +fill.dataset.w, 600);
        }, j * 70);
      });
      const num = cardEl.querySelector(".fifa-ovr .num");
      animateInt(num, +num.dataset.target, 900);
      sfx.tick();
    }, i * 110);
  });
  await sleep(1600);

  /* 2 — cards glide into 1–5 order, crown lands, confetti */
  const grid = $("#fifa-grid");
  const cards = $$("#fifa-grid .fifa-card");
  const first = new Map(cards.map((c) => [c.dataset.car, c.getBoundingClientRect()]));
  rankedCars().forEach((car, i) => {
    const el = grid.querySelector(`.fifa-card[data-car="${car.id}"]`);
    grid.appendChild(el);
    el.querySelector(".rank-badge").textContent = MEDALS[i];
    if (i === 0) {
      el.classList.add("champ");
      el.insertAdjacentHTML("beforeend", `<span class="crown-mini">👑</span>`);
    }
  });
  grid.classList.add("ranked");
  cards.forEach((c) => {
    const f = first.get(c.dataset.car);
    const l = c.getBoundingClientRect();
    c.style.animation = "none";
    c.style.transition = "none";
    c.style.transform = `translate(${f.left - l.left}px, ${f.top - l.top}px)`;
  });
  void grid.offsetWidth;
  cards.forEach((c) => {
    c.style.transition = "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)";
    c.style.transform = "";
  });
  await sleep(850);

  compareStage = "ranked";
  document.body.classList.add("won");
  sfx.fanfare();
  burstConfetti(180);
  setTimeout(() => burstConfetti(110), 1200);
  running = false;
}

/* ---------------- Replay ---------------- */
function replay() {
  sfx.click();
  confettiPieces = [];
  compareStage = "idle";
  document.body.classList.remove("won");
  $("#compare-btn").disabled = false;
  renderGrid(false);
}

/* ---------------- Boot ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  let saved = null;
  try { saved = localStorage.getItem("uls-lang"); } catch (_) { /* storage blocked */ }
  applyLanguage(saved === "en" ? "en" : "ar");
  startParticles();
  resolveAllMedia();

  $("#lang-btn").addEventListener("click", () => {
    sfx.click();
    applyLanguage(lang === "ar" ? "en" : "ar");
  });
  $("#sound-btn").addEventListener("click", (e) => {
    soundOn = !soundOn;
    e.currentTarget.textContent = soundOn ? "🔊" : "🔇";
    if (soundOn) sfx.click();
  });
  $("#compare-btn").addEventListener("click", runComparison);
  $("#replay-btn").addEventListener("click", replay);
  $("#modal-backdrop").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  $("#modal-close").addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  setTimeout(() => $("#loader").classList.add("hidden"), 900);
});
