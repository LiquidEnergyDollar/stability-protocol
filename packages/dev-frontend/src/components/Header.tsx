import React from "react";
import { Box, Container, Flex, Heading, useColorMode } from "theme-ui";
import { Link } from "./Link";
import { GenericIcon } from "./GenericIcon";
import { UserAccount } from "./UserAccount";

import { WHITE_FILTER } from "../utils/constants";

const logoHeight: string = "46px";

type HeaderProps = {
  children: React.ReactNode
}

export const Header = ({ children }: HeaderProps): JSX.Element => {
  const [colorMode, setColorMode] = useColorMode();
  return (
    <Container variant="header">
      <Link variant="logo" to="/">
        <GenericIcon imgSrc={colorMode === "dark" || colorMode === "darkGrey" ? "./favicon.png" : "./favicon.png"} height={logoHeight} />
        <Heading as="h1" sx={{ ml: ".5em" }}>
          LED
        </Heading>
      </Link>
      <Box
        sx={{ 
          display: ["none", "flex"],  
          alignItems: "center", 
          gap: 4 
        }}
      >
          <Flex
            sx={{
              cursor: "pointer",
              alignItems: "left", 
              justifyContent: "center",
              width: "1.5em"
            }}
            onClick={() => {
              setColorMode(colorMode === 'default' ? 'darkGrey' : 'default')
            }}
          >
            <GenericIcon 
              justifyContent="center" 
              imgSrc={colorMode === "darkGrey" ? "./icons/sun.svg" : "./icons/moon.svg"} 
              sx={colorMode === "dark" ? {filter: WHITE_FILTER} : {}} 
            />
          </Flex>
        <UserAccount />
      </Box>
      {children}
    </Container>
  );
};
