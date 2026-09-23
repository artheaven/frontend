import { Bar as DefaultBar, Cell } from "recharts";

import { IBar, isColorString } from "./types";
import { tokens } from "@/themes/styles/colors";

export const barGradient = ({ data, color }: IBar) => {
  return (
    <>
      <defs>
        <linearGradient id="defaultColor" gradientTransform="rotate(90)" spreadMethod="reflect">
          <stop offset="30%" stopColor={!isColorString(color) ? color?.bottom : ""} />
          <stop offset="90%" stopColor={!isColorString(color) ? color?.top : ""} />
        </linearGradient>
      </defs>

      {/* <defs>
        <linearGradient id="hoverColor" gradientTransform="rotate(90)" spreadMethod="reflect">
          <stop offset="5%" stopColor="rgba(91, 225, 145, 1)" />
          <stop offset="35%" stopColor="rgba(26, 157, 78, 1)" />
          <stop offset="60%" stopColor="rgba(0, 135, 54, 1)" />
        </linearGradient>
      </defs> */}

      <DefaultBar
        key={1}
        maxBarSize={20}
        minPointSize={5}
        dataKey="lending"
        fill={!isColorString(color) ? color?.bottom : ""}
        background={{ fill: tokens.bg3 }}
      >
        {data.map((elem, index) => (
          <Cell cursor="pointer" fill={"url(#defaultColor)"} key={`cell-${index}`} radius={10} />
        ))}
      </DefaultBar>
    </>
  );
};

export const bar = ({ data, color }: IBar) => {
  return (
    <DefaultBar
      key={1}
      maxBarSize={20}
      minPointSize={5}
      dataKey="lending"
      fill={isColorString(color) ? color : ""}
      background={{ fill: tokens.bg3 }}
    >
      {data.map((_, index) => (
        <Cell cursor="pointer" key={`cell-${index}`} radius={10} />
      ))}
    </DefaultBar>
  );
};
