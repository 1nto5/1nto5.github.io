export const WORLDS = [
  {
    id: "ai",
    num: "01",
    label: "AI Implementation Support",
    shortLabel: "AI",
    kicker: "Applied intelligence",
    glyph: "⌬",
    vars: {
      "--bg": "#0b1024",
      "--fg": "#eef0fa",
      "--mute": "#7079a0",
      "--rule": "#1d2557",
      "--accent": "#c8ff2e",
      "--accent-2": "#7c5cff",
      "--chrome": "#c8ff2e",
      "--chrome-fg": "#0b1024",
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
      "--bg": "#2a140a",
      "--fg": "#f4e3c5",
      "--mute": "#a08160",
      "--rule": "#5e2e15",
      "--accent": "#ff7a35",
      "--accent-2": "#ffce4a",
      "--chrome": "#ff7a35",
      "--chrome-fg": "#1f0d05",
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
      "--bg": "#f3edda",
      "--fg": "#0a1428",
      "--mute": "#5b6680",
      "--rule": "#0a1428",
      "--accent": "#1933ff",
      "--accent-2": "#ffba00",
      "--chrome": "#1933ff",
      "--chrome-fg": "#f3edda",
    },
  },
];

export const NEUTRAL = {
  id: "neutral",
  vars: {
    "--bg": "#ebe5d3",
    "--fg": "#0d0c08",
    "--mute": "#7a7460",
    "--rule": "#0d0c08",
    "--accent": "#c4391f",
    "--accent-2": "#0d0c08",
    "--chrome": "#0d0c08",
    "--chrome-fg": "#ebe5d3",
  },
};

const COLOR_KEYS = ["--bg", "--fg", "--mute", "--rule", "--accent", "--accent-2", "--chrome", "--chrome-fg"];

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
