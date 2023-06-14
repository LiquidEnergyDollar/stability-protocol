import {
  Decimal,
  BammDeposit,
  BammDepositChange,
  StabilityDeposit,
  StabilityDepositChange
} from "@liquity/lib-base";

import {
  Difference
} from "@liquity/lib-base";

import { COIN } from "../../../utils/constants";
import { Amount } from "../../ActionDescription";
import { ErrorDescription } from "../../ErrorDescription";
import { StabilityActionDescription } from "../StabilityActionDescription";
import { UnlockButton } from "../NoDeposit"

export const selectForStabilityDepositChangeValidation = ({
  trove,
  thusdBalance,
  haveUndercollateralizedTroves,
  bammAllowance,
  isStabilityPools,
}: any) => ({
  trove,
  thusdBalance,
  haveUndercollateralizedTroves,
  bammAllowance,
  isStabilityPools,
});

type StabilityDepositChangeValidationContext = ReturnType<
  typeof selectForStabilityDepositChangeValidation
>;

export const validateStabilityDepositChange = (
  version: string,
  collateral: string,
  isMintList: boolean,
  originalDeposit: StabilityDeposit,
  editedTHUSD: Decimal,
  {
    thusdBalance,
    haveUndercollateralizedTroves,
  }: StabilityDepositChangeValidationContext,
  thusdDiff: Difference| undefined,
  collateralDiff: Difference| undefined,
): [
  validChange: StabilityDepositChange<Decimal> | undefined,
  description: JSX.Element | undefined
] => {
  const change = originalDeposit.whatChanged(editedTHUSD);

  if (!change) {
    return [undefined, undefined];
  }

  if (change.depositTHUSD && thusdBalance == 0) {
    return [
      undefined,
      <ErrorDescription>
        You must first have a {COIN} balance to deposit into the stability pool.
      </ErrorDescription>
    ];
  }

  if (change.withdrawTHUSD && haveUndercollateralizedTroves) {
    return [
      undefined,
      <ErrorDescription>
        You're not allowed to withdraw {COIN} from your Stability Deposit when there are
        undercollateralized Vaults. Please liquidate those Vaults or try again later.
      </ErrorDescription>
    ];
  }

  return [change, <StabilityActionDescription 
    version={version} 
    collateral={collateral} 
    thusdDiff={thusdDiff} 
    collateralDiff={collateralDiff} 
    originalDeposit={originalDeposit} 
    change={change} 
  />];
};
