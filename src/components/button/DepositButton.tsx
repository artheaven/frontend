import { Button } from "@chakra-ui/react";

// Primary action in the Invictus style: solid aurum, no attention animation.
const DepositButton = ({
  isDisabled,
  onDeposit,
  title,
  id,
  onClick
}: {
  isDisabled: boolean;
  variant?: string;
  onDeposit: VoidFunction;
  title?: string;
  id?: string;
  onClick?: VoidFunction;
}) => {
  return (
    <Button
      id={id}
      width="100%"
      h="44px"
      variant="primaryWhite"
      type="submit"
      isDisabled={isDisabled}
      onClick={() => {
        if (onClick) {
          onClick();
        }
        onDeposit();
      }}
    >
      {title || "Deposit"}
    </Button>
  );
};

export default DepositButton;
