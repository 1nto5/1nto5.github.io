// Canvas-side theme palette. The DOM re-themes through CSS custom
// properties (src/styles/global.css); the canvas scenes read their colors
// from here instead - keep both files in sync.
const THEMES = {
  dark: {
    bg: "#050505",
    ink: "255,255,255",
    ai: "125,211,252",
    app: "252,211,77",
    web: "196,181,253",
  },
  light: {
    bg: "#f4f5f7",
    ink: "14,16,19",
    ai: "2,132,199",
    app: "217,119,6",
    web: "124,58,237",
  },
};

export const THEME_EVENT = "aa-theme";

export function currentThemeName() {
  return typeof document !== "undefined" && document.documentElement.dataset.theme === "light"
    ? "light"
    : "dark";
}

export function currentTheme() {
  return THEMES[currentThemeName()];
}

export function setTheme(name) {
  document.documentElement.dataset.theme = name;
  try {
    localStorage.setItem("aa_theme", name);
  } catch (e) {}
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute("content", THEMES[name].bg);
  window.dispatchEvent(new CustomEvent(THEME_EVENT));
}

export function toggleTheme() {
  setTheme(currentThemeName() === "light" ? "dark" : "light");
}

// Subscribe to theme flips; returns the unsubscribe function.
export function onThemeChange(fn) {
  window.addEventListener(THEME_EVENT, fn);
  return () => window.removeEventListener(THEME_EVENT, fn);
}
