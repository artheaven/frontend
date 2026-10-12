import { Box, BoxProps } from "@chakra-ui/react";
import React, { FC } from "react";

export const Bar: FC<BoxProps> = ({ ...rest }) => {
  return <Box h="100%" w="4px" borderRadius="10px" {...rest}></Box>;
};
