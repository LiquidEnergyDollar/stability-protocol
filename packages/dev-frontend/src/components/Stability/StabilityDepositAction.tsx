import { Button } from "theme-ui";
import { Decimal, StabilityDepositChange } from "@liquity/lib-base";

import { useThreshold } from "../../hooks/ThresholdContext";
import { useTransactionFunction } from "../Transaction";

type StabilityDepositActionProps = {
  version: string;
  collateral: string;
  transactionId: string;
  change: StabilityDepositChange<Decimal>;
  isStabilityPools: boolean,
  children: React.ReactNode
};

export const StabilityDepositAction: React.FC<StabilityDepositActionProps> = ({
  version,
  collateral,
  transactionId,
  change,
  isStabilityPools,
  children,
}: StabilityDepositActionProps): JSX.Element => {
  const { threshold } = useThreshold();
  const collateralThreshold = threshold.find((versionedThreshold) => {
    return versionedThreshold.version === version && versionedThreshold.collateral === collateral;
  })!;
  
  const send = collateralThreshold.store.send

  const [sendTransaction] = useTransactionFunction(
    transactionId,
    change.depositTHUSD
      ? send.depositTHUSDInStabilityPool.bind(send, change.depositTHUSD)
      : send.withdrawTHUSDFromStabilityPool.bind(send, change.withdrawTHUSD),
    version,
    collateral,
  );

  return <Button disabled={!isStabilityPools} onClick={sendTransaction}>{children}</Button>;
};
