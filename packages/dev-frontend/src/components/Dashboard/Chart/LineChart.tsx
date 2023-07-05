import { useEffect, useState } from "react";
import { Box, Card, Flex, useColorMode } from "theme-ui";
import { useHistoricalData } from "./context/ChartContext";
import { HistoricalDataItem } from "./context/ChartProvider";
import { BigNumber, utils } from "ethers"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ScriptableContext,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Decimal } from "@liquity/lib-base";
import { useHover } from "../../../utils/hooks";
import { LoadingChart } from "./LoadingChart";
import { InfoIcon } from "../../InfoIcon";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

ChartJS.register({
  id: 'uniqueid',
  beforeDraw: function (chart: any, _easing: any) {
    if (chart?.tooltip?._active && chart?.tooltip?._active.length) {
      const ctx = chart.ctx;
      const activePoint = chart.tooltip._active[0];
      const x = activePoint.element.x;
      const topY = chart.scales.y.top;
      const bottomY = chart.scales.y.bottom;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#e1e1e1';
      ctx.stroke();
      ctx.restore();
    }
  }
});

type LineChartProps = {
  dataTitle?: string;
  tooltipText?: string;
};

export const LineChart = ({ dataTitle, tooltipText }: LineChartProps): JSX.Element => {
  const [isMounted, setIsMounted] = useState<boolean>(true);
  const [hoverRef, isHovered] = useHover<HTMLDivElement>();
  const [colorMode] = useColorMode();
  const [activeData, setActiveData] = useState<number | string>('-');
  const [historicalData, setHistoricalData] = useState<HistoricalDataItem[]>([]);
  const [loadedChart, setLoadedChart] = useState<boolean>(false);
  const [activeLabel, setActiveLabel] = useState<string>('-');

  const formatData = (data: string, timestamp: number) => {
    if (dataTitle == 'LED APY') {
      const redemptionRate = Decimal.from(data).div(Decimal.from(10).pow(27));
      const tournamentEndDate = Math.floor(new Date('Jul 08 2023 19:00 GMT').getTime() / 1000);
      const secondsUntilEnd = tournamentEndDate - timestamp; // interest rate at time of collection
      const ratePerYear = redemptionRate.pow(secondsUntilEnd);
      return parseFloat(ratePerYear.toString()) * 100 - 100;
    }
    let multiplier = 18;
    if (dataTitle == 'Deviation Factor') multiplier = 27;
    const str = utils.formatUnits(BigNumber.from(data), multiplier)
    return parseFloat(str);
  }

  useHistoricalData()
    .then((result) => {
      if (result === null || !isMounted) {
        return
      }
      setHistoricalData(result.data)
      setLoadedChart(true);
    })
    .catch((error) => {
      setLoadedChart(false)
      console.error('hist data fetch error: ', error)
    })

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    const cachedData = localStorage.getItem("chartData");
    const cachedLabels = localStorage.getItem("chartLabels");
    
    if (cachedData && cachedLabels) {
      setLoadedChart(true);
    }
  
    if (!loadedChart) {
      return;
    }

    return () => {
      setIsMounted(false);
    };
  }, [isMounted, loadedChart, historicalData]);

  const labels: Array<{date: string, label: string}> = [];

  historicalData.map((item) => {
    const date = new Date(item.timestamp * 1000) // convert timestamp to date;
    const hour = date.getUTCHours();
    // Want to make sure minute values like '5' read as '05'
    const minute = date.getUTCMinutes().toString().padStart(2, '0');
    const day = date.getUTCDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getUTCFullYear();

    return labels.push({date: `${month} ${day} ${year}, ${hour}:${minute} GMT`, label: `${month} ${day}`})
  });

  const datapoints: Array<number> = [];
  historicalData.map((item) => {
    const parsed = formatData(item.value, item.timestamp);
    return datapoints.push(parsed);
  })

  const options = {
    locale: 'en-US',
    borderWidth: 2,
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      point:{
        radius: 0,
      },
    },
    scales: {
      y: {
        display: false,
        drawTicks: false,
        beginAtZero: false,
      }, 
      x: {
        ticks: {
          padding: 12,
          autoSkip: true,
          maxTicksLimit: 20,
          font: {
            size: 11,
            weight: 'bold'
          }
        },
        grid: {
          display: false,
          drawBorder: false,
          drawTicks: false,
        },
      },
    },
    grid: {
      display: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false,
      },
      title: {
        display: false,
      },
    },
    onHover: (event: any) => {
      const chart = event.chart
      const activePoint = chart.tooltip._active[0];
      const setIndex = activePoint?.datasetIndex;
      const index = activePoint?.index;
      const activeData = chart.data?.datasets[setIndex] &&
        chart.data?.datasets[setIndex]?.data[index].toPrecision(5);
      const labelIndex = labels[index];
      const activeLabel = labelIndex && labelIndex.date;
      setActiveData(activeData ? activeData : '-');
      setActiveLabel(activeLabel ?? '-')
    }
  };
  
  const data = {
    labels: labels.map((label: {date: string, label: string}) => {
      return label.label;
    }),
    datasets: [
      {
        fill: "start",
        lineTension: 0.4,
        label: dataTitle,
        data: datapoints,
        borderColor: colorMode === "dark" ? "#f3f3f3b8" : "#20cb9d",
        pointBackgroundColor: colorMode === 'dark' ? "#f3f3f3b8" : "#20cb9d",
        backgroundColor: (context: ScriptableContext<"line">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, colorMode === "dark" ? "#e5e5e5b8" : "#28c39b40");
          gradient.addColorStop(1, colorMode === "dark" ? "#f3f3f321" :  "#ffffff40");
          return gradient;
        },
      },
    ],
  };
  return (
    <Card variant="layout.columns" sx={{height: "100%"}}>
      <Flex sx={{
        width: "100%",
        height: "2.5rem",
        gap: 1,
        pb: 3,
        borderBottom: 1, 
        borderColor: "border"
      }}>
        {dataTitle}
        <InfoIcon size="sm" tooltip={<Card variant="tooltip">{tooltipText}</Card>} />
      </Flex>
      <Flex sx={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        pl: ["1rem", 0, 0, "1rem"],
        py: "2rem",
        gap: "1rem",
      }}>
        <Box style={{
          height: "20em",
          width: "100%",
          paddingBottom: "2.5em",
        }}>
          {loadedChart && <>
            <Flex sx={{ 
              position: "absolute", 
              gap: "2rem",
              marginTop: "-1.6rem",
              fontSize: "1.6rem", 
              fontWeight: "bold", 
              color: "text"
            }}>
              {loadedChart && (
                isHovered
                ? activeData
                : dataTitle
              )}
            </Flex>
            <Flex sx={{ 
              fontSize: ".9em",
              marginTop: "1rem",
              marginBottom: "1.5rem",
              height: "1rem",
            }}>
              {loadedChart && isHovered && activeLabel}
            </Flex>
          </>}
          <Box sx={{ display: "flex", paddingBottom: "1rem", height: "100%", width: "100%", justifyContent: "center", alignItems: "center" }} ref={hoverRef}>
            {
              !loadedChart 
                ? <LoadingChart />
                : <Line options={{ ...options, interaction: { mode: 'index', intersect: false } }}  data={data} />
            }
          </Box>
        </Box>
      </Flex>
    </Card>
  );
};
