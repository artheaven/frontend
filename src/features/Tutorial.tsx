"use client";
import Joyride, {
  Placement,
  CallBackProps,
  STATUS,
  Status,
  ACTIONS,
  TooltipRenderProps
} from "react-joyride";
import { TutorialStep } from "@/types";
import { useAccount } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { LOCAL_STORAGE_KEYS, ROUTE_PATHS } from "@/consts";
import { usePathname, useRouter } from "next/navigation";
import localStore from "@/utils/localStore";
import GuideTooltip from "@/components/tooltip/GuideTooltip";
import BeaconComponent from "@/components/tutorial/Beacon";
import { useStore } from "@/hooks/useStoreContext";
import { observer } from "mobx-react-lite";
import { useMediaQuery } from "@chakra-ui/react";
import { tokens } from "@/themes/styles/colors";

const steps: TutorialStep[] = [
  {
    target: ".step-1",
    content: "Connect your wallet here",
    spotlightClicks: true
  },
  {
    target: ".step-2",
    content: "Click on the money market to reveal details",
    spotlightClicks: true,
    disableBeacon: true,
    placement: "top" as Placement
  },
  {
    target: ".step-3",
    content: "Here you can see the actual state and average Invictus APYs",
    disableBeacon: true
  },
  {
    target: ".step-4",
    content: "Start earning with Invictus now.\nMake your first deposit",
    disableBeacon: true,
    spotlightClicks: true,
    placement: "right" as Placement
  }
];

const connectedSteps: TutorialStep[] = [
  {
    target: ".step-1",
    content: "Wallet is already connected",
    isFixed: true
  },
  ...steps.slice(1)
];

const spotlight = {
  borderRadius: 4
};

const Tutorial = observer(() => {
  const { address } = useAccount();
  const pathname = usePathname();
  const router = useRouter();
  const isConnected = !!address;
  const [isActiveTutorial, setIsActiveTutorial] = useState(
    !localStore.getData(LOCAL_STORAGE_KEYS.isShownTutorial)
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [runTutorial, setRunTutorial] = useState(
    isActiveTutorial && pathname === ROUTE_PATHS.lending
  );
  const [shouldUpdateStep, setShouldUpdateStep] = useState(true);
  const {
    pools,
    isLoading: isLoadingPools,
    isFetched: isFetchedPools,
    setIsFetched: setIsFetchedPools
  } = useStore("poolsStore");
  const { isChartLoading, isLoading: isPoolLoading } = useStore("poolStore");
  const [isMobile] = useMediaQuery("(max-width: 480px)");

  const _steps = useMemo(() => {
    if (isConnected) {
      return connectedSteps;
    }

    if (isMobile) {
      return steps.map((step, index) => {
        if (index === steps.length - 1) {
          return {
            ...step,
            placement: "top" as Placement
          };
        }
        return step;
      });
    }

    return steps;
  }, [isConnected, isMobile]);

  useEffect(() => {
    if (!isActiveTutorial) {
      setRunTutorial(false);
    }
  }, [isActiveTutorial]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActiveTutorial && stepIndex === 0 && !!address && pathname === ROUTE_PATHS.lending) {
      setRunTutorial(false);

      timer = setTimeout(() => {
        setRunTutorial(true);
      }, 500);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isActiveTutorial, stepIndex, address, pathname]);

  useEffect(() => {
    if (isActiveTutorial && pathname !== ROUTE_PATHS.lending) {
      setRunTutorial(false);
    }
  }, [isActiveTutorial, pathname]);

  useEffect(() => {
    if (stepIndex === 1 && !pools.length) {
      setRunTutorial(false);
    }
  }, [stepIndex, pools.length]);

  useEffect(() => {
    if (stepIndex === 1 && pools.length && isFetchedPools) {
      setRunTutorial(true);
    }
  }, [stepIndex, pools.length, isFetchedPools]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (
      isActiveTutorial &&
      pathname.includes(ROUTE_PATHS.lendingAsset.slice(0, 6)) &&
      isFetchedPools
    ) {
      setStepIndex(2);
      setShouldUpdateStep(false);
      timer = setTimeout(() => {
        setRunTutorial(true);
      }, 500);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isActiveTutorial, pathname, isFetchedPools]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_KEYS.isShownTutorial) {
        const tutorialShown = localStore.getData(LOCAL_STORAGE_KEYS.isShownTutorial);
        setIsActiveTutorial(!tutorialShown);
        setRunTutorial(!tutorialShown);
      }
    };

    const handleCustomStorageChange = (event: CustomEvent<{ key: string; value: any }>) => {
      if (event.detail.key === LOCAL_STORAGE_KEYS.isShownTutorial) {
        const tutorialShown = localStore.getData(LOCAL_STORAGE_KEYS.isShownTutorial);
        setIsActiveTutorial(!tutorialShown);
        setRunTutorial(!tutorialShown);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localStorageChange", handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localStorageChange", handleCustomStorageChange as EventListener);
    };
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type, action } = data;
    const finishedStatuses: Status[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status) || action === ACTIONS.CLOSE) {
      setRunTutorial(false);
      localStore.post(LOCAL_STORAGE_KEYS.isShownTutorial, true);
    }

    if (!shouldUpdateStep) {
      setShouldUpdateStep(true);
      return;
    }

    if (action === ACTIONS.NEXT) {
      setStepIndex(prev => prev + 1);
      setShouldUpdateStep(false);
    }

    if (action === ACTIONS.PREV) {
      setStepIndex(prev => prev - 1);
      setShouldUpdateStep(false);
    }

    if (action === ACTIONS.PREV) {
      switch (stepIndex) {
        case 2:
          router.prefetch(ROUTE_PATHS.lending);
          router.push(ROUTE_PATHS.lending, { scroll: false });
          setIsFetchedPools(false);
          setShouldUpdateStep(false);
          setRunTutorial(false);
          setStepIndex(1);
          break;
      }
    }

    if (action === ACTIONS.NEXT) {
      switch (stepIndex) {
        case 1:
          router.push(ROUTE_PATHS.lendingAssetPage("arb", "USDT"), { scroll: false });
          setStepIndex(2);
          setShouldUpdateStep(false);
          break;
      }
    }
  };

  const getDisabledNextButtonState = () => {
    if (stepIndex === 2 && (isChartLoading || isPoolLoading)) {
      return true;
    }
    if (stepIndex === 0 && isLoadingPools) {
      return true;
    }
    return false;
  };

  return (
    <Joyride
      steps={_steps}
      stepIndex={stepIndex}
      run={runTutorial}
      callback={handleJoyrideCallback}
      showProgress
      debug={false}
      hideCloseButton
      continuous
      scrollOffset={140}
      scrollDuration={500}
      scrollToFirstStep
      disableOverlayClose
      disableOverlay
      disableScrollParentFix
      floaterProps={{
        disableAnimation: !!(stepIndex === 0)
      }}
      tooltipComponent={(props: TooltipRenderProps) => (
        <GuideTooltip
          stepIndex={stepIndex}
          stepsLength={steps.length}
          showNextButton
          showBackButton={stepIndex !== 0}
          isDisabledNextButton={getDisabledNextButtonState()}
          {...props}
        />
      )}
      beaconComponent={props => <BeaconComponent isConnected={!!address} {...props} />}
      styles={{
        options: {
          backgroundColor: tokens.bg3,
          textColor: tokens.ink,
          arrowColor: tokens.bg3,
          primaryColor: tokens.accent,
          spotlightShadow:
            "0 0 20px 10px rgba(0, 0, 0, 0.5), 0 0 40px 20px rgba(0, 0, 0, 0.3), 0 0 60px 30px rgba(0, 0, 0, 0.1)"
        },
        beaconInner: {
          backgroundColor: tokens.accent
        },
        beaconOuter: {
          border: `2px solid ${tokens.accent}`
        },
        tooltip: {
          borderRadius: "12px",
          fontSize: "18px",
          width: "fit-content"
        },
        spotlight: {
          ...spotlight,
          zIndex: 9999,
          backdropFilter: "none",
          transform: "translateZ(0)"
        }
      }}
    />
  );
});

export default Tutorial;
