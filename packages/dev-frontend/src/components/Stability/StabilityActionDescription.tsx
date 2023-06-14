import { Decimal, Difference, LiquityStoreState as ThresholdStoreState, StabilityDeposit, StabilityDepositChange} from "@liquity/lib-base";

import { COIN } from "../../utils/constants";
import { ActionDescription, Amount } from "../ActionDescription";
import { useThresholdSelector } from "@liquity/lib-react";
import { Box } from "theme-ui";

export const select = ({
  symbol
}: ThresholdStoreState) => ({
  symbol
});

type StabilityActionDescriptionProps = {
  version: string;
  collateral: string;
  originalDeposit: StabilityDeposit;
  change: StabilityDepositChange<Decimal>;
  thusdDiff: Difference | undefined
  collateralDiff: Difference | undefined
};

export const StabilityActionDescription = ({
  version,
  collateral,
  originalDeposit,
  change,
  thusdDiff,
  collateralDiff,
}: StabilityActionDescriptionProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(select);
  const thresholdStore = thresholdSelectorStores.find((store) => {
    return store.version === version && store.collateral === collateral;
  });
  const store = thresholdStore?.store!;
  const collateralSymbol = store.symbol;

  const collateralGain = originalDeposit.collateralGain.nonZero?.prettify(4).concat(` ${collateralSymbol}`);

  let collateralDiffPrettified = collateralDiff?.prettify(4)
  if(collateralDiffPrettified && (collateralDiffPrettified.indexOf("-") > -1 || collateralDiffPrettified.indexOf("+") > -1)){
    collateralDiffPrettified = collateralDiffPrettified.substr(1)
  }
  let thusdDiffPrettified = thusdDiff?.prettify(2)
  if(thusdDiffPrettified && (thusdDiffPrettified.indexOf("-") > -1 || thusdDiffPrettified.indexOf("+") > -1)){
    thusdDiffPrettified = thusdDiffPrettified.substr(1)
  }
  return (
    <ActionDescription>
      <Box sx={{ mb: 2 }}>
        {change.depositTHUSD ? (
          <>
            You are depositing{" "}
            <Amount>
              {change.depositTHUSD.prettify()} {COIN}
            </Amount>{" "}
            in the Stability Pool
          </>
        ) : (
          <>
            You are withdrawing{" "}
            <Amount>
              {thusdDiffPrettified} {COIN}
            </Amount>{" "}
              {collateralDiff?.absoluteValue?.gte(1/10000) &&
            <>
              And
              {" "}
              <Amount>
              {collateralDiffPrettified} {collateralSymbol}
              </Amount>{" "}
            </>
            }
            to your wallet
          </>
        )}
      </Box>
      {collateralGain && (
        <>
          {" "}
          and claiming at least{" "}
            <Amount>{collateralGain} {collateralSymbol}</Amount>
        </>
      )}
    </ActionDescription>
  );
};
