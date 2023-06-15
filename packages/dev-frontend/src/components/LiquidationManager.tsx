import { useState } from "react";
import { Card, Flex, Button, Link, Input, ThemeUICSSProperties } from "theme-ui";
import { StaticAmounts, Row, AutoSelectInput } from "./Vault/Editor";
import { useThreshold } from "../hooks/ThresholdContext";
import { Transaction } from "./Transaction";
import { InfoIcon } from "./InfoIcon";
import { LiquityStoreState as ThresholdStoreState} from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";

const editableStyle: ThemeUICSSProperties = {
  backgroundColor: "terciary",
  color: "inputText",
  px: "1.1em",
  py: "0.45em",
  border: 1,
  borderColor: "border",
  borderRadius: 12,
  width: "100%",
  flexGrow: 1,
  mb: [2, 3],
  pl: 3,
  fontSize: 3,
};

type LiquidationManagerProps = {
  version: string
  collateral: string
  isMintList: boolean
}

const selector = ({ symbol, isTroveManager }: ThresholdStoreState) => ({
  symbol,
  isTroveManager
});

export const LiquidationManager = ({ version, collateral, isMintList }: LiquidationManagerProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(selector);
  const thresholdStore = thresholdSelectorStores.find((store) => {
    return store.version === version && store.collateral === collateral;
  });
  const store = thresholdStore?.store!;
  const { symbol, isTroveManager } = store;
  
  const { threshold } = useThreshold()
  const collateralThreshold = threshold.find((versionedThreshold) => {
    return versionedThreshold.version === version && versionedThreshold.collateral === collateral;
  })!;
  
  const send = collateralThreshold.store.send

  const inputId: string = "liquidate-vaults";
  const [numberOfVaultsToLiquidate, setNumberOfVaultsToLiquidate] = useState("90");
  const editingState = useState<string>();
  const [editing, setEditing] = editingState;

  return (
    <Card variant="mainCards">
      <Card variant="layout.columns">
        <Flex sx={{
          justifyContent: "space-between",
          width: "100%",
          gap: 1,
          pb: "1em",
          px: ["2em", 0],
          borderBottom: 1, 
          borderColor: "border"
        }}>
          <Flex sx={{ gap: 1 }}>
            Liquidate
            <InfoIcon size="sm" tooltip={<Card variant="tooltip">Vaults that fall under the minimum collateral ratio of 110% will be closed (liquidated). The debt of the Vault is canceled and absorbed by the Stability Pool and its collateral distributed among Stability Providers.</Card>} />
          </Flex>
          {symbol} Collateral
        </Flex>
        <Flex sx={{
          width: "100%",
          flexDirection: "column",
          flexWrap: "wrap",
          px: ["1em", 0, "1.6em"],
          gap: "0.5em"
        }}>
          {editing === inputId ? (
            <>
              <Row labelId={`${inputId}-label`} {...{ label: "Up to", unit: "Vaults" }} />
              <AutoSelectInput
                inputId={inputId}
                min="1"
                step="1"
                editedAmount={numberOfVaultsToLiquidate}
                setEditedAmount={setNumberOfVaultsToLiquidate}
                editingState={editingState}
              />
            </>) 
          : (
            <>
              <Row labelId={`${inputId}-label`} {...{ label: "Up to", unit: "Vaults" }} />
              <StaticAmounts
                sx={{
                  ...editableStyle,
                }}
                labelledBy={`${inputId}-label`}
                onClick={() => setEditing(inputId)}
                {...{ inputId, amount: numberOfVaultsToLiquidate, unit: "Vaults" }}
              />
            </>
          )}
          <Flex sx={{ ml: 2, alignItems: "center" }}>
            <Transaction
              id="batch-liquidate"
              send={overrides => {
                if (!numberOfVaultsToLiquidate) {
                  throw new Error("Invalid number");
                }
                return send.liquidateUpTo(parseInt(numberOfVaultsToLiquidate, 10), overrides);
              }}
              version={version}
              collateral={collateral}
            >
              <Button disabled={!isTroveManager} sx={{ width: "100%" }}>Liquidate</Button>
            </Transaction>
          </Flex>
          <Flex sx={{ 
            alignSelf: "center",
            fontSize: 11,
            fontWeight: "body",
            justifyContent: "space-between",
            width: "100%",
            px: "1em",
            mt: 2,
            display: "none !important"
          }}>
            <Flex>
              <Link variant="cardLinks" href="https://docs.threshold.network/fundamentals/threshold-usd" target="_blank">Read about</Link>
              in the documentation
            </Flex>
            <Flex>Deployment version: {version}</Flex>
          </Flex>
        </Flex>
      </Card>
    </Card>
  );
};
