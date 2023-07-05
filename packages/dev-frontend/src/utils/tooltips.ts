import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";

export const selector = ({
    price,
    marketPrice,
    piRedemptionRate,
    deviationFactor,
    symbol,
}: ThresholdStoreState) => ({
    price,
    marketPrice,
    piRedemptionRate,
    deviationFactor,
    symbol,
});

export abstract class TooltipText {
    public static redemptionPrice = (coin: string, collat: string) => {
      return `The redemption price of ${coin} denominated in ${collat}.`
    };
    public static oraclePrice = (coin: string) => {
      return `The price returned by the ${coin} Oracle.`
    };
    public static marketPrice = (coin: string, collat: string) => {
      return `The market price of ${coin} denominated in ${collat}.`
    };
    public static redemptionRate = (coin: string) => {
      return `The current yield that ${coin} holders will earn by tournament's end.`
    };
    public static deviationFactor = (coin: string) => {
      return `The accumulated interest rate of ${coin} since deployment. Initialized to 1.`
    };
}
