import React from "react";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";

const pulse = keyframes`
  0% {
    transform: scale(1);
  }

  55% {
    background-color: rgba(201, 164, 92, 0.9);
    transform: scale(1.4);
  }
`;

const CustomBeacon = styled.span<{ isConnected: boolean }>`
  animation: ${pulse} 1s ease-in-out infinite;
  background-color: rgba(201, 164, 92, 0.6);
  border-radius: 50%;
  display: inline-block;
  height: 24px;
  width: 24px;
  cursor: pointer;
  position: relative;
  bottom: -10px;
  left: ${props => (props.isConnected ? "-12px" : "0")};
`;

interface BeaconComponentProps {
  isConnected: boolean;
}

const BeaconComponent: React.FC<BeaconComponentProps> = ({ isConnected, ...props }) => (
  <CustomBeacon isConnected={isConnected} title="Open dialog" {...props} />
);

export default BeaconComponent;
