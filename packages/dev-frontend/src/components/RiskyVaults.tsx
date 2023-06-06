import { useState, useEffect, useCallback } from "react";
import { Box, Button, Card, Container, Flex, Image, Link, Text  } from "theme-ui";

import {
  Percent,
  MINIMUM_COLLATERAL_RATIO,
  CRITICAL_COLLATERAL_RATIO,
  UserTrove as UserVault,
  Decimal
} from "@liquity/lib-base";
import { BlockPolledLiquityStoreState as BlockPolledThresholdStoreState } from "@liquity/lib-ethers";
import { useThresholdSelector } from "@liquity/lib-react";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

import { shortenAddress } from "../utils/shortenAddress";
import { useThreshold } from "../hooks/ThresholdContext";
import { COIN } from "../utils/constants";

import { Icon } from "./Icon";
import { Transaction } from "./Transaction";
import { Tooltip } from "./Tooltip";
import { Abbreviation } from "./Abbreviation";

const rowHeight = "40px";
const pageSize = 10;

const liquidatableInNormalMode = (vault: UserVault, price: Decimal) =>
  [vault.collateralRatioIsBelowMinimum(price), "Collateral ratio not low enough"] as const;

const liquidatableInRecoveryMode = (
  vault: UserVault,
  price: Decimal,
  totalCollateralRatio: Decimal,
  thusdInStabilityPool: Decimal
) => {
  const collateralRatio = vault.collateralRatio(price);

  if (collateralRatio.gte(MINIMUM_COLLATERAL_RATIO) && collateralRatio.lt(totalCollateralRatio)) {
    return [
      vault.debt.lte(thusdInStabilityPool),
      `There's not enough ${COIN} in the Stability pool to cover the debt`
    ] as const;
  } else {
    return liquidatableInNormalMode(vault, price);
  }
};

type RiskyVaultsProps = {
  version: string
  collateral: string
  isMintList: boolean
};

const select = ({
  numberOfTroves,
  price,
  total,
  thusdInStabilityPool,
  blockTag,
  symbol
}: BlockPolledThresholdStoreState) => ({
  numberOfTroves,
  price,
  recoveryMode: total.collateralRatioIsBelowCritical(price),
  totalCollateralRatio: total.collateralRatio(price),
  thusdInStabilityPool,
  blockTag,
  symbol
});

export const RiskyVaults = ({ version, collateral, isMintList }: RiskyVaultsProps): JSX.Element => {
  const { chainId } = useWeb3React<Web3Provider>();
  const thresholdSelectorStores = useThresholdSelector(select);
  const thresholdStore = thresholdSelectorStores.find((store) => {
    return store.version === version && store.collateral === collateral;
  });
  const store = thresholdStore?.store!;
  const blockTag = store.blockTag;
  const numberOfTroves = store.numberOfTroves;
  const recoveryMode = store.recoveryMode;
  const totalCollateralRatio = store.totalCollateralRatio;
  const thusdInStabilityPool = store.thusdInStabilityPool;
  const price = store.price;
  const symbol = store.symbol;
  
  const { threshold } = useThreshold()
  const collateralThreshold = threshold.find((versionedThreshold) => {
    return versionedThreshold.version === version && versionedThreshold.collateral === collateral;
  })!;
  
  const send = collateralThreshold.store.send

  const [vaults, setVaults] = useState<UserVault[]>();
  const [reload, setReload] = useState({});
  const forceReload = useCallback(() => setReload({}), []);
  const [page, setPage] = useState(0);
  const numberOfPages = Math.ceil(numberOfTroves / pageSize) || 1;
  const clampedPage = Math.min(page, numberOfPages - 1);

  const nextPage = () => {
    if (clampedPage < numberOfPages - 1) {
      setPage(clampedPage + 1);
    }
  };

  const previousPage = () => {
    if (clampedPage > 0) {
      setPage(clampedPage - 1);
    }
  };

  useEffect(() => {
    if (page !== clampedPage) {
      setPage(clampedPage);
    }
  }, [page, clampedPage]);

  useEffect(() => {
      collateralThreshold.store
        .getTroves(
          {
            first: pageSize,
            sortedBy: "ascendingCollateralRatio",
            startingAt: clampedPage * pageSize
          },
          { blockTag }
        )
        .then(vaults => {
            setVaults(vaults);
        });
    // Omit blockTag from deps on purpose
    // eslint-disable-next-line
  }, [threshold, clampedPage, pageSize, reload]);

  useEffect(() => {
    forceReload();
  }, [forceReload, numberOfTroves]);

  const [copied, setCopied] = useState<string>();

  useEffect(() => {
    if (copied !== undefined) {
      setTimeout(() => {
          setCopied(undefined);
      }, 2000);
    }
  }, [copied]);

  return (
    <Container>
      <Card variant="mainCards">
        <Card variant="layout.columns">
          <Flex sx={{
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
            width: "100%",
            pb: "1em",
            borderBottom: 1, 
            borderColor: "border"
          }}>
            <Box>
              Risky Vaults
            </Box>
            <Flex sx={{ alignItems: "center", gap: "0.5rem" }}>
              <Flex>
                {symbol} Collateral
              </Flex>
              {numberOfTroves !== 0 && (
                <>
                  <Abbreviation
                    short={`page ${clampedPage + 1} / ${numberOfPages}`}
                    sx={{ mr: 2, fontWeight: "body", fontSize: 1, letterSpacing: 0 }}
                  >
                    {clampedPage * pageSize + 1}-{Math.min((clampedPage + 1) * pageSize, numberOfTroves)}{" "}
                    of {numberOfTroves}
                  </Abbreviation>
                  <Button variant="titleIcon" onClick={previousPage} disabled={clampedPage <= 0}>
                    <Icon name="chevron-left" size="sm" />
                  </Button>
                  <Button
                    variant="titleIcon"
                    onClick={nextPage}
                    disabled={clampedPage >= numberOfPages - 1}
                  >
                    <Icon name="chevron-right" size="sm" />
                  </Button>
                </>
              )}
            </Flex>
          </Flex>
          {!vaults || vaults.length === 0 ? (
            <Box sx={{ p: [2, 3], width: "100%" }}>
              <Box sx={{ p: 4, fontSize: 3, textAlign: "center", justifyContent: "center" }}>
                {!vaults ? "Loading..." : "There are no Vaults yet"}
              </Box>
            </Box>
          ) : (
            <Box sx={{ width:"100%", p: [2, 3] }}>
              <Box
                as="table"
                sx={{
                  mt: 2,
                  width: "100%",
                  textAlign: "left",
                  lineHeight: 1.15
                }}
              >
                <colgroup>
                  <col style={{ width: "30%" }} />
                  <col />
                  <col />
                  <col />
                  <col style={{ width: rowHeight }} />
                </colgroup>
                <thead>
                  <tr style={{ opacity: 0.6 }}>
                    <th style={{ verticalAlign: "top" }}>Owner</th>
                    <th>
                      <Abbreviation short="Coll.">Collateral</Abbreviation>
                      <Box sx={{ fontSize: [0, 1], fontWeight: "body" }}>{symbol}</Box>
                    </th>
                    <th>
                      Debt
                      <Box sx={{ fontSize: [0, 1], fontWeight: "body" }}>{COIN}</Box>
                    </th>
                    <th>
                      Coll.
                      <br />
                      Ratio
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {vaults.map(
                    vault =>
                      !vault.isEmpty && ( // making sure the Vault hasn't been liquidated
                        // (TODO: remove check after we can fetch multiple Vault in one call)
                        <tr key={vault.ownerAddress} 
                          style={{
                            fontWeight: "bold"
                          }}>
                          <td
                            style={{
                              display: "flex",
                              alignItems: "center",
                              height: rowHeight,
                            }}
                          >
                            <Tooltip message={vault.ownerAddress} placement="top">
                              <Text
                                variant="address"
                                sx={{
                                  width: ["73px", "unset"],
                                  overflow: "hidden",
                                  position: "relative"
                                }}
                              >
                                {shortenAddress(vault.ownerAddress)}
                                <Box
                                  sx={{
                                    display: ["block", "none"],
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    width: "50px",
                                    height: "100%",
                                    background:
                                      "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)"
                                  }}
                                />
                              </Text>
                            </Tooltip>
                            <Link 
                              variant="socialIcons" 
                              href={(chainId === 5 && `https://goerli.etherscan.io/address/${vault.ownerAddress}`) ||
                                `https://etherscan.io/address/${vault.ownerAddress})`} 
                              target="_blank"
                            >
                              <Image src="./icons/external-link.svg" />
                            </Link>
                          </td>
                          <td>
                            <Abbreviation short={vault.collateral.shorten()}>
                              {vault.collateral.prettify(4)}
                            </Abbreviation>
                          </td>
                          <td>
                            <Abbreviation short={vault.debt.shorten()}>
                              {vault.debt.prettify()}
                            </Abbreviation>
                          </td>
                          <td>
                            {(collateralRatio => (
                              <Text
                                color={
                                  collateralRatio.gt(CRITICAL_COLLATERAL_RATIO)
                                    ? "success"
                                    : collateralRatio.gt(1.2)
                                    ? "warning"
                                    : "danger"
                                }
                              >
                                {new Percent(collateralRatio).prettify()}
                              </Text>
                            ))(vault.collateralRatio(price))}
                          </td>
                          <td>
                            <Transaction
                              id={`liquidate-${vault.ownerAddress}`}
                              tooltip="Liquidate"
                              requires={[
                                recoveryMode
                                  ? liquidatableInRecoveryMode(
                                      vault,
                                      price,
                                      totalCollateralRatio,
                                      thusdInStabilityPool
                                    )
                                  : liquidatableInNormalMode(vault, price)
                              ]}
                              send={send.liquidate.bind(send, vault.ownerAddress)}
                              version={version}
                              collateral={collateral}
                            >
                              <Button variant="dangerIcon">
                                <Icon name="trash" />
                              </Button>
                            </Transaction>
                          </td> 
                        </tr>
                      )
                  )}
                </tbody>
              </Box>
            </Box>
          )}
          <Flex sx={{ 
            alignSelf: "center",
            fontSize: 11,
            fontWeight: "body",
            justifyContent: "space-between",
            width: "100%",
            px: "1em",
            mt: 3,
            display: "none !important"
          }}>
            <Flex>
              <Link variant="cardLinks" href="https://docs.threshold.network/fundamentals/threshold-usd" target="_blank">Read about</Link>
              in the documentation
            </Flex>
            <Flex>Deployment version: {version}</Flex>
          </Flex>
        </Card>
      </Card>
    </Container>  
  );
};
