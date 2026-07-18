# 👑 Ultimate Luxury Sedan Comparison — المقارنة المطلقة لسيارات السيدان الفاخرة

A premium, single-page interactive experience comparing the world's top ten luxury
executive sedans — styled like an Apple keynote crossed with Top Gear and
Formula 1 timing graphics. **Arabic by default (RTL)** with a one-click English toggle.

## ✨ Features

- **14 animated comparison categories** with staggered score bars, smooth counters and per-category winner highlights
- **Live animated leaderboard** that reorders in real time as points are awarded
- **Suspenseful finale** — ranks 10 → 4 revealed one by one, then a podium ceremony
- **Champion celebration** — crown drop, gold glow, confetti bursts, sweeping spotlights and a shine animation for the Mercedes-Benz S-Class
- **Car detail popups** — specs (hp, torque, engine, top speed, 0–100, price), pros/cons and score meters for every car
- **Gold particle background**, glassmorphism panels, luxury gradients, hover effects
- **Loading animation**, replay button, skip-to-results button
- **Sound effects** synthesized live with the Web Audio API (toggleable, no audio files)
- **Fully responsive**, dark-mode only, `prefers-reduced-motion` respected
- **Arabic ⇄ English** instant switching with correct RTL/LTR layout (choice remembered)

## 🏁 Final ranking

🥇 Mercedes-Benz S-Class · 🥈 BMW 7 Series · 🥉 Rolls-Royce Ghost · 4 Bentley Flying Spur ·
5 Audi A8 · 6 Porsche Panamera · 7 Genesis G90 · 8 Lexus LS · 9 Lucid Air Sapphire ·
10 Maserati Quattroporte

## 🛠 Tech

Pure **HTML + CSS + JavaScript** — no frameworks, no build step, no external images.
Every car render and brand emblem is generated as inline SVG, so the site works fully
offline (Google Fonts enhance typography when online, with system fallbacks).

## ▶️ Run

Open `index.html` in any modern browser, or serve the folder:

```bash
cd luxury-sedan-comparison
python3 -m http.server 8000   # then visit http://localhost:8000
```

## 📁 Structure

```
luxury-sedan-comparison/
├── index.html        # Page structure (AR default, RTL)
├── css/style.css     # Black & gold theme, glassmorphism, animations
└── js/
    ├── data.js       # Cars, scores, specs, AR/EN translations
    ├── visuals.js    # Inline SVG car renders & brand emblems
    └── app.js        # Comparison engine, leaderboard, podium, FX
```
