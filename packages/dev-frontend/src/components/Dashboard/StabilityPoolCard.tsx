import { Card, Flex } from "theme-ui";
import { COIN } from "../../utils/constants";

import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useThresholdSelector} from "@liquity/lib-react";

import { BottomCard } from "./BottomCard";
import { SystemStat } from "../SystemStat";

type StabilityPoolCardProps = {
  variant?: string;
};

const select = ({  thusdBalance, stabilityDeposit }: ThresholdStoreState) => ({
  thusdBalance,
  stabilityDeposit
});

export const StabilityPoolCard = ({ variant = "mainCards" }: StabilityPoolCardProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(select);
  const thresholdStore = thresholdSelectorStores[0]
  const store = thresholdStore?.store!;
  const thusdBalance = store.thusdBalance;
  const stabilityDeposit = store.stabilityDeposit.currentTHUSD;

  const stabilityStats = (
    <Flex sx={{ fontSize: "0.9em", flexDirection: "column", gridColumn: "span 2", gap: 2 }}>
        <SystemStat
          info={`Current Deposit`}
          tooltip={`The amount of ${ COIN } you've deposited in the stability pool.`}
        >
          {stabilityDeposit.toString(2) } { COIN }
        </SystemStat>
    </Flex>)
    
  return (
    <Card {...{ variant }}>
      <BottomCard 
        title='Stability Pool'
        stats={ stabilityStats }
        action='Deposit'
        tooltip={`The Stability Pool is the first line of defense in maintaining system solvency. It achieves that by acting as the source of liquidity to repay debt from liquidated Vaults—ensuring that the total ${ COIN } supply always remains backed.`}
        token={ COIN }
        tokenIcon="./icons/led-icon.png"
        path='/earn'
        isPoweredByBProtocol={true}
      >
        {(!thusdBalance.eq(0) ? thusdBalance.prettify() : '--')}
      </BottomCard>
    </Card>
  );
};
