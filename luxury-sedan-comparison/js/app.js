/* =========================================================
   Ultimate Luxury Sedan Comparison — Application Engine
   ========================================================= */
"use strict";

/* ---------------- State ---------------- */
let lang = "ar";
let soundOn = true;
let running = false;
let skipRequested = false;
let totals = Object.fromEntries(CARS.map((c) => [c.id, 0]));

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const t = () => I18N[lang];
const carName = (car) => (lang === "ar" ? car.ar : car.en);
const sleep = (ms) =>
  new Promise((res) => {
    const target = skipRequested ? Math.min(ms, 40) : ms;
    setTimeout(res, target);
  });
const fmt = (n) => n.toFixed(1);

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
  renderCards();
  renderBarsLabels();
  renderStandings(false);
  renderFinaleTexts();
  localStorage.setItem("uls-lang", lang);
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
  win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.4, "triangle", 0.06, i * 0.13)); },
  fanfare: () => {
    [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.5, "triangle", 0.07, i * 0.16));
    tone(196, 1.4, "sine", 0.05, 0.2);
  },
  drum: () => { for (let i = 0; i < 14; i++) tone(90 + Math.random() * 30, 0.08, "square", 0.03, i * 0.09); },
};

/* ---------------- Particles ---------------- */
function startParticles() {
  const canvas = $("#particles");
  const g = canvas.getContext("2d");
  let w, h;
  const N = 70;
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
      g.fillStyle = `rgba(224, 190, 100, ${Math.max(a, 0.04)})`;
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
  const colors = ["#d4af37", "#f6dc8d", "#ffffff", "#b8912e", "#e8e6df"];
  for (let i = 0; i < count; i++) {
    confettiPieces.push({
      x: innerWidth / 2 + (Math.random() - 0.5) * innerWidth * 0.55,
      y: innerHeight * (0.15 + Math.random() * 0.2),
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
function renderCards() {
  const grid = $("#cars-grid");
  grid.innerHTML = CARS.map(
    (car) => `
    <article class="car-card" data-car="${car.id}" tabindex="0" role="button"
             aria-label="${carName(car)}">
      <div class="card-top">
        ${emblemSVG(car.id)}
        <span class="card-rank-chip">${lang === "ar" ? car.brandAr : car.brandEn}</span>
      </div>
      ${carSVG(car, "card")}
      <h3>${carName(car)}</h3>
      <div class="card-color">
        <span class="swatch" style="background:${car.color}"></span>
        <span>${lang === "ar" ? car.colorAr : car.colorEn}</span>
      </div>
      <div class="card-cta">${lang === "ar" ? "اضغط لعرض المواصفات ←" : "Click for full specs →"}</div>
    </article>`
  ).join("");

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        const idx = [...grid.children].indexOf(e.target);
        setTimeout(() => e.target.classList.add("in-view"), (idx % 5) * 90);
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.15 }
  );
  $$(".car-card").forEach((el) => {
    io.observe(el);
    el.addEventListener("click", () => openModal(el.dataset.car));
    el.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openModal(el.dataset.car); }
    });
  });
}

/* ---------------- Modal ---------------- */
function openModal(carId) {
  sfx.click();
  const car = CARS.find((c) => c.id === carId);
  const T = t();
  const overall = car.scores.reduce((a, b) => a + b, 0) / car.scores.length;
  const list = (items) => items.map((x) => `<li>${x}</li>`).join("");
  $("#modal-content").innerHTML = `
    <div class="modal-hero">
      ${emblemSVG(car.id)}
      ${carSVG(car, "modal")}
      <h2 class="gold-text">${carName(car)}</h2>
      <div class="m-color">
        <span class="swatch" style="background:${car.color}"></span>
        ${lang === "ar" ? car.colorAr : car.colorEn}
      </div>
    </div>
    <div class="spec-grid">
      <div class="spec-cell"><div class="sv">${car.specs.hp.toLocaleString("en-US")}</div><div class="sk">${T.horsepower} (${T.hpUnit})</div></div>
      <div class="spec-cell"><div class="sv">${car.specs.torque.toLocaleString("en-US")}</div><div class="sk">${T.torque} (${T.nmUnit})</div></div>
      <div class="spec-cell"><div class="sv" style="font-size:1rem;line-height:1.4">${lang === "ar" ? car.specs.engineAr : car.specs.engineEn}</div><div class="sk">${T.engine}</div></div>
      <div class="spec-cell"><div class="sv">${car.specs.topSpeed}</div><div class="sk">${T.topSpeed} (${T.kmh})</div></div>
      <div class="spec-cell"><div class="sv">${car.specs.accel}</div><div class="sk">${T.accel} (${T.sec})</div></div>
      <div class="spec-cell"><div class="sv" style="font-size:1.05rem">${lang === "ar" ? car.specs.priceAr : car.specs.priceEn}</div><div class="sk">${T.price}</div></div>
    </div>
    <div class="pros-cons">
      <div class="pc-box pros"><h4>✓ ${T.pros}</h4><ul>${list(lang === "ar" ? car.prosAr : car.prosEn)}</ul></div>
      <div class="pc-box cons"><h4>✗ ${T.cons}</h4><ul>${list(lang === "ar" ? car.consAr : car.consEn)}</ul></div>
    </div>
    <div class="modal-scores">
      ${modalScore(T.luxuryScore, car.scores[0])}
      ${modalScore(T.techScore, car.scores[4])}
      ${modalScore(T.overallScore, overall)}
    </div>`;
  $("#modal-backdrop").classList.add("open");
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() =>
    requestAnimationFrame(() =>
      $$("#modal-content .mscore .bar-fill").forEach((el) => (el.style.width = el.dataset.w))
    )
  );
}
function modalScore(label, val) {
  return `
    <div class="mscore">
      <span>${label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:0" data-w="${val * 10}%"></div></div>
      <strong style="color:var(--gold-light)">${fmt(val)}</strong>
    </div>`;
}
function closeModal() {
  $("#modal-backdrop").classList.remove("open");
  document.body.style.overflow = "";
}

/* ---------------- Arena: score bars ---------------- */
function renderBarsLabels() {
  const wrap = $("#bars");
  if (!wrap) return;
  wrap.innerHTML = CARS.map(
    (car) => `
    <div class="bar-row" data-car="${car.id}">
      <div class="bar-label">
        <span class="dot" style="background:${car.color}"></span>
        <span class="bl-name">${carName(car)}</span>
      </div>
      <div class="bar-track"><div class="bar-fill"></div></div>
      <div class="bar-score">0.0</div>
    </div>`
  ).join("");
}

/* ---------------- Live standings (animated leaderboard) ---------------- */
const ROW_H = 52;
function renderStandings(animate = true) {
  const listEl = $("#standings-list");
  if (!listEl) return;
  const order = [...CARS].sort((a, b) => totals[b.id] - totals[a.id] || a.en.localeCompare(b.en));
  listEl.style.height = `${CARS.length * ROW_H - 8}px`;
  if (!listEl.children.length) {
    listEl.innerHTML = CARS.map(
      (car) => `
      <div class="standing-row" data-car="${car.id}">
        <span class="pos"></span>
        <span class="name"></span>
        <span class="pts">0.0</span>
      </div>`
    ).join("");
  }
  order.forEach((car, rank) => {
    const row = listEl.querySelector(`[data-car="${car.id}"]`);
    if (!animate) row.style.transition = "none";
    row.style.transform = `translateY(${rank * ROW_H}px)`;
    row.querySelector(".pos").textContent = rank + 1;
    row.querySelector(".name").textContent = carName(car);
    row.querySelector(".pts").textContent = fmt(totals[car.id]);
    row.classList.toggle("top1", rank === 0 && totals[car.id] > 0);
    if (!animate) requestAnimationFrame(() => (row.style.transition = ""));
  });
}

/* ---------------- The comparison show ---------------- */
async function runComparison() {
  if (running) return;
  running = true;
  skipRequested = false;
  totals = Object.fromEntries(CARS.map((c) => [c.id, 0]));

  sfx.click();
  $("#arena").classList.add("active");
  $("#finale").classList.remove("active", "finale-won");
  $("#compare-btn").disabled = true;
  renderBarsLabels();
  $("#standings-list").innerHTML = "";
  renderStandings(false);
  $("#arena").scrollIntoView({ behavior: "smooth", block: "start" });
  await sleep(900);

  for (let ci = 0; ci < CATEGORIES.length; ci++) {
    if (!running) return;
    const cat = CATEGORIES[ci];
    const banner = $("#category-banner");
    banner.classList.remove("cat-anim");
    void banner.offsetWidth; /* restart animation */
    banner.classList.add("cat-anim");
    $("#cat-icon").textContent = cat.icon;
    $("#cat-name").textContent = lang === "ar" ? cat.ar : cat.en;
    $("#cat-count").textContent = `${ci + 1} ${t().of} ${CATEGORIES.length}`;
    $("#progress-fill").style.width = `${((ci + 1) / CATEGORIES.length) * 100}%`;
    sfx.whoosh();

    /* reset bars */
    $$("#bars .bar-row").forEach((row) => {
      row.classList.remove("winner");
      row.querySelector(".bar-fill").style.width = "0%";
      row.querySelector(".bar-score").textContent = "0.0";
      const badge = row.querySelector(".win-badge");
      if (badge) badge.remove();
    });
    await sleep(450);

    /* animate all bars with stagger + counters */
    const best = Math.max(...CARS.map((c) => c.scores[ci]));
    CARS.forEach((car, i) => {
      const row = $(`#bars .bar-row[data-car="${car.id}"]`);
      const fill = row.querySelector(".bar-fill");
      const scoreEl = row.querySelector(".bar-score");
      setTimeout(() => {
        fill.style.width = `${car.scores[ci] * 10}%`;
        animateCounter(scoreEl, car.scores[ci], skipRequested ? 80 : 850);
        if (i % 3 === 0) sfx.tick();
      }, skipRequested ? 0 : i * 65);
    });
    await sleep(1500);

    /* crown category winner(s) */
    CARS.forEach((car) => {
      if (car.scores[ci] === best) {
        const row = $(`#bars .bar-row[data-car="${car.id}"]`);
        row.classList.add("winner");
        row.querySelector(".bl-name").insertAdjacentHTML(
          "afterend", `<span class="win-badge">★ ${t().winnerTag}</span>`
        );
      }
    });
    sfx.tick();
    await sleep(650);

    /* award points, refresh leaderboard */
    CARS.forEach((car) => { totals[car.id] = +(totals[car.id] + car.scores[ci]).toFixed(1); });
    renderStandings(true);
    await sleep(1000);
  }

  await sleep(400);
  await runFinale();
  running = false;
}

function animateCounter(el, target, dur) {
  const start = performance.now();
  (function step(now) {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(target * eased);
    if (p < 1) requestAnimationFrame(step);
  })(performance.now());
}

/* ---------------- Finale: suspense + podium ---------------- */
function rankedCars() {
  return FINAL_RANK_IDS.map((id) => CARS.find((c) => c.id === id));
}

async function runFinale() {
  const finale = $("#finale");
  finale.classList.add("active");
  renderFinaleTexts();
  finale.scrollIntoView({ behavior: "smooth", block: "start" });
  sfx.drum();
  await sleep(1400);

  /* reveal 10th → 4th */
  const ranked = rankedCars();
  const listEl = $("#reveal-list");
  listEl.innerHTML = "";
  for (let pos = 9; pos >= 3; pos--) {
    const car = ranked[pos];
    listEl.insertAdjacentHTML(
      "afterbegin",
      `<div class="reveal-row" data-car="${car.id}">
         <span class="rr-pos">#${pos + 1}</span>
         ${emblemSVG(car.id)}
         <span class="rr-name">${carName(car)}</span>
         <span class="pts">${fmt(totals[car.id])} ${t().points}</span>
       </div>`
    );
    const row = listEl.querySelector(`[data-car="${car.id}"]`);
    requestAnimationFrame(() => requestAnimationFrame(() => row.classList.add("shown")));
    sfx.tick();
    await sleep(pos > 5 ? 700 : 1000);
  }

  await sleep(600);
  sfx.drum();
  await sleep(skipRequested ? 200 : 1500);

  /* podium: 3rd (Rolls, right) → 2nd (BMW, left) → champion */
  buildPodium();
  $(".slot-3").classList.add("shown");
  sfx.win();
  await sleep(1300);
  $(".slot-2").classList.add("shown");
  sfx.win();
  await sleep(1600);

  $(".slot-1").classList.add("shown");
  await sleep(650);
  finale.classList.add("finale-won");
  sfx.fanfare();
  burstConfetti(220);
  setTimeout(() => burstConfetti(120), 1300);
  setTimeout(() => burstConfetti(90), 2800);
  $("#compare-btn").disabled = false;
}

function buildPodium() {
  const ranked = rankedCars();
  const [first, second, third] = ranked;
  const slot = (car, cls, block, extras = "") => `
    <div class="podium-slot ${cls}">
      <div class="podium-car">
        ${extras}
        ${carSVG(car, cls)}
      </div>
      <div class="p-name">${carName(car)}</div>
      <div class="p-pts">${fmt(totals[car.id])} ${t().points}</div>
      <div class="podium-block">${block}</div>
    </div>`;
  /* visual order fixed LTR: BMW left, Mercedes center, Rolls right */
  $("#podium").innerHTML =
    slot(second, "slot-2", "🥈2") +
    slot(first, "slot-1", "🥇1", `<span class="crown">👑</span><span class="champion-glow"></span>`) +
    slot(third, "slot-3", "🥉3");

  $("#final-table-list").innerHTML = ranked.map(
    (car, i) => `
    <div class="reveal-row shown" style="transition:none">
      <span class="rr-pos">${i < 3 ? t().medals[i] : "#" + (i + 1)}</span>
      ${emblemSVG(car.id)}
      <span class="rr-name">${carName(car)}</span>
      <span class="pts">${fmt(totals[car.id])} ${t().points}</span>
    </div>`
  ).join("");
}

function renderFinaleTexts() {
  if (!$("#finale").classList.contains("active")) return;
  if ($("#podium").children.length) buildPodium();
  /* re-render reveal list in current language */
  $$("#reveal-list .reveal-row").forEach((row) => {
    const car = CARS.find((c) => c.id === row.dataset.car);
    if (car) {
      row.querySelector(".rr-name").textContent = carName(car);
      row.querySelector(".pts").textContent = `${fmt(totals[car.id])} ${t().points}`;
    }
  });
}

/* ---------------- Replay ---------------- */
function replay() {
  sfx.click();
  confettiPieces = [];
  $("#finale").classList.remove("active", "finale-won");
  $("#podium").innerHTML = "";
  $("#reveal-list").innerHTML = "";
  $("#final-table-list").innerHTML = "";
  running = false;
  runComparison();
}

/* ---------------- Boot ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("uls-lang");
  applyLanguage(saved === "en" ? "en" : "ar");
  startParticles();

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
  $("#skip-btn").addEventListener("click", () => { skipRequested = true; sfx.click(); });
  $("#replay-btn").addEventListener("click", replay);
  $("#modal-backdrop").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  $("#modal-close").addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  /* loader */
  setTimeout(() => $("#loader").classList.add("hidden"), 1400);
});
