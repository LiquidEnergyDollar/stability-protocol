import { Card } from "theme-ui";
import { Decimal, LiquityStoreState as ThresholdStoreState} from "@liquity/lib-base";
import { useThresholdSelector} from "@liquity/lib-react";

import { TopCard } from "./TopCard";
import { COIN } from "../../utils/constants";
import { TooltipText, selector } from "../../utils/tooltips"

type SystemStatsProps = {
  variant?: string;
};

export const RedemptionPriceCard = ({ variant = "mainCards" }: SystemStatsProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(selector);
    const store = thresholdSelectorStores[0].store;
    const collat = thresholdSelectorStores[0].collateral
    const price = store.price;
    // TODO: Remove inverse after we switch methods
    const inversePrice = Decimal.ONE.div(price);
  
  return (
    <Card {...{ variant }} sx={{ display: ['none', 'block'], width:"100%" }}>
      <TopCard
        name={`${ COIN } Redemption Price`}
        tooltip={TooltipText.redemptionPrice(COIN, collat)}
        imgSrc="./icons/price-chart.png"
      >
        
        {inversePrice.prettify(4)}
      </TopCard>
    </Card>
  );
};

export const MarketPriceCard = ({ variant = "mainCards" }: SystemStatsProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(selector);
    const store = thresholdSelectorStores[0].store;
    const price = store.marketPrice;
    const collat = thresholdSelectorStores[0].collateral
  
  return (
    <Card {...{ variant }} sx={{ display: ['none', 'block'], width:"100%" }}>
      <TopCard
        name={`${ COIN } Market Price`}
        tooltip={TooltipText.marketPrice(COIN, collat)}
        imgSrc="./icons/price-chart.png"
      >
        
        {price.prettify(4)}
      </TopCard>
    </Card>
  );
};

export const RedemptionRateCard = ({ variant = "mainCards" }: SystemStatsProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(selector);
    const store = thresholdSelectorStores[0].store;
    const redemptionRate = store.piRedemptionRate;
    const annualizedRate = annualizeInterestRate(redemptionRate);

  return (
    <Card {...{ variant }} sx={{ display: ['none', 'block'], width:"100%" }}>
      <TopCard
        name={`${ COIN } APY`}
        tooltip={TooltipText.redemptionRate(COIN)}
        imgSrc="./icons/scale-icon.png"
      >
        
        {annualizedRate}%
      </TopCard>
    </Card>
  );
};

function annualizeInterestRate(redemptionRate: Decimal): string {
  const tournamentEndDate = new Date('Jul 08 2023 19:00 GMT').getTime();
  const secondsUntilEnd = Math.floor((tournamentEndDate - new Date().getTime()) / 1000)
  const ratePerYear = Number.parseFloat(redemptionRate.pow(secondsUntilEnd).prettify(2));
  return ((ratePerYear * 100) - 100).toFixed(2);;
}

export const DeviationFactorCard = ({ variant = "mainCards" }: SystemStatsProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(selector);
    const store = thresholdSelectorStores[0].store;
    const factor = store.deviationFactor;

  return (
    <Card {...{ variant }} sx={{ display: ['none', 'block'], width:"100%" }}>
      <TopCard
        name={`Deviation Factor`}
        tooltip={TooltipText.deviationFactor(COIN)}
        imgSrc="./icons/scale-icon.png"
      >
        
        {factor.prettify(4)}
      </TopCard>
    </Card>
  );
};

export const OraclePriceCard = ({ variant = "mainCards" }: SystemStatsProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(selector);
    const store = thresholdSelectorStores[0].store;
    const redemptionPrice = store.price;
    const inversePrice = Decimal.ONE.div(redemptionPrice);
    const factor = store.deviationFactor;
    const oraclePrice = inversePrice.div(factor);
  
  return (
    <Card {...{ variant }} sx={{ display: ['none', 'block'], width:"100%" }}>
      <TopCard
        name={`${ COIN } Oracle Price`}
        tooltip={TooltipText.oraclePrice(COIN)}
        imgSrc="./icons/price-chart.png"
      >
        
        {oraclePrice.prettify(4)}
      </TopCard>
    </Card>
  );
};
