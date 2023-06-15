import { Card, Flex } from "theme-ui";

import { LiquityStoreState as ThresholdStoreState, UserTrove } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";
import { VaultView } from "../Vault/context/types";
import { useVaultView } from "../Vault/context/VaultViewContext";

import { BottomCard } from "./BottomCard";
import { SystemStat } from "../SystemStat";
import { COIN } from "../../utils/constants";

type VaultCardProps = {
  variant?: string;
};

const selector = ({ erc20TokenBalance, symbol, trove }: ThresholdStoreState) => ({
  erc20TokenBalance, symbol, trove
});

const vaultStatus = (view: VaultView) => {
  if (view === 'ACTIVE') return 'Adjust Vault'
  else return 'Open a Vault'
}

export const VaultCard = ({ variant = "mainCards" }: VaultCardProps): JSX.Element => {
  const { views } = useVaultView();
  const currentView = views[0]
  const thresholdSelectorStores = useThresholdSelector(selector);
  const thresholdStore = thresholdSelectorStores[0]
  const store = thresholdStore?.store!;
  const erc20TokenBalance = store.erc20TokenBalance;
  const symbol = store.symbol;
  const trove: UserTrove = store.trove;
  
  const troveStats = (
  <Flex sx={{ fontSize: "0.9em", flexDirection: "column", gridColumn: "span 2", gap: 2 }}>
      <SystemStat
        info={`Collateral`}
        tooltip={`The amount of ${ symbol } currently in your vault.`}
      >
        { trove.collateral.toString(2) } { symbol }
      </SystemStat>
      <SystemStat
        info={`Debt`}
        tooltip={`The amount of ${ COIN } debt of your vault.`}
      >
        { trove.debt.toString(2) } { COIN }
      </SystemStat>
      <SystemStat
        info={`Status`}
        tooltip={`Represents whether the vault is open or not, or why it was closed.`}
      >
        { trove.status.toUpperCase() }
      </SystemStat>
  </Flex>)

  return (
    <Card {...{ variant }}>
      <BottomCard
        title={vaultStatus(currentView.initialView)}
        stats={troveStats}
        tooltip={`To mint and borrow thUSD you must open a vault and deposit a certain amount of collateral (${ symbol }) to it.`}
        action={vaultStatus(currentView.initialView)}
        token={ symbol }
        tokenIcon="./icons/usd.png"
        path='/borrow'
      >
        {erc20TokenBalance.eq(0) ? '--' : erc20TokenBalance.prettify()}
      </BottomCard>
    </Card>
  );
};
