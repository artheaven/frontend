/**
 * Invictus palette (mirrors the Invictus site tokens). Dark is the default; light is a full
 * second theme. Theme colours resolve to CSS variables, so every consumer — Chakra props,
 * recharts SVG attributes, inline styles, RainbowKit — follows the active colour mode.
 * Values live in `palette`; variables are emitted by `themeCssVariables` (see global.ts).
 *
 * Legacy scale names (black.*, greenAlpha.*, …) are kept and remapped; new code should use
 * the semantic names (bg, ink, line, accent, pos, neg, …).
 */
const dark = {
  bg: "#0A0B0D",
  bg2: "#111317",
  bg3: "#171A1F",
  ink: "#F2F1EC",
  ink2: "#C9C8C2",
  ink3: "#9A9993",
  // Below 4.5:1 on bg — decorative / large text only.
  muted: "#6E6D68",
  line: "#22252B",
  lineStrong: "#33373F",
  accent: "#C9A45C",
  accentTint: "#2A2418",
  pos: "#5FB38A",
  neg: "#D46A5A",
  warn: "#D6A05A"
};

const light: typeof dark = {
  bg: "#F7F6F1",
  bg2: "#EFEEE8",
  bg3: "#E6E4DC",
  ink: "#0E0F11",
  ink2: "#2E2F33",
  ink3: "#55565B",
  muted: "#6A6964",
  line: "#DAD8D0",
  lineStrong: "#C4C1B7",
  accent: "#8A6A2A",
  accentTint: "#EFE6D2",
  pos: "#2F7A57",
  neg: "#A8412F",
  warn: "#9A6220"
};

export const palette = { dark, light };
export type TokenName = keyof typeof dark;

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

/** CSS variables for one mode: `--inv-<token>` and `--inv-<token>-rgb`. */
export const themeCssVariables = (mode: "dark" | "light") =>
  Object.fromEntries(
    (Object.entries(palette[mode]) as [TokenName, string][]).flatMap(([k, v]) => [
      [`--inv-${k}`, v],
      [`--inv-${k}-rgb`, hexToRgb(v)]
    ])
  );

const v = (name: TokenName) => `var(--inv-${name})`;
const alpha = (name: TokenName) => ({
  100: `rgba(var(--inv-${name}-rgb), 1)`,
  90: `rgba(var(--inv-${name}-rgb), 0.9)`,
  80: `rgba(var(--inv-${name}-rgb), 0.8)`,
  70: `rgba(var(--inv-${name}-rgb), 0.7)`,
  60: `rgba(var(--inv-${name}-rgb), 0.6)`,
  50: `rgba(var(--inv-${name}-rgb), 0.5)`,
  40: `rgba(var(--inv-${name}-rgb), 0.4)`,
  30: `rgba(var(--inv-${name}-rgb), 0.3)`,
  20: `rgba(var(--inv-${name}-rgb), 0.2)`,
  10: `rgba(var(--inv-${name}-rgb), 0.1)`,
  5: `rgba(var(--inv-${name}-rgb), 0.05)`
});

/** Theme-aware colour values (CSS variables). Safe in Chakra props, SVG attributes and inline styles. */
export const tokens = Object.fromEntries(Object.keys(dark).map(k => [k, v(k as TokenName)])) as Record<
  TokenName,
  string
>;

export const colors = {
  ...tokens,
  accentAlpha: alpha("accent"),
  posAlpha: alpha("pos"),
  negAlpha: alpha("neg"),
  bgAlpha: alpha("bg"),

  // ---- legacy names, remapped ----
  whiteAlpha: alpha("ink"),
  white: tokens.ink,
  green: { 100: tokens.pos },
  lightGray: tokens.ink,
  darkGray: tokens.ink3,
  gray: {
    100: tokens.muted,
    80: `rgba(var(--inv-ink-rgb), 0.8)`
  },
  black: {
    100: tokens.bg,
    90: tokens.line,
    80: tokens.bg2,
    70: tokens.bg2,
    60: tokens.bg3,
    40: tokens.lineStrong,
    20: tokens.lineStrong,
    5: tokens.ink3,
    0: tokens.ink
  },
  // Former brand green → accent. Positive deltas/states use posAlpha instead.
  greenAlpha: alpha("accent"),
  // Secondary chart series and neutral badges.
  violetAlpha: alpha("ink3"),
  blueAlpha: alpha("ink3"),
  orangeAlpha: alpha("warn"),
  redAlpha: alpha("neg")
};
