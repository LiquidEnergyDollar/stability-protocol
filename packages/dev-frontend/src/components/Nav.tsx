import { Flex, Box } from "theme-ui";
import { Link } from "./Link";
import { Icon } from "./Icon";

import { ExternalLinks } from "./ExternalLinks";
import { UserAccount } from "./UserAccount";

export const Nav = (): JSX.Element => {
  return (
    <Box sx={{
      bg: "background",
      display: "flex",
      justifyContent: "space-between",
      flexDirection: "column",
      width: "100%"
    }}>
      <Flex sx={{
        display: "flex",
        flexGrow: 1,
        flexDirection: "column",
      }}>
        <Link to="/">
          <Icon name="chart-bar" />
          Dashboard
        </Link>
        <Link to="/charts">
          <Icon name="chart-line" />
          Charts
        </Link>
        <Link to="/borrow" >
          <Flex sx={{ transform: "rotate(155deg)" }}>
            <Icon name="exchange-alt" />
          </Flex>
          Borrow
        </Link>
        <Link to="/swap" >
          <Flex>
            <Icon name="exchange-alt" />
          </Flex>
          Swap
        </Link>
        <Link to="/earn">
          <Icon name="chart-line" />
          Earn
        </Link>
        <Link to="/risky-vaults">
          <Icon name="exclamation-triangle" />
          Risky Vaults
        </Link>
        <Link to="/leaderboard">
          <Icon name="cash-register" />
          Leaderboard
        </Link>
        <Flex sx={{ mt: "1.5em", alignSelf: "center", display: ["flex", "none"] }}>
          <UserAccount />
        </Flex>
      </Flex>
      <Flex sx={{ justifyContent: "end", flexDirection: "column", flex: 1 }}>
        <ExternalLinks />
      </Flex>
    </Box>
  );
};
