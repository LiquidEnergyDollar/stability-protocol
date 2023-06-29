import { Card } from "theme-ui";

import { LineChart } from "./LineChart";

type ChartCardProps = {
  variant?: string;
  dataTitle?: string;
  tooltipText?: string;
};

export const Chart = ({ variant = "mainCards", dataTitle, tooltipText }: ChartCardProps): JSX.Element => {
  return (
    <Card {...{ variant }} sx={{ width: "100%" }}>
      <LineChart dataTitle={dataTitle} tooltipText={tooltipText} />
    </Card>
  );
};
