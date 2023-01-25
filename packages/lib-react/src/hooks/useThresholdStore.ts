import { useContext } from "react";

import { LiquityStore as ThresholdStore} from "@liquity/lib-base";

import { ThresholdStoreContext } from "../components/ThresholdStoreProvider";

export const useThresholdStore = <T>(): ThresholdStore<T>[] => {
  const stores = useContext(ThresholdStoreContext);

  if (!stores) {
    throw new Error("You must provide a ThresholdStore via ThresholdStoreProvider");
  }

  return stores as ThresholdStore<T>[];
};
