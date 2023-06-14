import React, { useState, useCallback, useEffect, useRef } from "react";
import { useThresholdSelector } from "@liquity/lib-react";
import { LiquityStoreState as ThresholdStoreState, StabilityDeposit } from "@liquity/lib-base";
import { StabilityViewContext } from "./StabilityViewContext";
import type { StabilityView, StabilityEvent } from "./types";

type StabilityEventTransitions = Record<
  StabilityView,
  Partial<Record<StabilityEvent, StabilityView>>
>;

const transitions: StabilityEventTransitions = {
  NONE: {
    DEPOSIT_PRESSED: "DEPOSITING"
  },
  DEPOSITING: {
    CANCEL_PRESSED: "NONE",
    DEPOSIT_CONFIRMED: "ACTIVE"
  },
  ACTIVE: {
    REWARDS_CLAIMED: "ACTIVE",
    ADJUST_DEPOSIT_PRESSED: "ADJUSTING",
    DEPOSIT_EMPTIED: "NONE"
  },
  ADJUSTING: {
    CANCEL_PRESSED: "ACTIVE",
    DEPOSIT_CONFIRMED: "ACTIVE",
    DEPOSIT_EMPTIED: "NONE"
  }
};

const transition = (view: StabilityView, event: StabilityEvent): StabilityView => {
  const nextView = transitions[view][event] ?? view;
  return nextView;
};

const getInitialView = (stabilityDeposit: StabilityDeposit): StabilityView => {
  return stabilityDeposit.isEmpty ? "NONE" : "ACTIVE";
};

type StabilityViewProviderProps = {
  loader: React.ReactNode;
  children: React.ReactNode;
};

export type StabilityStatus = {
  version: string;
  collateral: string;
  initialView: StabilityView;
};

const select = ({ stabilityDeposit }: ThresholdStoreState): StabilityDeposit => stabilityDeposit;

export const StabilityViewProvider = (props: StabilityViewProviderProps): JSX.Element => {
  const { children } = props;
  const thresholdSelectorStores = useThresholdSelector(select);
  const [views, setViews] = useState<StabilityStatus[]>([]);
  const [isMounted, setIsMounted] = useState<boolean>(true);
  
  useEffect(() => {
    if (!thresholdSelectorStores || !isMounted) {
      return
    }
    let stabilityInitialStatus: StabilityStatus[] = []

    for (const thresholdSelectorStore of thresholdSelectorStores) {
      const store = thresholdSelectorStore?.store!;
      const stabilityDeposit = store;

      stabilityInitialStatus = [
        ...stabilityInitialStatus, 
        {
          version: thresholdSelectorStore.version,
          collateral: thresholdSelectorStore.collateral,
          initialView: getInitialView(stabilityDeposit)
        }
      ]
    }
    
    setViews(stabilityInitialStatus)
    return () => {
      setIsMounted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const viewsRef = useRef<StabilityStatus[]>(views);

  const dispatchEvent = useCallback((event: StabilityEvent, version: string, collateral: string) => {
    if (viewsRef.current.length === 0) {
      return
    }

    const current = viewsRef.current.find((view) => {
      return view.version === version && view.collateral === collateral;
    });
    const nextView = transition((current as StabilityStatus).initialView as StabilityView, event);

    console.log(
      "dispatchEvent() [current-view, event, next-view]",
      (current as StabilityStatus).initialView,
      event,
      nextView
    );
    
    setViews(prev => {
      const index = prev.findIndex(view => view.version === version && view.collateral === collateral);
      const nextView = transition(prev[index].initialView, event);
    
      if (index !== -1) {
        const updatedView = { ...prev[index], initialView: nextView };
        return [...prev.slice(0, index), updatedView, ...prev.slice(index + 1)];
      } else {
        return [...prev, { version, collateral, initialView: nextView }];
      }
    });

  }, []);

  useEffect(() => {
      viewsRef.current = views;
  }, [views]);

  useEffect(() => {
    if (!thresholdSelectorStores) {
      return
    }

    for (const thresholdSelectorStore of thresholdSelectorStores) {
      const store = thresholdSelectorStore?.store!;
      const stabilityDeposit = store;

      if (stabilityDeposit.isEmpty) {
        dispatchEvent("DEPOSIT_EMPTIED", thresholdSelectorStore.version, thresholdSelectorStore.collateral);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const provider = {
    views,
    dispatchEvent
  };

  return <StabilityViewContext.Provider value={provider}>{children}</StabilityViewContext.Provider>;
};
