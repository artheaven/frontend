import { TooltipRenderProps } from "react-joyride";
import { Button, Flex, Text } from "@chakra-ui/react";

interface GuideTooltipProps extends TooltipRenderProps {
  stepIndex: number;
  stepsLength: number;
  showNextButton?: boolean;
  showBackButton?: boolean;
  isDisabledNextButton?: boolean;
}

const GuideTooltip = ({
  step,
  stepIndex,
  stepsLength,
  showNextButton,
  showBackButton,
  isDisabledNextButton,
  primaryProps,
  tooltipProps,
  closeProps,
  backProps,
  isLastStep
}: GuideTooltipProps) => {
  return (
    <Flex
      flexDir="column"
      gap={2}
      borderRadius="2px"
      p="16px 12px"
      bgColor="bg3"
      maxW="350px"
      {...tooltipProps}
    >
      <Text whiteSpace="break-spaces" textAlign="center" fontWeight={500}>
        {step.content}
      </Text>

      <Flex justify="space-between" alignItems="center">
        <Text fontSize="14px" color="greenAlpha.80" fontWeight={700}>
          {stepIndex + 1} / {stepsLength}
        </Text>
        <Flex gap={2}>
          {showBackButton && (
            <Button
              backgroundColor="lineStrong"
              width="fit-content"
              p="8px"
              fontSize="14px"
              minH={0}
              height="max-content"
              {...backProps}
            >
              Back
            </Button>
          )}
          {showNextButton && (
            <Button
              isLoading={isDisabledNextButton}
              backgroundColor="lineStrong"
              width="fit-content"
              p="8px"
              fontSize="14px"
              minH={0}
              height="max-content"
              {...primaryProps}
            >
              {isLastStep ? "Finish" : "Next"}
            </Button>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default GuideTooltip;
