import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Instrument_Serif } from "next/font/google";

// Invictus type system: serif display, Geist Sans body, Geist Mono for data and eyebrows.
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", display: "swap" });

export const fonts = {
  display: `${instrumentSerif.style.fontFamily}, "Times New Roman", serif`,
  sans: `${GeistSans.style.fontFamily}, ui-sans-serif, system-ui, sans-serif`,
  mono: `${GeistMono.style.fontFamily}, ui-monospace, monospace`
};
