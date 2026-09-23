import dayjs from "dayjs";

import { ROUTES_TYPE } from "../../consts/routes-type";
import { themes } from "../../themes";
export const colorsArea = {
  lending: themes.colors.greenAlpha["100"],
  borrowing: themes.colors.violetAlpha["100"]
};

export const tickFormatter = (e: string) => {
  return dayjs(e).format("MMM DD");
};

export const areaLines = [
  {
    name: "Invictus APY\n",
    subtext: '(14.26% monthly average)',
    type: ROUTES_TYPE.lending
  },
  {
    name: "Aave APY\n",
    subtext: '(10.33% monthly average)',
    type: ROUTES_TYPE.borrowing
  }
];
