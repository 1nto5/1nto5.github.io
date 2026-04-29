export const WORLDS = [
  {
    id: "ai",
    num: "01",
    label: "AI Implementation Support",
    shortLabel: "AI",
    kicker: "Applied intelligence",
    glyph: "⌬",
    vars: {
      "--bg": "#000000",
      "--fg": "#ffffff",
      "--mute": "#6b7280",
      "--rule": "#1a2e22",
      "--accent": "#00ff94",
      "--chrome": "#00ff94",
      "--chrome-fg": "#000000",
    },
  },
  {
    id: "app",
    num: "02",
    label: "Application Development",
    shortLabel: "App",
    kicker: "Production + people, one app",
    glyph: "▚",
    vars: {
      "--bg": "#3d1d08",
      "--fg": "#fff1d6",
      "--mute": "#b08660",
      "--rule": "#7a3e16",
      "--accent": "#ff6a1a",
      "--chrome": "#ff6a1a",
      "--chrome-fg": "#1f0d04",
    },
  },
  {
    id: "web",
    num: "03",
    label: "Website Creation",
    shortLabel: "Web",
    kicker: "Marketing sites that ship",
    glyph: "◐",
    vars: {
      "--bg": "#ffffff",
      "--fg": "#0a0f3d",
      "--mute": "#5b6b80",
      "--rule": "#0a0f3d",
      "--accent": "#0019ff",
      "--chrome": "#0019ff",
      "--chrome-fg": "#ffffff",
    },
  },
];

export const NEUTRAL = {
  id: "neutral",
  vars: {
    "--bg": "#f3f1ec",
    "--fg": "#0b0b0b",
    "--mute": "#6b6b66",
    "--rule": "#0b0b0b",
    "--accent": "#0b0b0b",
    "--chrome": "#0b0b0b",
    "--chrome-fg": "#f3f1ec",
  },
};

const COLOR_KEYS = ["--bg", "--fg", "--mute", "--rule", "--accent", "--chrome", "--chrome-fg"];

export function applyVars(vars, worldId) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  COLOR_KEYS.forEach((k) => {
    if (vars[k] != null) root.style.setProperty(k, vars[k]);
  });
  if (vars["--bg"] != null) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", vars["--bg"]);
  }
  if (worldId) root.setAttribute("data-world", worldId);
}
