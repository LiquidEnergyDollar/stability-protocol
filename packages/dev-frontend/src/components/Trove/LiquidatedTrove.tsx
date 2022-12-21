import React, { useCallback } from "react";
import { Card, Button, Flex, Link } from "theme-ui";
import { CollateralSurplusAction } from "../CollateralSurplusAction";
import { LiquityStoreState as ThresholdStoreState} from "@liquity/lib-base";
import { useThresholdSelector} from "@liquity/lib-react";
import { useTroveView } from "./context/TroveViewContext";
import { COIN } from "../../strings";
import { InfoMessage } from "../InfoMessage";

const select = ({ collateralSurplusBalance }: ThresholdStoreState) => ({
  hasSurplusCollateral: !collateralSurplusBalance.isZero
});

type LiquidatedTroveProps = {
  version: string
}

export const LiquidatedTrove = ({ version }: LiquidatedTroveProps): JSX.Element => {
  const { [version]: { hasSurplusCollateral } } = useThresholdSelector(select);
  const { dispatchEvent } = useTroveView();

  const handleOpenTrove = useCallback(() => {
    dispatchEvent("OPEN_TROVE_PRESSED", version);
  }, [dispatchEvent, version]);

  return (
    <Card variant="mainCards">
      <Card variant="layout.columns">
        <Flex sx={{
          width: "100%",
          gap: 1,
          pb: "1em",
          borderBottom: 1, 
          borderColor: "border",
        }}>
          Liquidated Vault
        </Flex>
        <Flex sx={{
          width: "100%",
          flexDirection: "column",
          px: ["1em", 0, "1.7em"],
          mt: 4
        }}>
          <InfoMessage title="Your Trove has been liquidated.">
            {hasSurplusCollateral
              ? "Please reclaim your remaining collateral before opening a new Trove."
              : `You can borrow ${ COIN } by opening a Trove.`}
          </InfoMessage>

          <Flex variant="layout.actions">
            {hasSurplusCollateral && <CollateralSurplusAction version={version} />}
            {!hasSurplusCollateral && <Button onClick={handleOpenTrove} sx={{ width: "100%" }}>Open Trove</Button>}
          </Flex>
          <Flex sx={{ 
            justifyContent: "center",
            fontSize: 11,
            fontWeight: "body",
            mt: "1.5em"
          }}>
            <Link variant="cardLinks" href="https://github.com/Threshold-USD/dev#readme" target="_blank">Read about</Link>
            in the documentation
          </Flex>
        </Flex>
      </Card>
    </Card>
  );
};
