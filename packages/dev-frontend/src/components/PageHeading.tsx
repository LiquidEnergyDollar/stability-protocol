import { Box, Card, Paragraph, Link, Heading, Flex, Text, useColorMode } from "theme-ui";
import { GenericIcon } from "./GenericIcon";
import { InfoMessage } from "./InfoMessage";

type PageHeadingProps = {
  heading: string;
  description: string | JSX.Element;
  link: string;
  isPoweredByBProtocol?: boolean;
  descriptionTitle?: string;
}

export const PageHeading = ({ heading, description, link, isPoweredByBProtocol, descriptionTitle }: PageHeadingProps): JSX.Element => {
  const [colorMode] = useColorMode();

  return <>
    <Flex sx={{ justifyContent: "space-between", mt: "2.5em", fontWeight: "semibold", mr: "4em" }}>
      <Heading as="h2" sx={{ ml: "1em" }}>
        {heading}
      </Heading>
    </Flex>
    <Card sx={{ mr: [0, "2em"] }}>
      <Box sx={{ px: "2.5em", py: "1.5em" }}>
        <InfoMessage title={descriptionTitle || "About this functionality"}>
          <Paragraph sx={{ mb: "0.5em" }}>
            {description}
          </Paragraph>
          <Link sx={{display:"none"}} variant="infoLink" href={link} target="_blank">
            Read more
          </Link>
        </InfoMessage>
      </Box>
    </Card>
  </>
};
