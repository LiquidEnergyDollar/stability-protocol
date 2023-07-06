import { Container } from "theme-ui";
import { PageHeading } from "../components/PageHeading";
import { PageRow } from "../components/PageRow";
import { Leaderboard } from "../components/Leaderboard";

export const LeaderboardPage = (): JSX.Element => {
  return <Container variant="singlePage">
    <PageHeading
      heading="Leaderboard"
      descriptionTitle="Leaderboard for LED Tournament"
      description="Top performing addresses for the LED tournament. Score is determined by assets (USD and LED) minus any outstanding LED debt."
      link="https://codyborn.notion.site/LED-Trading-Tournament-Guide-6fb50c860dfb41ada89e9e67528140cc"
    />
    <PageRow isWidthFull={true} Component={Leaderboard} />
  </Container>
};
