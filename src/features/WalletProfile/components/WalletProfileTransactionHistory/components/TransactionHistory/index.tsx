import { Box, Flex, Text } from "@chakra-ui/react";
import dayjs from "dayjs";
import React, { FC } from "react";

import Icon from "../../../../../../components/icon";
import { ICON_NAMES } from "../../../../../../consts";
import { ellipsis } from "../../../../../../utils";
import { ITransactionHistory } from "../../../../types";
import { colorTransactionStatus } from "../../../../utils";

export const TransactionHistory: FC<ITransactionHistory> = ({
  type,
  status,
  time,
  value,
  hash
}) => {
  const colors = colorTransactionStatus[status as keyof typeof colorTransactionStatus];
  return (
    <Flex direction="column">
      <Flex justify="space-between" align="center">
        <Flex align="center" gap="4px">
          <Box
            as={Icon}
            name={ICON_NAMES.logoutCircle}
            size="sm"
            transform={type === "withdrawal" ? "rotate(180deg)" : undefined}
          />
          <Text fontSize="sm" textTransform="capitalize" color="ink2">
            {type}
          </Text>
          <Text
            fontSize="xs"
            textTransform="capitalize"
            borderRadius="50px"
            bg={colors.bg}
            color={colors.color}
            p="0 4px"
          >
            {status}
          </Text>
        </Flex>

        <Text fontSize="xs" color="ink2">
          {dayjs(time).format("DD/MM/YYYY HH:mm")}
        </Text>
      </Flex>

      <Flex align="center" justify="space-between">
        <Text fontSize="sm" fontWeight="500">
          {value}
        </Text>
        <Text fontSize="xs" color="pos">
          {ellipsis(hash)}
        </Text>
      </Flex>
    </Flex>
  );
};
