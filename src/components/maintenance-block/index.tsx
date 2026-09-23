import { Flex, Text, useMediaQuery } from "@chakra-ui/react";
import { WarningTwoIcon } from "@chakra-ui/icons";

const MaintenanceBlock = () => {
  const [isDesktop] = useMediaQuery("(min-width: 1130px)");

  return (
    <Flex
      p={isDesktop ? "20px 24px" : "20px 16px"}
      gap="16px"
      alignItems="center"
      justify="center"
      bg="orangeAlpha.60"
    >
      <WarningTwoIcon boxSize="24px" />
      <Text textStyle="textMono16">Invictus is under maintenance</Text>
    </Flex>
  );
};

export default MaintenanceBlock;
