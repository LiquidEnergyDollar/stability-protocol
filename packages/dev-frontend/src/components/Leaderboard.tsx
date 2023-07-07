import { useState, useEffect } from "react";
import { Box, Button, Card, Container, Flex, Image, Link, Text } from "theme-ui";

import { Decimal } from "@liquity/lib-base";
import { BlockPolledLiquityStoreState as BlockPolledThresholdStoreState } from "@liquity/lib-ethers";
import { useThresholdSelector } from "@liquity/lib-react";

import { shortenAddress } from "../utils/shortenAddress";
import { useThreshold } from "../hooks/ThresholdContext";
import { COIN } from "../utils/constants";

import { Icon } from "./Icon";
import { Tooltip } from "./Tooltip";
import { Abbreviation } from "./Abbreviation";

const rowHeight = "40px";
const pageSize = 10;

// Prevent these addresses from showing up in leaderboard
// NOTE: These need to be lowercased
const blacklistedAddresses = new Set([
  "0x0000ce08fa224696a819877070bf378e8b131acf", // remove once he burns the extra 100k
  "0x62509301068f77fed07c2d17609a8730385d24ed", // this is Isaac lol
  "0x24EcD23096fCF03A15ee8a6FE63F24345Cc4BA46" // this is Cody (not as rich)
]);

type LeaderboardProps = {
  version: string
  collateral: string
};

type LeaderboardReturnItem = {
  timestamp: string
  network: string
  address: string
  userid: string
  usdassets: string
  ledassets: string
  leddebt: string
  ledprice: string
  netvalue: string
  avatarurl: string
  username: string
}

type LeaderboardRow = {
  address: string
  avatarurl: string
  username: string
  usdassets: Decimal
  ledassets: Decimal
  leddebt: Decimal
  netvalue: Decimal
}

async function requestLeaderboard<TResponse>(
  url: string,
  config: RequestInit = {}
): Promise<TResponse> {
  return fetch(url, config)
    .then((response) => response.json())
    .then((data) => data as TResponse)
}

const select = ({
  symbol
}: BlockPolledThresholdStoreState) => ({
  symbol
});

export const Leaderboard = ({ version, collateral }: LeaderboardProps): JSX.Element => {
  const [data, setData] = useState<LeaderboardRow[]>([]);
  const [pageData, setPageData] = useState<LeaderboardRow[]>([]);
  const [page, setPage] = useState(0);
  const [isMounted, setIsMounted] = useState<boolean>(true);
  const numberOfPages = () => Math.ceil(data.length / pageSize) || 1;
  const clampedPage = () => Math.min(page, numberOfPages() - 1);

  const thresholdSelectorStores = useThresholdSelector(select)
  const thresholdStore = thresholdSelectorStores.find((store) => {
    return store.version === version && store.collateral === collateral;
  });
  const store = thresholdStore?.store!;
  const symbol = store.symbol;

  const { config } = useThreshold();
  const { historicalApiUrl } = config;

  const parseNumberString = (numstr: string): Decimal => {
    return Decimal.from(numstr).div(Decimal.from(10).pow(18));
  }

  const parseRow = (row: LeaderboardReturnItem): LeaderboardRow => {
    return {
      address: row.address,
      avatarurl: row.avatarurl,
      username: row.username,
      usdassets: parseNumberString(row.usdassets),
      ledassets: parseNumberString(row.ledassets),
      leddebt: parseNumberString(row.leddebt),
      netvalue: parseNumberString(row.netvalue)
    }
  }

  const getData = () => {
    // Check if the required config properties are present
    if (!historicalApiUrl) {
      console.error(`You must add a config.json file into the public source folder.`);
      return;
    }

    const parsedUrl = historicalApiUrl + `/leaderboard`
    requestLeaderboard<LeaderboardReturnItem[]>(parsedUrl)
      .then((result) => {
        const parsedRows = result
          .map((x) => parseRow(x))
          .filter((x) => !blacklistedAddresses.has(x.address.toLowerCase()))
          .sort((a, b) => a.netvalue.gt(b.netvalue) ? -1 : 1);
        setData(parsedRows);
      })
      .catch((error) => {
        console.error('failed to fetch data: ', error);
      });
  };

  // Use the useEffect hook to fetch historical data only once when the component mounts
  useEffect(() => {
    if (!isMounted) {
      return;
    }
    getData();

    // Clean up function to set isMounted to false when the component unmounts
    return () => {
      setIsMounted(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  useEffect(() => {
    const drop = clampedPage() * pageSize;
    const end = Math.min((clampedPage() + 1) * pageSize, data.length);
    setPageData(data.slice(drop, end))
  }, [page, data])

  const nextPage = () => {
    if (clampedPage() < numberOfPages() - 1) {
      setPage(clampedPage() + 1);
    }
  };

  const previousPage = () => {
    if (clampedPage() > 0) {
      setPage(clampedPage() - 1);
    }
  };

  useEffect(() => {
    if (page !== clampedPage()) {
      setPage(clampedPage);
    }
  }, [page]);

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
              Tournament Leaderboard
            </Box>
            <Flex sx={{ alignItems: "center", gap: "0.5rem" }}>
              {data.length !== 0 && (
                <>
                  <Abbreviation
                    short={`page ${clampedPage() + 1} / ${numberOfPages()}`}
                    sx={{ mr: 2, fontWeight: "body", fontSize: 1, letterSpacing: 0 }}
                  >
                    {clampedPage() * pageSize + 1}-{Math.min((clampedPage() + 1) * pageSize, data.length)}{" "}
                    of {data.length}
                  </Abbreviation>
                  <Button variant="titleIcon" onClick={previousPage} disabled={clampedPage() <= 0}>
                    <Icon name="chevron-left" size="sm" />
                  </Button>
                  <Button
                    variant="titleIcon"
                    onClick={nextPage}
                    disabled={clampedPage() >= numberOfPages() - 1}
                  >
                    <Icon name="chevron-right" size="sm" />
                  </Button>
                </>
              )}
            </Flex>
          </Flex>
          {!data || data.length === 0 ? (
            <Box sx={{ p: [2, 3], width: "100%" }}>
              <Box sx={{ p: 4, fontSize: 3, textAlign: "center", justifyContent: "center" }}>
                Loading...
              </Box>
            </Box>
          ) : (
              <Box sx={{ width: "100%", p: [2, 3] }}>
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
                    <col />
                    <col style={{ width: "30%" }} />
                    <col />
                    <col />
                    <col />
                    <col />
                  </colgroup>
                  <thead>
                    <tr style={{ opacity: 0.6 }}>
                      <th>
                        Discord
                      <br />
                        Info
                      </th>
                      <th style={{ verticalAlign: "top" }}>Address</th>
                      <th>
                        <Abbreviation short="Coll.">Collateral</Abbreviation>
                        <Box sx={{ fontSize: [0, 1], fontWeight: "body" }}>{symbol}</Box>
                      </th>
                      <th>
                        Owned
                      <Box sx={{ fontSize: [0, 1], fontWeight: "body" }}>{COIN}</Box>
                      </th>
                      <th>
                        Debt
                      <Box sx={{ fontSize: [0, 1], fontWeight: "body" }}>{COIN}</Box>
                      </th>
                      <th>
                        Total
                      <br />
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map(
                      lbItem =>
                        <tr key={lbItem.address}
                          style={{
                            fontWeight: "bold"
                          }}>
                          <td>
                            <Tooltip message={lbItem.username} placement="top">
                              <Image
                                variant="avatar"
                                src={lbItem.avatarurl}
                                sx={{
                                  width: ["73px", "unset"],
                                  overflow: "hidden",
                                  position: "relative"
                                }}
                              />
                            </Tooltip>
                          </td>
                          <td
                            style={{
                              display: "flex",
                              alignItems: "center",
                              height: rowHeight,
                            }}
                          >
                            <Tooltip message={lbItem.address} placement="top">
                              <Text
                                variant="address"
                                sx={{
                                  width: ["73px", "unset"],
                                  overflow: "hidden",
                                  position: "relative"
                                }}
                              >
                                {shortenAddress(lbItem.address)}
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
                              href={`https://sepolia.etherscan.io/address/${lbItem.address}`}
                              target="_blank"
                            >
                              <Image src="./icons/external-link.svg" />
                            </Link>
                          </td>
                          <td>
                            <Abbreviation short={lbItem.usdassets.shorten()}>
                              {lbItem.usdassets.prettify(2)}
                            </Abbreviation>
                          </td>
                          <td>
                            <Abbreviation short={lbItem.ledassets.shorten()}>
                              {lbItem.ledassets.prettify(2)}
                            </Abbreviation>
                          </td>
                          <td>
                            <Abbreviation short={lbItem.leddebt.shorten()}>
                              {lbItem.leddebt.prettify(2)}
                            </Abbreviation>
                          </td>
                          <td>
                            <Abbreviation short={lbItem.netvalue.shorten()}>
                              {lbItem.netvalue.prettify(2)}
                            </Abbreviation>
                          </td>
                        </tr>
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
              <Link variant="cardLinks" href="https://codyborn.notion.site/LED-Trading-Tournament-Guide-6fb50c860dfb41ada89e9e67528140cc" target="_blank">Read about</Link>
              in the documentation
            </Flex>
            <Flex>Deployment version: {version}</Flex>
          </Flex>
        </Card>
      </Card>
    </Container>
  );
};
