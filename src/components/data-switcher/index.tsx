import { Flex, HStack, Text } from "@chakra-ui/react";
import React, { FC } from "react";

import { IDateSwitcher } from "./types";

export const DateSwitcher: FC<IDateSwitcher> = ({ date, selectDate, selectedDate }) => {
  return (
    <HStack border="1px solid" borderColor="black.40" borderRadius="10px" bg="black.100" p="2px">
      {date.map((elem: any, i) => (
        <Flex
          key={i}
          justify="center"
          alignItems="center"
          px="5px"
          onClick={elem?.isDisabled ? undefined : () => selectDate(elem)}
          p="4px 12px 4px 12px"
          borderRadius="10px"
          bg={
            elem.intervals === +selectedDate.intervals && !elem?.isDisabled ? "black.40" : undefined
          }
          w="41px"
          opacity={elem?.isDisabled ? 0.7 : 1}
          cursor={elem?.isDisabled ? "not-allowed" : "pointer"}
        >
          <Text fontSize="sm" color="lightGray">
            {elem.name}
          </Text>
        </Flex>
      ))}
    </HStack>
  );
};
