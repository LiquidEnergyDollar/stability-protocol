import { Container, Heading } from "theme-ui";

import { Chart } from "../components/Dashboard/Chart/Chart";
import { ChartProvider } from "../components/Dashboard/Chart/context/ChartProvider";

export const Charts = (): JSX.Element => (
    <Container>
      <Heading as="h2" sx={{ mt: "2.5em", fontWeight: "semibold" }}>
        Historical Charts
      </Heading>
      <Container variant="dashboardGrid">
        <ChartProvider dataSource='lastGoodPrice'>
            <Container variant="full">
              <Chart dataTitle='LED Redemption Price'/>
            </Container>
        </ChartProvider>
        <ChartProvider dataSource='LEDPrice'>
            <Container variant="full">
              <Chart dataTitle='LED Oracle Price'/>
            </Container>
        </ChartProvider>
        <ChartProvider dataSource='marketPrice'>
            <Container variant="full">
              <Chart dataTitle='LED Market Price'/>
            </Container>
        </ChartProvider>
        <ChartProvider dataSource='redemptionRate'>
            <Container variant="full">
              <Chart dataTitle='LED APY'/>
            </Container>
        </ChartProvider>
        <ChartProvider dataSource='deviationFactor'>
            <Container variant="full">
              <Chart dataTitle='Deviation Factor'/>
            </Container>
        </ChartProvider>
      </Container>
    </Container>
);
