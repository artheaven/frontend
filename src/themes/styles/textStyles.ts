import { fonts } from "../fonts";

const mono = (fontSize: string) => ({
  fontFamily: fonts.mono,
  fontSize,
  fontWeight: "400",
  fontVariantNumeric: "tabular-nums"
});

export const textStyles = {
  h1: {
    fontFamily: fonts.display,
    fontSize: { base: "30px", md: "44px" },
    fontWeight: "400",
    lineHeight: "1.05"
  },
  h2: {
    fontFamily: fonts.display,
    fontSize: { base: "22px", md: "28px" },
    fontWeight: "400",
    lineHeight: "1.1"
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: "10px",
    fontWeight: "400",
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    color: "ink3"
  },
  text16: { fontSize: "16px", fontWeight: "400" },
  text14: { fontSize: "14px", fontWeight: "400" },
  text12: { fontSize: "12px", fontWeight: "400" },
  text10: { fontSize: "10px", fontWeight: "400" },
  textMono20: mono("20px"),
  textMono16: mono("16px"),
  textMono14: mono("14px"),
  textMono12: mono("12px"),
  textMono10: mono("10px")
};
