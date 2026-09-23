import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Flex,
  Center,
  Text,
  ModalCloseButton,
  ModalBody,
  Button,
  ModalFooter,
  Link,
  useMediaQuery,
  Drawer,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody
} from "@chakra-ui/react";
import { IDefaultModalProps } from "../types";
import Icon from "@/components/icon";
import { ICON_NAMES } from "@/consts/iconNames";
import { isMobile } from "react-device-detect";
import { ConnectorNames } from "@/consts/connectors";
import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MEDIA_QUERY_MAX } from "@/consts";

const CONNECT_METHODS = [
  {
    method: ConnectorNames.WalletConnect,
    title: "WalletConnect",
    imgName: ICON_NAMES.walletConnect
  },
  {
    method: ConnectorNames.MetaMask,
    // method: ConnectorNames.Injected,
    title: "Metamask",
    imgName: ICON_NAMES.metamask
  }
];

if (!isMobile) {
  // CONNECT_METHODS.unshift({
  //   method: ConnectorNames.MetaMask,
  //   title: "Metamask",
  //   imgName: ICON_NAMES.metamask
  // });
  CONNECT_METHODS.push({
    method: ConnectorNames.CoinBase,
    title: "Coinbase",
    imgName: ICON_NAMES.coinBase
  });
}

const ConnectWalletModal = ({ isOpen, onClose }: IDefaultModalProps) => {
  const [media] = useMediaQuery(MEDIA_QUERY_MAX);
  const { login } = useAuth();
  const activateProvider = useCallback(async (connectorId: ConnectorNames) => {
    try {
      // if (connectorId === ConnectorNames.WalletConnect) {
      //   onClose();
      // }
      await login(connectorId);
      // if (account && !chain.unsupported) {
      //   localStorage.setItem(STORAGE_WALLET_CONNECTION_KEY, connectorId);
      //   onConnect();

      //   auth(account);
      // }
    } catch (e) {
      console.log(e);
    }

    onClose();
  }, []);

  if (media) {
    return (
      <Drawer isOpen={isOpen} placement="right" size="full" onClose={onClose}>
        <DrawerContent bg="black.100">
          <DrawerCloseButton color="gray.100" />
          <DrawerHeader as={Flex} direction="column" align="center">
            <Center w="56px" h="56px" borderRadius="full" bg="black.80">
              <Icon name={ICON_NAMES.logo} />
            </Center>
            <Text fontSize="xl" fontWeight="600">
              Connect Wallet
            </Text>
            <Text fontSize="sm" fontWeight="400">
              To start using Invictus
            </Text>
          </DrawerHeader>

          <DrawerBody as={Flex} direction="column" gap="16px">
            {CONNECT_METHODS.map(({ title, method, imgName }) => (
              <Flex
                id={`Click_${title}`}
                as={Button}
                key={title}
                alignItems="center"
                justify="space-between"
                w="100%"
                p="0"
                onClick={() => activateProvider(method)}
              >
                <Flex align="inherit" gap="8px">
                  <Icon name={imgName} size="32px" />
                  <Text fontSize="md" fontWeight="500" color="black.0">
                    {title}
                  </Text>
                </Flex>
                <Icon name={ICON_NAMES.arrowRight} />
              </Flex>
            ))}

            <Text fontSize="xs" color="black.0">
              By connecting, I accept Invictus’s{" "}
              <Link color="greenAlpha.100">Terms of Service</Link>
            </Text>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="auto" backdropBlur="3px" />
      <ModalContent borderRadius="2px" p="24px" gap="36px" bg="bg">
        <ModalHeader as={Flex} align="center" direction="column" p="0">
          <Center w="56px" h="56px" borderRadius="full" bg="black.80">
            <Icon name={ICON_NAMES.logo} />
          </Center>
          <Text fontSize="xl" fontWeight="600">
            Connect Wallet
          </Text>
          <Text fontSize="sm" fontWeight="400">
            To start using Invictus
          </Text>
        </ModalHeader>

        <ModalCloseButton color="gray.100" />

        <ModalBody as={Flex} direction="column" gap="16px">
          {CONNECT_METHODS.map(({ title, method, imgName }) => (
            <Flex
              as={Button}
              key={title}
              alignItems="center"
              justify="space-between"
              w="100%"
              p="0"
              onClick={() => activateProvider(method)}
            >
              <Flex align="inherit" gap="8px">
                <Icon name={imgName} size="32px" />
                <Text fontSize="md" fontWeight="500" color="black.0">
                  {title}
                </Text>
              </Flex>
              <Icon name={ICON_NAMES.arrowRight} />
            </Flex>
          ))}
        </ModalBody>

        <ModalFooter justifyContent="start">
          <Text fontSize="xs" color="black.0">
            By connecting, I accept Invictus’s <Link color="greenAlpha.100">Terms of Service</Link>
          </Text>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConnectWalletModal;
