import { Container, Heading } from "theme-ui";

import { RedemptionPriceCard, OraclePriceCard, MarketPriceCard, RedemptionRateCard, DeviationFactorCard, TournamentYieldCard } from "../components/Dashboard/PriceCard";
import { ColRatio } from "../components/Dashboard/ColRatio";
import { VaultCard } from "../components/Dashboard/VaultCard";
import { StabilityPoolCard } from "../components/Dashboard/StabilityPoolCard";
import { SystemStatsCard } from "../components/SystemStatsCard";

export const Dashboard = (): JSX.Element => (
    <Container>
      <Heading as="h2" sx={{ mt: "2.5em", fontWeight: "semibold" }}>
        Dashboard
      </Heading>
      <Container variant="dashboardGrid">
        <Container variant="oneThird">
          <RedemptionPriceCard />
        </Container>
        <Container variant="oneThird">
          <OraclePriceCard />
        </Container>
        <Container variant="oneThird">
          <MarketPriceCard />
        </Container>
        <Container variant="oneThird">
          <RedemptionRateCard />
        </Container>
        <Container variant="oneThird">
          <TournamentYieldCard />
        </Container>
        <Container variant="oneThird">
          <DeviationFactorCard />
        </Container>
        {/* <Container variant="oneThird">
          <BorrowingFee />
        </Container> */}
        {/* <Container variant="oneThird">
          <OpenedVaults />
        </Container> */}
        <Container variant="oneThird">
          <ColRatio />
        </Container>
        <Container variant="full">
          <SystemStatsCard IsPriceEditable={true} />
        </Container>
        <Container variant="half">
          <VaultCard />
        </Container>
        <Container variant="half">
          <StabilityPoolCard />
        </Container>
      </Container>
    </Container>
);
