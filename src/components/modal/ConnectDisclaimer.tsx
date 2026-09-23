import { Text, Link } from "@chakra-ui/react";
import { LINK_PRIVACY_NOTICE, LINK_TERMS_OF_SERVICE } from "@/consts";

const ConnectDisclaimer = () => {
  return (
    <Text fontSize="xs" color="black.0">
      By connecting, I accept Invictus’s <br />
      <Link color="greenAlpha.100" href={LINK_TERMS_OF_SERVICE}>
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link color="greenAlpha.100" href={LINK_PRIVACY_NOTICE} target="_blank">
        Privacy Notice
      </Link>
    </Text>
  );
};

export default ConnectDisclaimer;
