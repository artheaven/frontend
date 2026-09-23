import { Button, Divider, Flex, HStack, Switch, Text } from "@chakra-ui/react";
import { useFormik } from "formik";
import React from "react";

import { FormInput } from "../../../../components/forms/form-input";
import { borrowSchema } from "../../../../components/forms/schemas";
import { Tooltip } from "../../../../components/tooltip";

export const BorrowTab = () => {
  const { handleSubmit, handleChange, values, isValid, errors } = useFormik({
    initialValues: {
      collateral: "",
      borrow: ""
    },
    validationSchema: borrowSchema(),
    onSubmit: e => {
      console.log("submit", e);
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="15px">
        <Text textStyle="h2">1. Add collateral asset</Text>

        <FormInput
          id="collateral"
          errorMessage={errors.collateral}
          isValid={!errors.collateral || isValid}
          value={values.collateral}
          handleChange={handleChange}
          tokenName="USDT"
        />

        <HStack justify="space-between">
          <Text color="black.0">Available collateral</Text>
          <Text textStyle="textMono16">0 USDT</Text>
        </HStack>

        <HStack justify="space-between">
          <Text color="black.0">LTV</Text>
          <Text textStyle="textMono16">75%</Text>
        </HStack>

        <HStack justify="space-between">
          <Tooltip label="EXTRA INFO">
            <Text variant="tooltip">Enable extra-collateral</Text>
          </Tooltip>
          <Switch />
        </HStack>

        <Divider borderColor="black.90" />

        <Text textStyle="h2">2. Choose asset to borrow</Text>

        <FormInput
          id="borrow"
          errorMessage={errors.borrow}
          isValid={!errors.borrow || isValid}
          value={values.borrow}
          handleChange={handleChange}
        />

        <HStack justify="space-between">
          <Text color="black.0">Borrowed</Text>
          <Text textStyle="textMono16">384 USDT</Text>
        </HStack>

        <HStack justify="space-between">
          <Text color="black.0">Available to borrow</Text>
          <Text textStyle="textMono16">100,552 USDT</Text>
        </HStack>
        <HStack justify="space-between">
          <Text color="black.0">Invictus borrowing rate</Text>
          <Text textStyle="textMono16">4.5%</Text>
        </HStack>
        <HStack justify="space-between">
          <Text color="black.0">Av. market rate</Text>
          <Text textStyle="textMono16">5.6%</Text>
        </HStack>

        <Button
          variant="primaryFilled"
          type="submit"
          isDisabled={(!values.borrow && !values.collateral) || !isValid}
        >
          Borrow
        </Button>
      </Flex>
    </form>
  );
};
