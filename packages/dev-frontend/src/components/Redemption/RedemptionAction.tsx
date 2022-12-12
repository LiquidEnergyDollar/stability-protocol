import { Button } from "theme-ui";

import { Decimal } from "@liquity/lib-base";

import { useThreshold } from "../../hooks/ThresholdContext";
import { useTransactionFunction } from "../Transaction";

type RedemptionActionProps = {
  transactionId: string;
  disabled?: boolean;
  thusdAmount: Decimal;
  maxRedemptionRate: Decimal;
};

export const RedemptionAction: React.FC<RedemptionActionProps> = ({
  transactionId,
  disabled,
  thusdAmount,
  maxRedemptionRate
}) => {
  // TODO
  // const {
  //   threshold: { send: threshold }
  // } = useThreshold();

  // const [sendTransaction] = useTransactionFunction(
  //   transactionId,
  //   threshold.redeemTHUSD.bind(threshold, thusdAmount, maxRedemptionRate)
  // );

  return (
    // TODO add onClick={sendTransaction}
    <Button disabled={disabled}  sx={{ width: '100%' }}>
      Confirm
    </Button>
  );
};
