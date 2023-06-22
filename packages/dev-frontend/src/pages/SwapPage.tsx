import { Container, Embed, useColorMode } from "theme-ui";
import { PageHeading } from "../components/PageHeading";
import { PageRow } from "../components/PageRow";
import { Stability } from "../components/Stability/Stability";
import { COIN } from "../utils/constants";
import { useThresholdSelector } from "@liquity/lib-react";
import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";

export const SwapPage = (): JSX.Element => {

  const selector = ({
    symbol,
  }: ThresholdStoreState) => ({
    symbol,
  });

  const thresholdSelectorStores = useThresholdSelector(selector);
  const thresholdStore = thresholdSelectorStores[0];
  const store = thresholdStore?.store!;
  const symbol = store.symbol;
  const [colorMode] = useColorMode();
  
  return (
    <Container
    sx={{
      minHeight: "32em"
    }} variant="singlePage">
      <PageHeading
        heading="Swap"
        description={`Exchange between ${ COIN } and ${ symbol } using Uniswap. Connect your wallet to get started.`}
        link="https://github.com/Threshold-USD/dev"
        isPoweredByBProtocol={true}
      />
      <Embed 
        sx={{
          height: "32em",
          width: "95%",
          mt: "2em"
        }}
        src={`https://app.uniswap.org/#/swap?inputCurrency=0x059969e68883900f651874C9648878dBa33f378C&outputCurrency=0x1091221BbF69ae494ae7d5fE7c794A361e89850c&theme=${colorMode == "default" ? "light" : "dark"}`}
      />
    </Container>
  );
};
