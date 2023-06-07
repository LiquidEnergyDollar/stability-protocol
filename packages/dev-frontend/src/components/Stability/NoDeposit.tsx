import { useCallback } from "react";
import { Card, Box, Flex, Button, Text, Link, useColorMode } from "theme-ui";
import { useStabilityView } from "./context/StabilityViewContext";
import { useTransactionFunction } from "../Transaction";
import { useThreshold } from "./../../hooks/ThresholdContext";
import { COIN } from "../../utils/constants";
import { InfoIcon } from "../InfoIcon";
import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";
import { GenericIcon } from "../GenericIcon";
import { ActionDescription } from "../ActionDescription";

const select = ({ symbol, thusdBalance, isStabilityPools }: ThresholdStoreState) => ({
  symbol,
  thusdBalance,
  isStabilityPools
});

type UnlockButtonProps = {
  version: string;
  collateral: string;
  isMintList: boolean;
  children?: string;
}

export const UnlockButton = (props: UnlockButtonProps): JSX.Element => {
  const { version, collateral, children } = props;
  const { threshold } = useThreshold();

  const collateralThreshold = threshold.find((versionedThreshold) => {
    return versionedThreshold.version === version && versionedThreshold.collateral === collateral;
  })!;

  const send = collateralThreshold.store.send;

  const [sendTransaction] = useTransactionFunction(
    "bamm-unlock",
    send.bammUnlock.bind(send),
    version,
    collateral
  );

  return (
    <Text 
      onClick={sendTransaction} 
      sx={{ 
        fontWeight: "bold", 
        whiteSpace: "nowrap", 
        cursor: "pointer", 
        textDecoration: "underline" }}>
          {children}
    </Text>
  )
}

type NoDepositProps = {
  version: string;
  collateral: string;
  isMintList: boolean;
  children?: React.ReactNode;
}

export const NoDeposit = (props: NoDepositProps): JSX.Element => {
  const { version, collateral, isMintList } = props;
  const [colorMode] = useColorMode();
  const { dispatchEvent } = useStabilityView();

  const handleOpenVault = useCallback(() => {
    dispatchEvent("DEPOSIT_PRESSED", version, collateral);
  }, [dispatchEvent, version, collateral]);

  const thresholdSelectorStores = useThresholdSelector(select);
  const thresholdStore = thresholdSelectorStores.find((store) => {
    return store.version === version && store.collateral === collateral;
  });
  const store = thresholdStore?.store!;
  const collateralSymbol = store.symbol;
  const thusdBalance = store.thusdBalance;
  const isStabilityPools = store.isStabilityPools;

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
            Stability Pool
            <InfoIcon size="sm" tooltip={<Card variant="tooltip">
            You can earn {COIN} rewards by depositing {COIN} .
              </Card>} />
          </Flex>
            {collateralSymbol} Collateral
        </Flex>
        <Flex sx={{
          width: "100%",
          flexDirection: "column",
          px: ["1em", 0, "1.6em"],
          pb: "1em",
          gap: "1em"
        }}>
            <ActionDescription title={`You haven't deposited any ${ COIN } yet`}>
              {isMintList === true && (
                `You can deposit ${ COIN } to stability pool.`
              )}
            </ActionDescription>
            { COIN } available
          <Flex variant="layout.balanceRow" sx={{ color: "inputText"}}>
            <GenericIcon imgSrc="./icons/led-icon.png" height={"18px"} />
            <Box sx={{ fontSize: 3 }}>
              {(!thusdBalance.eq(0) ? thusdBalance.prettify() : '--')}
            </Box>
            <Box sx={{ fontSize: 14, pt: 1 }}>
              { COIN }
            </Box>
          </Flex>
          <Flex variant="layout.actions">
            <Button disabled={!isStabilityPools} onClick={handleOpenVault} sx={{ mt: 2, width: "100%" }}>Deposit</Button>
          </Flex>
          <Flex sx={{ 
            alignSelf: "center",
            fontSize: 11,
            fontWeight: "body",
            justifyContent: "space-between",
            width: "100%",
            px: "1em",
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
