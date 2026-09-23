import {
  Circle,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Tab,
  TabList,
  TabPanels,
  Tabs,
  Text
} from "@chakra-ui/react";
import React, { FC, useState } from "react";

import Icon from "../../components/icon";
import { ICON_NAMES } from "../../consts";
import { ArchivedTab } from "./components/ArchivedTab";
import { InboxTab } from "./components/InboxTab";
import { NewsFeedTab } from "./components/NewsFeedTab";
import { INotificationProps } from "./types";

const NotificationTabs = [
  {
    key: 1,
    name: "Inbox",
    count: 2
  },
  {
    key: 2,
    name: "News feed",
    count: 3
  },
  {
    key: 3,
    name: "Archived"
  }
];

export const Notification: FC<INotificationProps> = ({ isOpen, onClose }) => {
  const [tabIndex, setTabIndex] = useState(0);
  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader as={Flex} align="center" justify="space-between">
          <Flex align="inherit" gap="4px">
            <Icon
              style={{cursor: "pointer"}}
              aria-label="back"
              name={ICON_NAMES.close}
              size="36px"
              onClick={onClose}
            />
            <Text>Notification</Text>
          </Flex>
          <Flex
            p="4px 12px"
            align="inherit"
            border="1px solid"
            borderColor="lineStrong"
            borderRadius="50px"
            fontSize="xs"
          >
            Mark all as read
          </Flex>
        </DrawerHeader>

        <DrawerBody as={Flex}>
          <Tabs
            index={tabIndex}
            variant="unstyled"
            w="100%"
            isLazy={true}
            onChange={index => setTabIndex(index)}
          >
            <TabList justifyContent="center" gap="4px">
              {NotificationTabs.map((elem, i) => {
                const isActive = i === tabIndex;
                return (
                  <Tab
                    key={elem.key}
                    p="4px 8px"
                    gap="4px"
                    borderBottom="1px solid transparent"
                    borderColor={isActive ? "greenAlpha.100" : undefined}
                  >
                    <Text color={isActive ? "white" : "gray.80"}>{elem.name}</Text>

                    {elem.count && (
                      <Circle
                        size="16px"
                        fontSize="xs"
                        borderRadius="50px"
                        color={isActive ? "black.80" : "white"}
                        bg={isActive ? "greenAlpha.100" : "black.40"}
                      >
                        {elem.count}
                      </Circle>
                    )}
                  </Tab>
                );
              })}
            </TabList>

            <TabPanels>
              <InboxTab />
              <NewsFeedTab />
              <ArchivedTab />
            </TabPanels>
          </Tabs>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
