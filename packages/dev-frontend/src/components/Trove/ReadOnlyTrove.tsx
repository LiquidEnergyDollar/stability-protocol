import React, { useCallback } from "react";
import { Card, Box, Flex, Button, Link } from "theme-ui";
import { useLiquitySelector as useThresholdSelector} from "@liquity/lib-react";
import { LiquityStoreState as ThresholdStoreState} from "@liquity/lib-base";
import { DisabledEditableRow } from "./Editor";
import { useTroveView } from "./context/TroveViewContext";
import { Icon } from "../Icon";
import { InfoIcon } from "../InfoIcon";
import { COIN, FIRST_ERC20_COLLATERAL } from "../../strings";
import { CollateralRatio } from "./CollateralRatio";

const select = ({ trove, price }: ThresholdStoreState) => ({ trove, price });

export const ReadOnlyTrove: React.FC = () => {
  const { dispatchEvent } = useTroveView();
  const handleAdjustTrove = useCallback(() => {
    // TODO needs to set dynamic versioning
    dispatchEvent("ADJUST_TROVE_PRESSED", "v1");
  }, [dispatchEvent]);
  const handleCloseTrove = useCallback(() => {
    // TODO needs to set dynamic versioning
    dispatchEvent("CLOSE_TROVE_PRESSED", "v1");
  }, [dispatchEvent]);
  // TODO needs to set dynamic versioning
  const { v1: { trove, price } } = useThresholdSelector(select);

  // console.log("READONLY TROVE", trove.collateral.prettify(4));
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
          Opened Vault
          <InfoIcon size="sm" tooltip={<Card variant="tooltip">To mint and borrow { COIN } you must open a vault and deposit a certain amount of collateral ({ FIRST_ERC20_COLLATERAL }) to it.</Card>} />
        </Flex>
        <Flex sx={{
          width: "100%",
          flexDirection: "column",
          px: ["1em", 0, "1.7em"],
          mt: 2
        }}>
          <Box>
            <DisabledEditableRow
              label="Collateral"
              inputId="trove-collateral"
              amount={trove.collateral.prettify(4)}
              unit={ FIRST_ERC20_COLLATERAL }
            />

            <DisabledEditableRow
              label="Debt"
              inputId="trove-debt"
              amount={trove.debt.prettify()}
              unit={ COIN }
            />

            <CollateralRatio value={trove.collateralRatio(price)} sx={{ mt: -3 }} />
          </Box>

          <Flex variant="layout.actions" sx={{ flexDirection: "column" }}>
            <Button onClick={handleAdjustTrove}>
              <Icon name="pen" size="sm" />
              &nbsp;Adjust
            </Button>
            <Button variant="outline" onClick={handleCloseTrove} sx={{ borderRadius: "12px", mt: 3 }}>
              Close Trove
            </Button>
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
