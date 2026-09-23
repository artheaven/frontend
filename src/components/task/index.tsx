import { Task as ITask } from "@/types";
import { Box, Button, Flex, Image, Text, useMediaQuery } from "@chakra-ui/react";

type TaskProps = {
  pointsQty: number;
  ButtonProps?: {
    title: string;
    loading: boolean;
    onClick: VoidFunction;
  };
} & ITask;

export const Task = ({ name, complete, pointsQty, limited, ButtonProps }: TaskProps) => {
  const [is600Up] = useMediaQuery("(min-width: 600px)");

  return (
    <Flex key={name} justify="space-between" alignItems="center">
      <Flex gap="8px" alignItems={is600Up ? "center" : "flex-start"}>
        <Image
          src={complete ? "assets/image/CompletedTask.svg" : "assets/image/UncompletedTask.svg"}
          width="16px"
          height="16px"
        />
        <Flex flexDir="column" gap={1}>
          {limited && (
            <Flex gap={2} alignItems="center">
              <Box padding="4px 8px" borderRadius="2px" bg="#DE6E49CC">
                <Text textStyle="text12" lineHeight="14px" fontWeight={700}>
                  Limited offer!
                </Text>
              </Box>
              <Text textStyle={is600Up ? "text14" : "text10"} color="accent">
                +{pointsQty} points
              </Text>
            </Flex>
          )}
          <Flex
            flexDir={is600Up ? "row" : "column"}
            alignItems={is600Up ? "center" : "flex-start"}
            gap="8px"
          >
            <Text
              textStyle={is600Up ? "text16" : "text12"}
              color={complete ? "ink3" : "ink"}
            >
              {name}
            </Text>
            {!complete && !limited && (
              <Text textStyle={is600Up ? "text14" : "text10"} color="accent">
                +{pointsQty} points
              </Text>
            )}
          </Flex>
        </Flex>
      </Flex>
      {complete && (
        <Text textStyle={is600Up ? "text14" : "text10"} color="ink3" textAlign="right">
          {pointsQty} points received
        </Text>
      )}
      {!complete && ButtonProps && (
        <Button
          isLoading={ButtonProps.loading}
          padding="8px 16px"
          bg="ink"
          color="bg"
          borderRadius="2px"
          fontSize="14px"
          height="max-content"
          onClick={ButtonProps.onClick}
          minW="77px"
        >
          {ButtonProps.title}
        </Button>
      )}
    </Flex>
  );
};

export default Task;
