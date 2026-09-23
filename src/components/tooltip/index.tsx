import { Tooltip as DefaultTooltip, TooltipProps } from "@chakra-ui/react";
import React, { FC } from "react";

export const Tooltip: FC<TooltipProps> = ({ children, ...rest }) => {
  return (
    <DefaultTooltip bg="black.60" p="10px" {...rest} color="ink">
      {children}
    </DefaultTooltip>
  );
};
