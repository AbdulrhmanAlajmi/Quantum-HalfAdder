/* =========================================================
   Who's the Best Car? — Data & Translations
   Kid-friendly edition: 5 cars, 5 categories, one screen.
   ========================================================= */
"use strict";

/* ---------- Comparison categories (icons only in the UI) ---------- */
const CATEGORIES = [
  { id: "luxury",     icon: "💎", ar: "الفخامة",        en: "Luxury" },
  { id: "comfort",    icon: "🛋️", ar: "الراحة",         en: "Comfort" },
  { id: "technology", icon: "🖥️", ar: "التقنية",        en: "Technology" },
  { id: "prestige",   icon: "👑", ar: "الهيبة",         en: "Prestige" },
  { id: "overall",    icon: "🏆", ar: "التجربة",        en: "Experience" },
];

/* ---------- Cars ----------
   scores[] follows CATEGORIES order, each 0–10.
   Totals give the final ranking:
   1 Mercedes (OVR 98), 2 BMW (96), 3 Audi (91),
   4 Tesla (90), 5 Porsche (89). */
const CARS = [
  {
    id: "mercedes",
    en: "Mercedes-Benz S-Class",
    ar: "مرسيدس S-Class",
    brandEn: "Mercedes-Benz", brandAr: "مرسيدس-بنز",
    color: "#0b0b0f", colorLight: "#3a3a46",
    scores: [9.8, 9.9, 9.6, 9.6, 9.9],
    photoQuery: "Mercedes-Benz S-Class W223",
    logoQuery: "Mercedes-Benz logo",
  },
  {
    id: "bmw",
    en: "BMW 7 Series",
    ar: "بي إم دبليو الفئة السابعة",
    brandEn: "BMW", brandAr: "بي إم دبليو",
    color: "#16264c", colorLight: "#3a5a94",
    scores: [9.5, 9.6, 9.9, 9.2, 9.6],
    photoQuery: "BMW 7 Series G70",
    logoQuery: "BMW logo 2020",
  },
  {
    id: "audi",
    en: "Audi A8",
    ar: "أودي A8",
    brandEn: "Audi", brandAr: "أودي",
    color: "#c8ccd4", colorLight: "#eef0f4",
    scores: [9.0, 9.2, 9.4, 8.7, 9.0],
    photoQuery: "Audi A8 D5 2022",
    logoQuery: "Audi logo 2016",
  },
  {
    id: "tesla",
    en: "Tesla Model S",
    ar: "تسلا موديل S",
    brandEn: "Tesla", brandAr: "تسلا",
    color: "#8e1c1c", colorLight: "#c04040",
    scores: [8.6, 8.8, 10.0, 8.5, 9.1],
    photoQuery: ['incategory:"Tesla Model S (2021)"', "Tesla Model S Plaid red", "Tesla Model S"],
    logoQuery: "Tesla Motors logo",
  },
  {
    id: "porsche",
    en: "Porsche Panamera",
    ar: "بورشه باناميرا",
    brandEn: "Porsche", brandAr: "بورشه",
    color: "#6b6f76", colorLight: "#a2a7b0",
    scores: [8.9, 8.5, 9.1, 9.0, 9.2],
    photoQuery: "Porsche Panamera 971 facelift",
    logoQuery: "Porsche logo",
  },
];

/* Final ranking, best first */
const FINAL_RANK_IDS = ["mercedes", "bmw", "audi", "tesla", "porsche"];

/* ---------- UI translations (short & kid-friendly) ---------- */
const I18N = {
  ar: {
    dir: "rtl",
    langButton: "English",
    brand: "🚗 مين الأفضل؟",
    loading: "لحظة… نجهّز السيارات 🚗",
    heroTitle: "مين أفضل سيارة؟",
    heroSubtitle: "خمس سيارات… وواحدة فقط تفوز!",
    compareBtn: "🏁 ابدأ المقارنة!",
    championTitle: "مرسيدس هي الأفضل! 👑",
    championSubtitle: "جمعت أعلى النقاط وفازت بالتاج!",
    replay: "🔁 العب من جديد",
    close: "إغلاق",
    tapHint: "اضغط أي سيارة لتكبيرها 👆",
  },
  en: {
    dir: "ltr",
    langButton: "العربية",
    brand: "🚗 WHO'S THE BEST?",
    loading: "One moment… starting the cars 🚗",
    heroTitle: "Which Car Is the Best?",
    heroSubtitle: "Five cars… only one wins!",
    compareBtn: "🏁 Compare Now!",
    championTitle: "Mercedes Is the Best! 👑",
    championSubtitle: "It scored the most points and won the crown!",
    replay: "🔁 Play Again",
    close: "Close",
    tapHint: "Tap any car to see it big 👆",
  },
};
