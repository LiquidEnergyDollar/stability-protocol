import { Card } from "theme-ui";
import { Percent, LiquityStoreState, Decimal} from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";

import { TopCard } from "./TopCard";

import { useEffect, useState } from "react";

type SystemStatsProps = {
  variant?: string;
};

type mintListApproved = {
  version: string;
  collateral: string;
  price: Decimal;
  totalCollateralRatio: Decimal;
  mintList: boolean;
}

const selector = ({
  mintList,
  price,
  total
}: LiquityStoreState) => ({
  mintList,
  price,
  totalCollateralRatio: total.collateralRatio(price),
});

export const ColRatio = ({ variant = "mainCards" }: SystemStatsProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(selector)
  const [collateralData, setCollateralData] = useState({collateralsQty: 0, collateralRatioAvgPct: new Percent(Decimal.from(0))})
  const [isMounted, setIsMounted] = useState<boolean>(true);

  useEffect(() => {
    if (!isMounted) {
      return
    }
    let mintListApproved: mintListApproved[] = []
    for (const thresholdSelectorStore of thresholdSelectorStores) {
      if (thresholdSelectorStore.store.mintList === true) {
        mintListApproved = [...mintListApproved, {
          version: thresholdSelectorStore.version,
          collateral: thresholdSelectorStore.collateral,
          price: thresholdSelectorStore.store.price, 
          totalCollateralRatio: thresholdSelectorStore.store.totalCollateralRatio,
          mintList: true, 
        }]
      }
    }
    let collateralRatio = Decimal.from(0)   

    for (const collateralApproved of mintListApproved) {  
      collateralRatio = collateralRatio.infinite || collateralApproved.totalCollateralRatio.infinite
        ? Decimal.INFINITY 
        : collateralRatio.add(collateralApproved.totalCollateralRatio) 
    }

    const collateralRatioAvg = collateralRatio.infinite
      ? Decimal.INFINITY 
      : collateralRatio.div(thresholdSelectorStores.length)
      
      setCollateralData(
      {
        collateralsQty: Object.entries(mintListApproved).length, 
        collateralRatioAvgPct: new Percent(collateralRatioAvg)
      }
    )
    return () => {
      setIsMounted(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card {...{ variant }} sx={{ width:"100%"}}>
      <TopCard 
        name={`${collateralData.collateralsQty > 1 ? "Col. Ratio Avg." : "Total Col. Ratio"}`}
        tooltip="The ratio of the LED value of the entire system collateral at the current collateral : LED price, to the entire system debt." 
        imgSrc="./icons/col-ratio.svg" 
      >
        {collateralData.collateralRatioAvgPct.prettify()}
      </TopCard>
    </Card>
  );
};
