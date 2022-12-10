import React from "react";
import { Card } from "theme-ui";
import { COIN } from "../../strings";

import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useLiquitySelector as useThresholdSelector} from "@liquity/lib-react";

import { BottomCard } from "./BottomCard";

type StabilityPoolCardProps = {
  variant?: string;
};

const select = ({  thusdBalance }: ThresholdStoreState) => ({
  thusdBalance
});

export const StabilityPoolCard: React.FC<StabilityPoolCardProps> = ({ variant = "mainCards" }) => {
  const { thusdBalance } = useThresholdSelector(select);

  return (
    <Card {...{ variant }}>
      <BottomCard 
        title='Stability Pool'
        action='Deposit'
        tooltip={`The Stability Pool is the first line of defense in maintaining system solvency. It achieves that by acting as the source of liquidity to repay debt from liquidated Vaults—ensuring that the total ${ COIN } supply always remains backed.`}
        token={ COIN }
        path='/earn'
        disabled={ true }
      >
        {! thusdBalance.eq(0) ?  thusdBalance.prettify() : '--'}
      </BottomCard>
    </Card>
  );
};
