import { Decimal, LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";
import { useState } from "react";
import { Button, Flex, Input, ThemeUICSSProperties } from "theme-ui";
import { useThreshold } from "../../hooks/ThresholdContext";
import { SystemStat } from "../SystemStat";
import { Transaction } from "../Transaction";
import { COIN } from "../../utils/constants";

const editableStyle: ThemeUICSSProperties = {
  bg: "white",
  py: "0.1em",
  border: 1,
  borderColor: "border",
  borderRadius: 8,
  flexGrow: 1,
  pl: "0.3rem",
  boxShadow: 0
};

type EditPriceProps = {
  version: string
  collateral: string
}

const selector = ({
  price,
  symbol,
}: ThresholdStoreState) => ({
  price,
  symbol,
});

export const EditPrice = ({ version, collateral }: EditPriceProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(selector);
  const thresholdStore = thresholdSelectorStores.find((store) => {
    return store.version === version && store.collateral === collateral;
  });
  const store = thresholdStore?.store!;
  const symbol = store.symbol;
  const price = store.price;
  const inversePrice = Decimal.ONE.div(price);
  
  const { threshold } = useThreshold()
  const collateralThreshold = threshold.find((versionedThreshold) => {
    return versionedThreshold.version === version && versionedThreshold.collateral === collateral;
  })!;
  
  const canSetPrice = collateralThreshold.store.connection._priceFeedIsTestnet
  const [editedPrice, setEditedPrice] = useState(inversePrice.toString(2))

  return (
    <Flex sx={{ flexDirection: "column", gridColumn: "span 2", gap: 2 }}>
      <Flex sx={{
        width: "100%",
        gap: 1,
        pb: 2,
        borderBottom: 1,
        borderColor: "border"
      }}>
        { symbol }/{ COIN } - {version}
      </Flex>
        {canSetPrice ? (
          <Flex sx={{ mb:1, textAlign:"left", height: "1.2em", }}>
            {editedPrice}
          </Flex>
        ) : (
          price.toString(2)
        )}
    </Flex>
  );
};
