# 👑 Who's the Best Car? — مين أفضل سيارة؟

A fun, kid-friendly (ages 6–7) one-screen car comparison in a Mercedes-inspired
black & chrome theme. **Arabic by default (RTL)** with a one-click English toggle.

## 🎮 How it works — one tap!

1. The five cars are already on screen, each with its real photo and brand logo.
2. Tap **🏁 ابدأ المقارنة!** — scores pop up on every card (5 icon-labelled bars + a big OVR).
3. The cards glide into 1–5 order with 🥇🥈🥉 medals — and the **Mercedes S-Class
   wins the crown 👑** with gold frame and confetti.
4. Tap any car to see it big with its scores. Tap 🔁 to play again.

## 🚗 The five cars

🥇 Mercedes-Benz S-Class (OVR 98) · 🥈 BMW 7 Series (96) · 🥉 Audi A8 (91) ·
4 Tesla Model S (90) · 5 Porsche Panamera (89)

## ✨ Features

- **One compact screen** — no long scrolling, one button, instant result
- **Real car photos & official brand logos**, resolved automatically at runtime from
  the Wikimedia Commons API (CORS, no keys, cached); elegant inline-SVG renders and
  emblems as automatic fallback so the page never breaks offline
- Icon-only stat bars (💎 🛋️ 🖥️ 👑 🏆) — no reading required
- Crown drop, gold winner card, confetti, chrome particle background
- Web Audio sound effects (toggleable), Arabic ⇄ English, responsive, dark-only

## 🛠 Tech & Run

Pure **HTML + CSS + JavaScript** — no frameworks, no build step.
Open `index.html`, or: `python3 -m http.server 8000` inside the folder.

```
luxury-sedan-comparison/
├── index.html        # One-screen page (AR default, RTL)
├── css/style.css     # Black & chrome theme, card + crown animations
└── js/
    ├── data.js       # 5 cars, 5 categories, AR/EN strings
    ├── visuals.js    # SVG car renders & emblems (fallback)
    ├── images.js     # Real photos & logos via Wikimedia Commons API
    └── app.js        # One-tap comparison, ranking, confetti
```
