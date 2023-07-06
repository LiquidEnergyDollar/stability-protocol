import { useThresholdSelector } from "@liquity/lib-react";
import { Container, Heading } from "theme-ui";

import { Chart } from "../components/Dashboard/Chart/Chart";
import { ChartProvider } from "../components/Dashboard/Chart/context/ChartProvider";
import { selector, TooltipText } from "../utils/tooltips"
import { COIN } from "../utils/constants";

export const Charts = (): JSX.Element => {
    const thresholdSelectorStores = useThresholdSelector(selector);
    const collat = thresholdSelectorStores[0].collateral
    return (
        <Container>
        <Heading as="h2" sx={{ mt: "2.5em", fontWeight: "semibold" }}>
            Historical Charts
        </Heading>
        <Container variant="dashboardGrid">
            <ChartProvider dataSource='lastGoodPrice'>
                <Container variant="full">
                <Chart dataTitle='LED Redemption Price'
                        tooltipText={TooltipText.redemptionPrice(COIN, collat)}/>
                </Container>
            </ChartProvider>
            <ChartProvider dataSource='LEDPrice'>
                <Container variant="full">
                <Chart dataTitle='LED Oracle Price'
                       tooltipText={TooltipText.oraclePrice(COIN)}/>
                </Container>
            </ChartProvider>
            <ChartProvider dataSource='marketPrice'>
                <Container variant="full">
                <Chart dataTitle='LED Market Price'
                       tooltipText={TooltipText.marketPrice(COIN, collat)}/>
                </Container>
            </ChartProvider>
            <ChartProvider dataSource='redemptionRate'>
                <Container variant="full">
                <Chart dataTitle='LED APY'
                       tooltipText={TooltipText.redemptionRate(COIN)}/>
                </Container>
            </ChartProvider>
            <ChartProvider dataSource='redemptionRate'>
                <Container variant="full">
                <Chart dataTitle='LED End of Tournament Yield'
                       tooltipText={TooltipText.tournamentYield(COIN)}/>
                </Container>
            </ChartProvider>
            <ChartProvider dataSource='deviationFactor'>
                <Container variant="full">
                <Chart dataTitle='Deviation Factor'
                       tooltipText={TooltipText.deviationFactor(COIN)}/>
                </Container>
            </ChartProvider>
        </Container>
        </Container>
    );
}
