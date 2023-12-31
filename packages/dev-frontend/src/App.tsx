import React from "react";
import { Web3ReactProvider } from "@web3-react/core";
import { Flex, Spinner, Heading, ThemeProvider} from "theme-ui";

import { BatchedWebSocketAugmentedWeb3Provider } from "@liquity/providers";

import { getConfig } from "./config";
import theme from "./theme";

import { DisposableWalletProvider } from "./testUtils/DisposableWalletProvider";
import { ThresholdFrontend } from "./ThresholdFrontend";

if (window.ethereum) {
  // Silence MetaMask warning in console
  Object.assign(window.ethereum, { autoRefreshOnNetworkChange: false });
}

try {
  if (process.env.REACT_APP_DEMO_MODE === "true") {
    const ethereum = new DisposableWalletProvider(
      `http://${window.location.hostname}:8545`,
      "0x4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7"
    );

    Object.assign(window, { ethereum });
  }
} catch (e) {}

// Start pre-fetching the config
getConfig().then(config => {
  // console.log("Frontend config:");
  // console.log(config);
  Object.assign(window, { config });
});

type EthersWeb3ReactProviderProps = {
  children: React.ReactNode;
}

const EthersWeb3ReactProvider= ({ children }: EthersWeb3ReactProviderProps): JSX.Element => {
  return (
    <Web3ReactProvider getLibrary={provider => new BatchedWebSocketAugmentedWeb3Provider(provider)}>
      {children}
    </Web3ReactProvider>
  );
};

const App = () => {
  const loader = (
    <Flex sx={{ alignItems: "center", justifyContent: "center", height: "75vh",  }}>
      <Spinner sx={{ m: 2, color: "text" }} size="32px" />
      <Heading>Loading...</Heading>
    </Flex>
  );
  return (
    <EthersWeb3ReactProvider>
      <ThemeProvider theme={theme}>
        <ThresholdFrontend loader={loader} />
      </ThemeProvider>
    </EthersWeb3ReactProvider>
  );
};

export default App;
