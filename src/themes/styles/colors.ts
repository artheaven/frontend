/**
 * Invictus palette (mirrors the Invictus site tokens). Dark-first, one accent (aurum),
 * `pos` / `neg` only for deltas and states.
 *
 * Legacy scale names (black.*, greenAlpha.*, …) are kept so existing components pick up the
 * new palette without edits; new code should use the semantic names (bg, ink, line, accent, …).
 */
const rgba = (rgb: string) => ({
  100: `rgba(${rgb}, 1)`,
  80: `rgba(${rgb}, 0.8)`,
  60: `rgba(${rgb}, 0.6)`,
  40: `rgba(${rgb}, 0.4)`,
  20: `rgba(${rgb}, 0.2)`,
  10: `rgba(${rgb}, 0.1)`,
  5: `rgba(${rgb}, 0.05)`
});

const INK_RGB = "242, 241, 236";
const ACCENT_RGB = "201, 164, 92";
const POS_RGB = "95, 179, 138";
const NEG_RGB = "212, 106, 90";
const INK3_RGB = "154, 153, 147";

export const tokens = {
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
  neg: "#D46A5A"
};

export const colors = {
  ...tokens,
  accentAlpha: rgba(ACCENT_RGB),
  posAlpha: rgba(POS_RGB),
  negAlpha: rgba(NEG_RGB),

  // ---- legacy names, remapped ----
  whiteAlpha: {
    100: tokens.ink,
    90: `rgba(${INK_RGB}, 0.9)`,
    80: `rgba(${INK_RGB}, 0.8)`,
    70: `rgba(${INK_RGB}, 0.7)`,
    60: `rgba(${INK_RGB}, 0.6)`,
    50: `rgba(${INK_RGB}, 0.5)`,
    40: `rgba(${INK_RGB}, 0.4)`,
    30: `rgba(${INK_RGB}, 0.3)`,
    20: `rgba(${INK_RGB}, 0.2)`,
    10: `rgba(${INK_RGB}, 0.1)`
  },
  white: tokens.ink,
  green: { 100: tokens.pos },
  lightGray: tokens.ink,
  darkGray: tokens.ink3,
  gray: {
    100: tokens.muted,
    80: `rgba(${INK_RGB}, 0.8)`
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
  // Former brand green → aurum accent. Positive deltas/states use posAlpha instead.
  greenAlpha: rgba(ACCENT_RGB),
  // Secondary chart series and neutral badges.
  violetAlpha: rgba(INK3_RGB),
  blueAlpha: rgba(INK3_RGB),
  orangeAlpha: rgba("214, 160, 90"),
  redAlpha: rgba(NEG_RGB)
};
