import { useCallback, useEffect } from "react";
import { Card, Box, Flex, Button, Link } from "theme-ui";

import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";

import { COIN } from "../../utils/constants";
import { Icon } from "../Icon";
import { LoadingOverlay } from "../LoadingOverlay";
import { useMyTransactionState } from "../Transaction";
import { DisabledEditableRow, StaticRow } from "../Vault/Editor";

import { ClaimRewards } from "./actions/ClaimRewards";
import { useStabilityView } from "./context/StabilityViewContext";
import { InfoIcon } from "../InfoIcon";
import { checkTransactionCollateral } from "../../utils/checkTransactionCollateral";

const selector = ({ stabilityDeposit, trove, symbol, thusdInStabilityPool }: ThresholdStoreState) => ({
  stabilityDeposit,
  trove,
  symbol,
  thusdInStabilityPool
});

type ActiveDepositProps = {
  version: string;
  collateral: string;
  isMintList: boolean;
}

export const ActiveDeposit = (props: ActiveDepositProps): JSX.Element => {
  const { version, collateral } = props;
  const { dispatchEvent } = useStabilityView();
  const thresholdSelectorStores = useThresholdSelector(selector);
  const thresholdStore = thresholdSelectorStores.find((store) => {
    return store.version === version && store.collateral === collateral;
  });
  const store = thresholdStore?.store!;
  const stabilityDeposit = store.stabilityDeposit;
  const collateralSymbol = store.symbol;
  const thusdInStabilityPool = store.thusdInStabilityPool;
  const poolShare = stabilityDeposit.currentTHUSD.mulDiv(100, thusdInStabilityPool);

  const handleAdjustDeposit = useCallback(() => {
    dispatchEvent("ADJUST_DEPOSIT_PRESSED", version, collateral);
  }, [version, collateral, dispatchEvent]);

  const hasGain = !stabilityDeposit.collateralGain.isZero;

  const transactionId = "stability-deposit";
  const transactionState = useMyTransactionState(transactionId, version, collateral);
  const isCollateralChecked = checkTransactionCollateral(
    transactionState,
    version,
    collateral
  );

  const isWaitingForTransaction = isCollateralChecked &&
    (transactionState.type === "waitingForApproval" ||
    transactionState.type === "waitingForConfirmation");

  useEffect(() => {
    if (transactionState.type === "confirmedOneShot") {
      dispatchEvent("REWARDS_CLAIMED", version, collateral);
    }
  }, [version, collateral, transactionState.type, dispatchEvent]);

  return (
    <Card variant="mainCards">
      <Card variant="layout.columns">
        <Flex sx={{
          justifyContent: "space-between",
          width: "100%",
          gap: 1,
          pb: "1em",
          px: ["2em", 0],
          borderBottom: 1, 
          borderColor: "border"
        }}>
          <Flex sx={{ gap: 1 }}>
            Stability Pool
          </Flex>
          { collateralSymbol } Collateral
        </Flex>
        <Flex sx={{
          width: "100%",
          flexDirection: "column",
          px: ["1em", 0, "1.7em"],
          pb: "1em",
          mt: 2
        }}>
          <Box onClick={handleAdjustDeposit}>
            <DisabledEditableRow
              label="Deposit"
              inputId="deposit-lusd"
              amount={stabilityDeposit.currentTHUSD.prettify()}
              unit={COIN}
            />
            <Flex sx={{ justifyContent: 'space-between', flexWrap: "wrap" }}>
              <StaticRow
                label="Liquidation gain"
                inputId="deposit-gain"
                amount={stabilityDeposit.collateralGain.prettify(2)}
                unit={COIN}
              />
            </Flex>
            <StaticRow
              label="Pool share"
              inputId="deposit-share"
              amount={poolShare.prettify(4)}
              unit="%"
            />
          </Box>
          <Flex variant="layout.actions" sx={{ flexDirection: "column", gap: "1em" }}>
            <Button onClick={handleAdjustDeposit} sx={{ borderRadius: "12px", mt: 2 }}>
              <Icon name="pen" size="sm" />
              &nbsp;Adjust
            </Button>
            <ClaimRewards version={version} collateral={collateral} disabled={!hasGain}>Claim Rewards</ClaimRewards>
            <Flex sx={{ 
              alignSelf: "center",
              fontSize: 11,
              fontWeight: "body",
              justifyContent: "space-between",
              width: "100%",
              px: "1em",
              display: "none !important"
            }}>
              <Flex>
                <Link variant="cardLinks" href="https://docs.threshold.network/fundamentals/threshold-usd" target="_blank">Read about</Link>
                in the documentation
              </Flex>
              <Flex>Deployment version: {version}</Flex>
            </Flex>
          </Flex>
        </Flex>
        {isWaitingForTransaction && <LoadingOverlay />}
      </Card>
    </Card>
  );
};
