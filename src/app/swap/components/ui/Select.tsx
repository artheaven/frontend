"use client";

import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Text,
  Image,
  Skeleton,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  ButtonProps,
  Modal,
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  CloseButton,
  Divider
} from "@chakra-ui/react";
import { ChevronDownIcon, SearchIcon } from "@chakra-ui/icons";
import { IToken } from "@/api/tokens/types";
import { formatNumber } from "@/utils/formatNumber";

const preselectedSymbols = ["ARB", "WETH", "USDT", "USDC", "USDC.e"];

export type SelectProps = {
  options: IToken[];
  value: IToken | null;
  setSelected: (token: IToken) => void;
  ButtonProps?: ButtonProps;
};

const Select: React.FC<SelectProps> = ({ options = [], value, setSelected, ButtonProps }) => {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const filteredOptions = options.filter(
    option =>
      option.symbol.toLowerCase().includes(search.toLowerCase()) ||
      option.name.toLowerCase().includes(search.toLowerCase())
  );

  const commonlyUsedTokens = options.filter(option => preselectedSymbols.includes(option.symbol));

  const selectedToken = options.find(option => option.symbol === value?.symbol);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleMenuItemClick = (option: IToken) => {
    setSelected(option);
    onClose();
  };

  return (
    <Box ref={containerRef} position="relative" zIndex={999}>
      <Button
        border="1px solid" borderColor="bg3"
        backgroundColor="bg3"
        padding="6px 12px"
        borderRadius="2px"
        onClick={onOpen}
        rightIcon={<ChevronDownIcon />}
        width="100%"
        {...ButtonProps}
        textAlign="left"
      >
        <Flex alignItems="center">
          {selectedToken ? (
            selectedToken.logoURI ? (
              <Image
                borderRadius={100}
                src={selectedToken.logoURI}
                alt={selectedToken.symbol}
                boxSize="20px"
                mr="4px"
              />
            ) : (
              <Box boxSize="20px" bg="gray.200" mr="4px" />
            )
          ) : (
            <Skeleton boxSize="20px" mr="4px" />
          )}
          <Text ml="4px">{selectedToken?.symbol || <Skeleton width="30px" />}</Text>
        </Flex>
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent h="545px" bg="bg2" maxW="400px" pb={6}>
          <Flex justify="space-between" alignItems="center" p="24px 24px 12px 24px">
            <ModalHeader flexGrow={1} p={0}>
              <Text>Select a token</Text>
            </ModalHeader>
            <CloseButton
              onClick={onClose}
              _hover={{
                opacity: 0.8
              }}
            />
          </Flex>
          <Flex flexDir="column" px={6} maxH="100%" overflowY="hidden">
            <InputGroup
              p="8px 24px"
              border="none"
              background="bg"
              borderRadius="2px"
              display="flex"
            >
              <InputLeftElement pointerEvents="none" pos="absolute" top="4px" left="8px">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Find tokens by name"
                value={search}
                onChange={handleInputChange}
                size="sm"
                fontSize="16px"
                lineHeight="100%"
                ref={inputRef}
                border="none"
                borderRadius="2px"
              />
            </InputGroup>
            <Flex justifyContent="space-between" gap="8px" flexWrap="wrap" mt={6}>
              {commonlyUsedTokens.map(token => (
                <Flex
                  gap={2}
                  alignItems="center"
                  key={token.address}
                  p={2}
                  borderRadius="20px"
                  bg="bg"
                  cursor="pointer"
                  onClick={() => handleMenuItemClick(token)}
                >
                  <Image
                    src={token.logoURI}
                    width="20px"
                    height="20px"
                    alt={token.symbol}
                    borderRadius="50%"
                  />
                  <Text textStyle="textMono14" fontWeight={600}>
                    {token.symbol}
                  </Text>
                </Flex>
              ))}
            </Flex>
            <Flex flexDir="column" height="100%" overflowY="scroll" mt={3}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option: IToken) => (
                  <>
                    <Flex
                      key={option.address}
                      alignItems="center"
                      cursor="pointer"
                      justify="space-between"
                      p="16px"
                      borderRadius="2px"
                      _hover={{ background: "gray.800" }}
                      onClick={() => handleMenuItemClick(option)}
                    >
                      <Flex gap={2} alignItems="center">
                        {option.logoURI ? (
                          <Image
                            src={option.logoURI}
                            borderRadius={100}
                            alt={option.symbol}
                            boxSize="20px"
                            mr="4px"
                          />
                        ) : (
                          <Box boxSize="20px" bg="gray.200" mr="4px" />
                        )}
                        <Flex flexDir="column">
                          <Text textStyle="textMono14" ml="4px">
                            {option.symbol}
                          </Text>
                          <Text textStyle="textMono10" ml="4px" color="darkgrey">
                            {option.name}
                          </Text>
                        </Flex>
                      </Flex>
                      <Text textStyle="textMono14">{formatNumber(option?.value ?? 0)}</Text>
                    </Flex>
                    <Divider />
                  </>
                ))
              ) : (
                <Box p="6px">
                  <Text>No tokens found</Text>
                </Box>
              )}
            </Flex>
          </Flex>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Select;
