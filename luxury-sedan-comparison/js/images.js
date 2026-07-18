/* =========================================================
   Real car photos & official brand logos
   Resolved at runtime from the Wikimedia Commons API (CORS-
   enabled, keys not required). Every image keeps the local
   SVG render/emblem as an automatic fallback, so the site
   still looks premium if the network is unavailable.
   ========================================================= */
"use strict";

const CAR_MEDIA = {}; /* carId -> { photo, logo } */
const MEDIA_CACHE_KEY = "uls-media-v2";
const MEDIA_CACHE_TTL = 7 * 24 * 3600 * 1000;

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

function commonsSearch(query, fileType, width) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrsearch: `${query} filetype:${fileType}`,
    gsrnamespace: "6",
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url|mime",
    iiurlwidth: String(width),
  });
  return fetch(`${COMMONS_API}?${params}`, { mode: "cors" })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
}

function pickBest(json, mimes) {
  if (!json || !json.query || !json.query.pages) return null;
  const pages = Object.values(json.query.pages).sort(
    (a, b) => (a.index || 99) - (b.index || 99)
  );
  for (const p of pages) {
    const info = p.imageinfo && p.imageinfo[0];
    if (info && mimes.includes(info.mime)) {
      return info.thumburl || info.url;
    }
  }
  return null;
}

async function resolveCarMedia(car) {
  const [photoJson, logoJson] = await Promise.all([
    commonsSearch(car.photoQuery, "bitmap", 1000),
    commonsSearch(car.logoQuery, "drawing|bitmap", 320),
  ]);
  const photo = pickBest(photoJson, ["image/jpeg", "image/png", "image/webp"]);
  const logo = pickBest(logoJson, ["image/svg+xml", "image/png", "image/jpeg"]);
  const media = {};
  if (photo) media.photo = photo;
  if (logo) media.logo = logo;
  return media;
}

async function resolveAllMedia() {
  /* cached from a previous visit? */
  try {
    const cached = JSON.parse(localStorage.getItem(MEDIA_CACHE_KEY));
    if (cached && Date.now() - cached.ts < MEDIA_CACHE_TTL && cached.data) {
      Object.assign(CAR_MEDIA, cached.data);
      applyMedia();
      return;
    }
  } catch (_) { /* no cache */ }

  const results = await Promise.allSettled(
    CARS.map(async (car) => {
      const media = await resolveCarMedia(car);
      if (media.photo || media.logo) {
        CAR_MEDIA[car.id] = media;
        applyMedia(car.id);
      }
    })
  );
  void results;
  try {
    localStorage.setItem(MEDIA_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: CAR_MEDIA }));
  } catch (_) { /* storage blocked */ }
}

/* ---------- markup helpers (used by app.js renderers) ---------- */
function photoHTML(car, uid) {
  const m = CAR_MEDIA[car.id];
  const inner = m && m.photo
    ? `<img class="car-photo" loading="lazy" src="${m.photo}" alt="${car.en}"
         onerror="this.closest('.car-media').innerHTML = carSVG(CARS.find(c=>c.id==='${car.id}'),'${uid}f')">`
    : carSVG(car, uid);
  return `<div class="car-media" data-photo="${car.id}" data-uid="${uid}">${inner}</div>`;
}

function logoHTML(car) {
  const m = CAR_MEDIA[car.id];
  const inner = m && m.logo
    ? `<img class="brand-logo" loading="lazy" src="${m.logo}" alt="${car.brandEn}"
         onerror="this.closest('.emblem').innerHTML = EMBLEMS['${car.id}']">`
    : (EMBLEMS[car.id] || "");
  return `<span class="emblem" data-logo="${car.id}">${inner}</span>`;
}

/* Patch any already-rendered placeholders once real media arrives */
function applyMedia(onlyId) {
  for (const [id, media] of Object.entries(CAR_MEDIA)) {
    if (onlyId && id !== onlyId) continue;
    const car = CARS.find((c) => c.id === id);
    if (media.photo) {
      document.querySelectorAll(`.car-media[data-photo="${id}"]`).forEach((el) => {
        if (!el.querySelector("img.car-photo")) {
          const uid = el.dataset.uid || "x";
          el.innerHTML = `<img class="car-photo" loading="lazy" src="${media.photo}" alt="${car.en}"
            onerror="this.closest('.car-media').innerHTML = carSVG(CARS.find(c=>c.id==='${id}'),'${uid}f')">`;
        }
      });
    }
    if (media.logo) {
      document.querySelectorAll(`.emblem[data-logo="${id}"]`).forEach((el) => {
        if (!el.querySelector("img.brand-logo")) {
          el.innerHTML = `<img class="brand-logo" loading="lazy" src="${media.logo}" alt="${car.brandEn}"
            onerror="this.closest('.emblem').innerHTML = EMBLEMS['${id}']">`;
        }
      });
    }
  }
}
