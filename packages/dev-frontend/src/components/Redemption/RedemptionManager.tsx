import { useCallback, useEffect, useState } from "react";
import { Box, Flex, Card, Link } from "theme-ui";

import { Decimal, Percent, LiquityStoreState as ThresholdStoreState, MINIMUM_COLLATERAL_RATIO } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";

import { COIN } from "../../utils/constants";

import { LoadingOverlay } from "../LoadingOverlay";
import { EditableRow, StaticRow } from "../Vault/Editor";
import { ActionDescription, Amount } from "../ActionDescription";
import { ErrorDescription } from "../ErrorDescription";
import { useMyTransactionState } from "../Transaction";

import { RedemptionAction } from "./RedemptionAction";
import { InfoIcon } from "../InfoIcon";
import { checkTransactionCollateral } from "../../utils/checkTransactionCollateral";

const mcrPercent = new Percent(MINIMUM_COLLATERAL_RATIO).toString(0);

const select = ({ price, fees, total, thusdBalance, symbol, isTroveManager }: ThresholdStoreState) => ({
  price,
  fees,
  total,
  thusdBalance,
  symbol,
  isTroveManager
});

type RedemptionManagerProps = {
  version: string;
  collateral: string;
}

const transactionId = "redemption";

export const RedemptionManager = ({ version, collateral }: RedemptionManagerProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(select);
  const thresholdStore = thresholdSelectorStores.find((store) => {
    return store.version === version && store.collateral === collateral;
  });
  const store = thresholdStore?.store!;
  const { price, fees, total, thusdBalance, symbol, isTroveManager } = store

  const [thusdAmount, setTHUSDAmount] = useState(Decimal.ZERO);
  const [changePending, setChangePending] = useState(false);
  const editingState = useState<string>();

  const dirty = !thusdAmount.isZero;
  const ethAmount = thusdAmount.div(price);
  const redemptionRate = fees.redemptionRate(thusdAmount.div(total.debt));
  const feePct = new Percent(redemptionRate);
  const ethFee = ethAmount.mul(redemptionRate);
  const maxRedemptionRate = redemptionRate.add(0.001); // TODO slippage tolerance

  const myTransactionState = useMyTransactionState(transactionId, version, collateral);
  const isCollateralChecked = checkTransactionCollateral(
    myTransactionState,
    version,
    collateral
  );

  const handleSetChangePending = useCallback(
    (value) => {
      setChangePending(value);
    },
    [setChangePending]
  );
  
  const handleSetTHUSDAmount = useCallback(
    (value) => {
      setTHUSDAmount(value);
    },
    [setTHUSDAmount]
  );

  useEffect(() => {
    if (
      isCollateralChecked &&
      (myTransactionState.type === "waitingForApproval" ||
      myTransactionState.type === "waitingForConfirmation")
    ) {
      handleSetChangePending(true);
    } else if (isCollateralChecked && (myTransactionState.type === "failed" || myTransactionState.type === "cancelled")) {
      handleSetChangePending(false);
    } else if (isCollateralChecked && (myTransactionState.type === "confirmed" || myTransactionState.type === "confirmedOneShot")) {
      handleSetTHUSDAmount(Decimal.ZERO);
      handleSetChangePending(false);
    }
  }, 
  [isCollateralChecked, myTransactionState.type, handleSetChangePending, handleSetTHUSDAmount, collateral]);

  const [canRedeem, description] = total.collateralRatioIsBelowMinimum(price)
    ? [
        false,
        <ErrorDescription>
          You can't redeem thUSD when the total collateral ratio is less than{" "}
          <Amount>{mcrPercent}</Amount>. Please try again later.
        </ErrorDescription>
      ]
    : thusdAmount.gt(thusdBalance)
    ? [
        false,
        <ErrorDescription>
          The amount you're trying to redeem exceeds your balance by{" "}
          <Amount>
            {thusdAmount.sub(thusdBalance).prettify()} {COIN}
          </Amount>
          .
        </ErrorDescription>
      ]
    : [
        true,
        <ActionDescription>
          You will receive <Amount>{ethAmount.sub(ethFee).prettify(4)} {symbol}</Amount> in exchange for{" "}
          <Amount>
            {thusdAmount.prettify()} {COIN}
          </Amount>
          .
        </ActionDescription>
      ];

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
              Reedem
            </Flex>
            { symbol } Collateral
          </Flex>
        <Flex sx={{
          width: "100%",
          flexDirection: "column",
          px: ["1em", 0, "1.6em"],
          pb: "1em"
        }}>
          <EditableRow
            label="Redeem"
            inputId="redeem-thusd"
            amount={thusdAmount.prettify()}
            maxAmount={thusdBalance.toString()}
            maxedOut={thusdAmount.eq(thusdBalance)}
            unit={COIN}
            {...{ editingState }}
            editedAmount={thusdAmount.toString(2)}
            setEditedAmount={amount => setTHUSDAmount(Decimal.from(amount))}
          />
          <Box sx={{ mt: -3 }}>
            <StaticRow
              label="Redemption Fee"
              inputId="redeem-fee"
              amount={ethFee.toString(4)}
              pendingAmount={feePct.toString(2)}
              unit={ symbol }
              infoIcon={
                <InfoIcon
                  tooltip={
                    <Card variant="tooltip" sx={{ minWidth: "240px" }}>
                      The Redemption Fee is charged as a percentage of the redeemed collateral. The Redemption
                      Fee depends on thUSD redemption volumes and is 0.5% at minimum.
                    </Card>
                  }
                />
              }
            />
          </Box>

          {((dirty || !canRedeem) && description) || (
            <ActionDescription>Enter the amount of {COIN} you'd like to redeem.</ActionDescription>
          )}

          <Flex variant="layout.actions">
            <RedemptionAction
              version={version}
              collateral={collateral}
              transactionId={transactionId}
              disabled={!dirty || !canRedeem || !isTroveManager}
              thusdAmount={thusdAmount}
              maxRedemptionRate={maxRedemptionRate}
            />
          </Flex>
          <Flex sx={{ 
            alignSelf: "center",
            fontSize: 11,
            fontWeight: "body",
            justifyContent: "space-between",
            width: "100%",
            px: "1em",
            mt: 3,
            display: "none !important"
          }}>
            <Flex>
              <Link variant="cardLinks" href="https://docs.threshold.network/fundamentals/threshold-usd" target="_blank">Read about</Link>
              in the documentation
            </Flex>
            <Flex>Deployment version: {version}</Flex>
          </Flex>
        </Flex>
        {changePending && <LoadingOverlay />}
      </Card>
    </Card>
  );
};
