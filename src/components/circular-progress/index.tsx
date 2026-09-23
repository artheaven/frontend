import {
  CircularProgress as CircularProgressChakra,
  CircularProgressLabel
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import { TIME_INTERVAL } from "../../consts";

type CircularProgressProps = {
  resetCountDown: boolean;
};

export const CircularProgress = ({ resetCountDown }: CircularProgressProps) => {
  const [timeLeftMillis, setTimeLeftMillis] = useState(TIME_INTERVAL);
  const timeLeftSecond = (timeLeftMillis / 1000).toFixed();

  // Function to convert time to percentage
  const timeToPercentage = ((TIME_INTERVAL - timeLeftMillis) / TIME_INTERVAL) * 100;

  useEffect(() => {
    if (resetCountDown) {
      setTimeLeftMillis(TIME_INTERVAL);
    }
  }, [resetCountDown]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeftMillis > 0) {
        setTimeLeftMillis(timeLeftMillis - 100); // Subtract 1000ms (1 second)
      } else {
        setTimeLeftMillis(TIME_INTERVAL);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [timeLeftMillis]);

  return (
    <CircularProgressChakra
      color="ink"
      trackColor="bg.whiteAlpha100"
      size="44px"
      thickness="3px"
      value={timeToPercentage}
    >
      <CircularProgressLabel fontSize="xs">{timeLeftSecond}s</CircularProgressLabel>
    </CircularProgressChakra>
  );
};
