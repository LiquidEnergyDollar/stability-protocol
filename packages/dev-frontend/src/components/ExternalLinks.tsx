import { Flex, Image, Link, useColorMode } from "theme-ui";
import { Icon } from "./Icon";
import { DARK_FILTER, GREY_FILTER } from "../utils/constants";

export const ExternalLinks = (): JSX.Element => {
  const [colorMode] = useColorMode();

  return (
    <>
      <Link sx={{display:"none"}} variant="nav" href="https://docs.threshold.network/fundamentals/threshold-usd" target="_blank">
        <Icon name="book" />
        Documentation
      </Link>
      <Flex sx={{
        display: "flex",
        flexDirection: "row",
        alignSelf: "center",
        bottom: 0
      }}>
        <Link variant="socialIcons" href="https://discord.gg/mE2u9YuA47" target="_blank">
          <Image src="./icons/discord.svg" sx={colorMode === "dark" ? {filter: GREY_FILTER} : {filter: DARK_FILTER}} />
        </Link>
        <Link variant="socialIcons" href="https://github.com/LiquidEnergyDollar" target="_blank">
          <Image src="./icons/github.svg" sx={colorMode === "dark" ? {filter: GREY_FILTER} : {filter: DARK_FILTER}} />
        </Link>
      </Flex>
    </>
  );
};
