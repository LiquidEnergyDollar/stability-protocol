import { useState, useEffect } from "react";
import { Box, Card, Flex } from "theme-ui";
import { Decimal, Percent, LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";
import { COIN } from "../utils/constants";

import { SystemStat } from "./SystemStat";
import { EditPrice } from "./Dashboard/EditPrice";

type SystemStatsCardProps = {
  variant?: string;
  IsPriceEditable?: boolean
};

const selector = ({
  numberOfTroves,
  price,
  total,
  thusdInStabilityPool,
  borrowingRate,
  redemptionRate,
  pcvBalance,
  symbol,
  stabilityDeposit
}: ThresholdStoreState) => ({
  numberOfTroves,
  price,
  total,
  thusdInStabilityPool,
  borrowingRate,
  redemptionRate,
  pcvBalance,
  symbol,
  stabilityDeposit
});

export const SystemStatsCard = ({ variant = "info", IsPriceEditable }: SystemStatsCardProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(selector);
  const [borrowingFeeAvgPct, setBorrowingFeeAvgPct] = useState(new Percent(Decimal.from(0)))
  const [totalVaults, setTotalVaults] = useState(0)
  // const [thusdInSP, setThusdInSP] = useState(Decimal.from(0))
  const [thusdInBammm, setThusdInBamm] = useState(Decimal.from(0))
  const [thusdSupply, setThusdSupply] = useState(Decimal.from(0))
  const [pcvBal, setPcvBal] = useState(Decimal.from(0))
  const [isMounted, setIsMounted] = useState<boolean>(true);

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    let borrowingFee = Decimal.from(0)
    let thusdSupply = Decimal.from(0)
    let thusdInBamm = Decimal.from(0)

    thresholdSelectorStores.forEach(collateralStore => {
      const thresholdStore = thresholdSelectorStores.find((store) => {
        return store.version === collateralStore.version && store.collateral === collateralStore.collateral;
      });

      borrowingFee = borrowingFee.add(thresholdStore?.store.borrowingRate!)
      setTotalVaults(prev => prev + thresholdStore?.store.numberOfTroves!)
      // setThusdInSP(prev => prev.add(thresholdStore?.store.thusdInStabilityPool!))
      setPcvBal(prev => prev.add(thresholdStore?.store.pcvBalance!))
      thusdSupply = thusdSupply.add(thresholdStore?.store.total.debt!)
    })

    const borrowingfeeAvg = borrowingFee.div(thresholdSelectorStores.length)
    setBorrowingFeeAvgPct(new Percent(borrowingfeeAvg))
    setThusdSupply(thusdSupply)
    setThusdInBamm(thusdInBamm)

    return () => {
      setIsMounted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted])

  return (
    <Card {...{ variant }} sx={{ width: "100%", bg: "systemStatsBackGround"}}>
      <Card variant="layout.columns">
        <Flex sx={{
          width: "100%",
          gap: 1,
          pb: 3,
          borderBottom: 1,
          borderColor: "border"
        }}>
          Network Stats
        </Flex>
        <Flex sx={{
          width: "100%",
          fontSize: "0.9em",
          flexDirection: "column",
          color: "text",
          pt: "2em",
          gap: "1em"
        }}>
          <SystemStat
            info={`Borrowing Fee ${ thresholdSelectorStores.length > 1 && "Avg." }`}
            tooltip="The Borrowing Fee is a one-off fee charged as a percentage of the borrowed amount, and is part of a Vault's debt."
          >
            {borrowingFeeAvgPct && borrowingFeeAvgPct.toString(2)}
          </SystemStat>    
          <SystemStat
            info="Total Vaults"
            tooltip="The total number of active Vaults in the system."
          >
            {Decimal.from(totalVaults).prettify(0)}
          </SystemStat>
          {thresholdSelectorStores.map((collateralStore, index) => (
            <SystemStat
              key={index}
              info={`${ collateralStore.store.symbol } deposited collateral`}
              tooltip={`The Total Value Locked (TVL) is the total value of ${ collateralStore.store.symbol } locked as collateral in the system.`}
            >
              { collateralStore.store.total.collateral.shorten() } { collateralStore.store.symbol }
            </SystemStat>
          ))}
          {/* <SystemStat
            info={`${ COIN } in Stability Pool`}
            tooltip={`The total ${ COIN } currently held in the Stability Pool, expressed as an amount and a fraction of the ${ COIN } supply.`}
          >
            {thusdInSP.shorten()}
          </SystemStat> */}           
          <SystemStat
            info={`${ COIN } Supply`}
            tooltip={`The total ${ COIN } minted by the LED Protocol.`}
          >
            {thusdSupply.shorten()}
          </SystemStat>
          {thresholdSelectorStores.map((collateralStore, index) => {
            return collateralStore.store.total.collateralRatioIsBelowCritical(collateralStore.store.price) 
            && (
                <SystemStat
                  key={index}
                  info={`${ collateralStore.store.symbol } Recovery Mode`}
                  tooltip="Recovery Mode is activated when the Total Collateral Ratio (TCR) falls below 150%. When active, your Vault can be liquidated if its collateral ratio is below the TCR. The maximum collateral you can lose from liquidation is capped at 110% of your Vault's debt. Operations are also restricted that would negatively impact the TCR."
                >
                  <Box color="danger">Yes</Box>
                </SystemStat>
              )
          })}
        </Flex>
        <Box sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          rowGap: 3,
          columnGap: 2,
          width: "100%",
          fontSize: "0.9em",
          pt: 4,
          pb: 3
        }}>
          {IsPriceEditable === true &&
            thresholdSelectorStores.map((collateralStore, index) => {
              return <EditPrice key={index} version={collateralStore.version} collateral={collateralStore.collateral} />
            })
          }
        </Box>
      </Card>
    </Card>
  );
};
