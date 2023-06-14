import React, { useState } from "react";
import { Card, Flex } from "theme-ui";
import { ActionDescription } from "../ActionDescription";

import {
  selectForStabilityDepositChangeValidation,
  validateStabilityDepositChange
} from "./validation/validateStabilityDepositChange";

import { useMyTransactionState } from "../Transaction";
import {
  Decimal,
  Decimalish,
  StabilityDeposit,
  LiquityStoreState as ThresholdStoreState,
  Difference
} from "@liquity/lib-base";

import { useThresholdSelector } from "@liquity/lib-react";

import { COIN } from "../../utils/constants";

import { EditableRow, StaticRow } from "../Vault/Editor";
import { LoadingOverlay } from "../LoadingOverlay";
import { InfoIcon } from "../InfoIcon";
import { checkTransactionCollateral } from "../../utils/checkTransactionCollateral";

const select = ({ thusdBalance, thusdInStabilityPool, stabilityDeposit, symbol }: ThresholdStoreState) => ({
  thusdBalance,
  thusdInStabilityPool,
  stabilityDeposit,
  symbol
});

type StabilityDepositEditorProps = {
  version: string;
  collateral: string;
  isMintList: boolean;
  originalDeposit: StabilityDeposit;
  editedUSD: Decimal;
  changePending: boolean;
  dispatch: (action: { type: "setDeposit"; newValue: Decimalish } | { type: "revert" }) => void;
  children?: React.ReactNode
};

export const StabilityDepositEditor = ({
  version,
  collateral,
  isMintList,
  originalDeposit,
  editedUSD,
  changePending,
  dispatch,
  children
}: StabilityDepositEditorProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(select);
  const thresholdStore = thresholdSelectorStores.find((store) => {
    return store.version === version && store.collateral === collateral;
  });
  const store = thresholdStore?.store!;
  const thusdBalance = store.thusdBalance;
  const thusdInStabilityPool = store.thusdInStabilityPool;
  const stabilityDeposit = store.stabilityDeposit;
  const collateralSymbol = store.symbol;

  const editingState = useState<string>();
  const validationContextStores = useThresholdSelector(selectForStabilityDepositChangeValidation);
  const validationContextStore = validationContextStores.find((store) => {
    return store.version === version && store.collateral === collateral;
  });

  const maxAmount = stabilityDeposit.currentTHUSD.add(thusdBalance);
  const maxedOut = editedUSD.eq(maxAmount);
  const thusdInStabilityPoolAfterChange = thusdInStabilityPool
  .sub(originalDeposit.currentTHUSD)
  .add(editedUSD);

  const originalPoolShare = originalDeposit.currentTHUSD.mulDiv(100, thusdInStabilityPool);

  const newPoolShare = editedUSD.mulDiv(100, thusdInStabilityPoolAfterChange);
  const poolShareChange =
    originalDeposit.currentTHUSD.nonZero &&
    Difference.between(newPoolShare, originalPoolShare).nonZero;

  // const [, description] = validateStabilityDepositChange(
  //   version,
  //   collateral,
  //   isMintList,
  //   originalDeposit,
  //   editedUSD,
  //   validationContextStore?.store!,
  //   thusdDiff,
  //   collateralDiff,
  // );
  const makingNewDeposit = originalDeposit.isEmpty;

  const showOverlay = changePending
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
          <EditableRow
            label="Deposit"
            inputId="deposit-thusd"
            amount={editedUSD.prettify()}
            maxAmount={maxAmount.toString()}
            maxedOut={maxedOut}
            unit={COIN}
            {...{ editingState }}
            editedAmount={editedUSD.toString(2)}
            setEditedAmount={newValue => dispatch({ type: "setDeposit", newValue })}
          />
          {newPoolShare.infinite ? (
            <StaticRow label="Pool share" inputId="deposit-share" amount="N/A" />
          ) : (
            <StaticRow
              label="Pool share"
              inputId="deposit-share"
              amount={newPoolShare.prettify(4)}
              pendingAmount={poolShareChange?.prettify(4).concat("%")}
              pendingColor={poolShareChange?.positive ? "success" : "danger"}
              unit="%"
            />
          )}

          {!originalDeposit.isEmpty && (
            <>
            <Flex sx={{ justifyContent: 'space-between', flexWrap: "wrap" }}>
              <StaticRow
                  label={`Liquidation gain`}
                  inputId="deposit-gain"
                  unit={COIN}
                  amount={originalDeposit.collateralGain.prettify(4)}
                  color={originalDeposit.collateralGain.nonZero && "success"}
              />

              {/* <StaticRow
                label="Reward"
                inputId="deposit-reward"
                amount={originalDeposit.lqtyReward.prettify()}
                color={originalDeposit.lqtyReward.nonZero && "success"}
                unit={GT}
                infoIcon={
                  <InfoIcon
                    tooltip={
                      <Card variant="tooltip" sx={{ width: "240px" }}>
                        Although the LQTY rewards accrue every minute, the value on the UI only updates
                        when a user transacts with the Stability Pool. Therefore you may receive more
                        rewards than is displayed when you claim or adjust your deposit.
                      </Card>
                    }
                  />
                }
              /> */}
            </Flex>
            </>
          )}
          {makingNewDeposit ? (
              <ActionDescription>Enter the amount of {COIN} you'd like to deposit.</ActionDescription>
            ) : (
              <ActionDescription>Adjust the {COIN} amount to deposit or withdraw.</ActionDescription>
            )}
          {children}
        </Flex>
        {showOverlay && <LoadingOverlay />}
      </Card>
    </Card>
  );
};
