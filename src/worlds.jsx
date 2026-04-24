// Worlds.jsx - four worlds + neutral baseline
const WORLDS = [
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
      "--bg": "#1a0d00",
      "--fg": "#fff5e6",
      "--mute": "#8a6a4a",
      "--rule": "#4a2d10",
      "--accent": "#ff5500",
      "--chrome": "#ff5500",
      "--chrome-fg": "#1a0d00",
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
  {
    id: "it",
    num: "04",
    label: "IT Support",
    shortLabel: "IT",
    kicker: "Systems, uptime, humans",
    glyph: "▮",
    vars: {
      "--bg": "#000000",
      "--fg": "#33ff33",
      "--mute": "#2a6a2a",
      "--rule": "#0a3d0a",
      "--accent": "#33ff33",
      "--chrome": "#33ff33",
      "--chrome-fg": "#000000",
    },
  },
];

const NEUTRAL = {
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

// When applying a world, only swap COLOR tokens globally - the font tokens
// are kept via scoped CSS inside each section's own stylesheet, so the
// shell (hero, topbar, contact) never reflows on hover.
const COLOR_KEYS = ["--bg","--fg","--mute","--rule","--accent","--chrome","--chrome-fg"];

function applyVars(vars) {
  const root = document.documentElement;
  COLOR_KEYS.forEach(k => {
    if (vars[k] != null) root.style.setProperty(k, vars[k]);
  });
}

Object.assign(window, { WORLDS, NEUTRAL, applyVars });
