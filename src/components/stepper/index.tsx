import {
  useSteps,
  Stepper as StepperComponent,
  StepIndicator,
  StepStatus,
  StepIcon,
  Box,
  Step,
  StepTitle,
  StepSeparator,
  Flex,
  Text,
  Image
} from "@chakra-ui/react";
import Icon from "../icon";
import { ICON_NAMES } from "@/consts";
import { tokens } from "@/themes/styles/colors";

type StepperProps = {
  steps: Array<string>;
  activeIndex: number;
};

const Stepper = ({ steps, activeIndex }: StepperProps) => {
  return (
    <StepperComponent index={activeIndex} orientation="horizontal" gap={0}>
      {steps.map((step, index) => (
        <Step
          style={{
            alignItems: "flex-start",
            gap: 0
          }}
        >
          <Flex flexDir="column" alignItems="center" maxW="20px" gap={2}>
            <StepIndicator boxSize="16px" border="none" background="none !important">
              <StepStatus
                complete={<Icon name={ICON_NAMES.completedStep} />}
                incomplete={<Icon name={ICON_NAMES.uncompletedStep} />}
                active={<Icon name={ICON_NAMES.uncompletedStep} />}
              />
            </StepIndicator>

            <Box
              flexShrink={0}
              alignSelf={
                index === 0 ? "flex-start" : index === steps.length - 1 ? "flex-end" : "inherit"
              }
            >
              <StepTitle>
                <Text textStyle="text14" color="black.5">
                  {step}
                </Text>
              </StepTitle>
            </Box>
          </Flex>

          <StepSeparator
            style={{
              color: tokens.lineStrong,
              marginTop: "7px",
              marginRight: "8px"
            }}
          />
        </Step>
      ))}
    </StepperComponent>
  );
};

export default Stepper;
