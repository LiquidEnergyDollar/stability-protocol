import React from "react";
import { Box, Button, Card, Flex, Link, Text, useColorMode } from "theme-ui";
import { NavLink } from "react-router-dom";

import { COIN } from "../../utils/constants";
import { GenericIcon } from "../GenericIcon";
import { InfoIcon } from "../InfoIcon";

type BottomCardProps = {
  title: string ;
  tooltip: string;
  action: string;
  token: string;
  tokenIcon: string;
  path: string;
  isPoweredByBProtocol?: boolean;
  disabled?: boolean;
  children: React.ReactNode
};

export const BottomCard = ({
  title,
  action, 
  token,
  tokenIcon,
  path, 
  isPoweredByBProtocol,
  disabled,
  children
}: BottomCardProps): JSX.Element => {
  const [colorMode] = useColorMode();
    return (
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
            {title}
            <InfoIcon size="sm" tooltip={
              <Card variant="tooltip">
                You can earn {COIN} rewards by depositing {COIN} .
              </Card>} />
          </Flex>
        </Flex>
        <Flex sx={{
          width: "100%",
          flexDirection: "column",
          pt: "3.4em",
          px: ["1em", 0, 0, "1.6em"],
          gap: "1em"
        }}>
          {token} available 
          <Flex variant="layout.balanceRow" sx={{ color: "inputText"}}>
            <GenericIcon imgSrc={tokenIcon} height={"18px"} />
            <Box sx={{ fontSize: 3 }}>
              {children}
            </Box>
            <Box sx={{ fontSize: 14, pt: 1 }}>
              {token}
            </Box>
          </Flex>
          <NavLink to={path} style={{ textDecoration: 'none' }}>
            <Button sx={{ mt: 2, width: "100%" }} disabled={disabled}>
              {action}
            </Button>
          </NavLink>
          <Flex sx={{ 
            alignSelf: "center",
            fontSize: 11,
            fontWeight: "body",
            pb: "2.4em",
            visibility: "hidden"
          }}>
            <Link variant="cardLinks" href="https://docs.threshold.network/fundamentals/threshold-usd" target="_blank">Read about</Link>
            in the documentation
          </Flex>
        </Flex>
      </Card>
  );
};
