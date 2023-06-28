import { Container, Heading } from "theme-ui";

import { RedemptionPriceCard, OraclePriceCard, MarketPriceCard, RedemptionRateCard, DeviationFactorCard } from "../components/Dashboard/PriceCard";
import { BorrowingFee } from "../components/Dashboard/BorrowingFee";
import { OpenedVaults } from "../components/Dashboard/OpenedVaults";
import { ColRatio } from "../components/Dashboard/ColRatio";
import { Chart } from "../components/Dashboard/Chart/Chart";
import { VaultCard } from "../components/Dashboard/VaultCard";
import { StabilityPoolCard } from "../components/Dashboard/StabilityPoolCard";
import { SystemStatsCard } from "../components/SystemStatsCard";
import { ChartProvider } from "../components/Dashboard/Chart/context/ChartProvider";

export const Dashboard = (): JSX.Element => (
  <ChartProvider>
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
        {/* <Container variant="twoThirds">
          <Chart />
        </Container> */}
        <Container variant="full">
          <Chart />
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
  </ChartProvider>
);
