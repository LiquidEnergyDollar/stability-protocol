import { Card } from "theme-ui";
import { Decimal, LiquityStoreState as ThresholdStoreState} from "@liquity/lib-base";
import { useThresholdSelector} from "@liquity/lib-react";

import { TopCard } from "./TopCard";
import { COIN } from "../../utils/constants";

type SystemStatsProps = {
  variant?: string;
};

const selector = ({
    price,
    symbol,
  }: ThresholdStoreState) => ({
    price,
    symbol,
  });

export const PriceCard = ({ variant = "mainCards" }: SystemStatsProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(selector);
    const store = thresholdSelectorStores[0].store;
    const price = store.price;
    const inversePrice = Decimal.ONE.div(price);
  
  return (
    <Card {...{ variant }} sx={{ display: ['none', 'block'], width:"100%" }}>
      <TopCard
        name={`${ COIN } Price`}
        tooltip={`The price of ${ COIN } denominated in ${ thresholdSelectorStores[0].collateral }.`} 
        imgSrc="./icons/price-chart.png"
      >
        
        {inversePrice.prettify(2)}
      </TopCard>
    </Card>
  );
};
