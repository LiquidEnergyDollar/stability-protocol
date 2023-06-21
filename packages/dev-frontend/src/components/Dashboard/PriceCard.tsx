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
    marketPrice,
    piRedemptionRate,
    deviationFactor,
    symbol,
  }: ThresholdStoreState) => ({
    price,
    marketPrice,
    piRedemptionRate,
    deviationFactor,
    symbol,
  });

export const RedemptionPriceCard = ({ variant = "mainCards" }: SystemStatsProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(selector);
    const store = thresholdSelectorStores[0].store;
    const price = store.price;
    // TODO: Remove inverse after we switch methods
    const inversePrice = Decimal.ONE.div(price);
  
  return (
    <Card {...{ variant }} sx={{ display: ['none', 'block'], width:"100%" }}>
      <TopCard
        name={`${ COIN } Redemption Price`}
        tooltip={`The redemption price of ${ COIN } denominated in ${ thresholdSelectorStores[0].collateral }.`} 
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
  
  return (
    <Card {...{ variant }} sx={{ display: ['none', 'block'], width:"100%" }}>
      <TopCard
        name={`${ COIN } Market Price`}
        tooltip={`The market price of ${ COIN } denominated in ${ thresholdSelectorStores[0].collateral }.`} 
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
        tooltip={`The annualized yield that ${ COIN } holders are currently earning.`} 
        imgSrc="./icons/scale-icon.png"
      >
        
        {annualizedRate}%
      </TopCard>
    </Card>
  );
};

function annualizeInterestRate(redemptionRate: Decimal): string {
  const secondsPerYear = 31536000; // Approximate number of seconds in a year
  const ratePerYear = Number.parseFloat(redemptionRate.pow(secondsPerYear).prettify(2));
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
        tooltip={`The accumulated interest rate of ${ COIN } since deployment. Initialized to 1.`} 
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
        tooltip={`The price returned by the ${ COIN } Oracle.`} 
        imgSrc="./icons/price-chart.png"
      >
        
        {oraclePrice.prettify(4)}
      </TopCard>
    </Card>
  );
};