import React, { FC } from "react";
import { ICON_NAMES } from "../../consts";
import { EnumSizes, Sizes, TIconProps } from "./types";

// Icons drawn in white/light grey for dark backgrounds (checked against public/assets/icons).
const MONO_ICONS = new Set([
  "DAI", "DFORCE", "FRAX", "USDC", "USDT", "VENUS", "WBNB", "WBTC", "WETH", "add", "alarm-warning",
  "alert", "arb", "arrow-left", "arrow-right", "asset-function", "checkbox-circle",
  "checkbox-multiple-blank", "chevron-down", "chevron-left", "chevron-right", "chevron-up", "close",
  "copy", "delete-bin", "descord", "error-warning", "function", "help", "link", "linkedin",
  "logout-circle", "logout-square", "magic", "menu", "moon", "more", "notification", "pencil",
  "question", "reward", "settings", "sun", "swap", "switch", "telegram", "tiles", "twitter",
  "uncompleted-step", "update"
]);

const Icon: FC<TIconProps> = ({ name, size = "md", width, height, ...props }) => {
  const currentSize = EnumSizes[size as Sizes] ?? size;

  const getImgSrc = (iconName: string) => {
    if (!iconName) return "/assets/icons/default-icon.svg";

    const basePath = "/assets/icons/";

    const iconValue = Object.hasOwnProperty.call(ICON_NAMES, iconName)
      ? ICON_NAMES[iconName as keyof typeof ICON_NAMES]
      : iconName;

    // Special case for MORPHO numbered icons (MORPHO-1, MORPHO-2, etc.)
    if (iconValue && typeof iconValue === "string" && iconValue.match(/^MORPHO-[1-5]$/)) {
      const morphoNumber = iconValue.split("-")[1];
      const extension = ["1", "4", "5"].includes(morphoNumber) ? "svg" : "png";
      return `${basePath}${iconValue}-icon.${extension}`;
    }

    if (iconValue === ICON_NAMES.SILO) {
      return `${basePath}${iconValue}-icon.png`;
    }

    if (iconValue === ICON_NAMES.DOLOMITE || iconValue === ICON_NAMES.LODESTAR) {
      return `${basePath}${iconValue}-icon.jpg`;
    }

    if (iconValue === ICON_NAMES.FRAXLEND || iconValue === ICON_NAMES.KINZA) {
      return `${basePath}${iconValue}-icon.png`;
    }

    return `${basePath}${iconValue || "default"}-icon.svg`;
  };

  const isRoundIcon =
    name && [ICON_NAMES.SILO, ICON_NAMES.DOLOMITE, ICON_NAMES.LODESTAR].includes(name);

  const iconValue = name && Object.hasOwnProperty.call(ICON_NAMES, name) ? ICON_NAMES[name as keyof typeof ICON_NAMES] : name;
  const isMono = typeof iconValue === "string" && MONO_ICONS.has(iconValue);

  return (
    <img
      data-mono-icon={isMono ? "" : undefined}
      src={getImgSrc(name || "")}
      alt={name || "icon"}
      width={width || currentSize}
      height={height || currentSize}
      {...props}
      style={{
        ...(currentSize ? { width: currentSize, height: currentSize } : {}),
        borderRadius: isRoundIcon ? "50%" : undefined
      }}
      onError={e => {
        console.error(`Failed to load icon: ${name}, src: ${(e.target as HTMLImageElement).src}`);
      }}
    />
  );
};

export default Icon;
