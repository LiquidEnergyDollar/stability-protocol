import React, { useState, useEffect } from "react";
import { ChartContext } from "./ChartContext";

import { useThreshold } from "../../../../hooks/ThresholdContext";
import { Decimal } from "@liquity/lib-base";

export type HistoricalDataItem = {
  timestamp: number;
  network: string;
  value: string;
};

export type HistoricalData = {
  data: HistoricalDataItem[]
};

export type FunctionalPanelProps = {
  loader?: React.ReactNode;
  children?: React.ReactNode;
  dataSource?: string
};

async function requestHistoricalData<TResponse>(
  url: string,
  config: RequestInit = {}
): Promise<TResponse> {
  return fetch(url, config)
    .then((response) => response.json())
    .then((data) => data as TResponse)
}

export const ChartProvider = ({ children, dataSource }: FunctionalPanelProps): JSX.Element => {
  // Define the state variables for the component using useState hook
  const [isDataAvailable, setIsDataAvailable] = useState<boolean>(true);
  const [data, setData] = useState<HistoricalDataItem[]>([]);
  const [isMounted, setIsMounted] = useState<boolean>(true);

  // Timestamp ranges for API query
  // Can be changed later if we add date ranges for charts
  const timestampBegin = 1;
  const timestampEnd = 16873850922; // arbitrary, we just want all the data

  // Destructure values from useThreshold hook
  const { config } = useThreshold();
  const { historicalApiUrl } = config;

  const getData = () => {
    // Check if the required config properties are present
    if (!historicalApiUrl) {
      console.error(`You must add a config.json file into the public source folder.`);
      setIsDataAvailable(false);
      return;
    }

    const parsedUrl = historicalApiUrl + `/${dataSource}?begin=${timestampBegin}&end=${timestampEnd}`
    requestHistoricalData<HistoricalData>(parsedUrl)
      .then((result) => {
        setData(result.data);
      })
      .catch((error) => {
        setIsDataAvailable(false);
        console.error('failed to fetch data: ', error);
      });
  };

  // Use the useEffect hook to fetch historical data only once when the component mounts
  useEffect(() => {
    if (!isMounted) {
      return;
    }
    getData();

    // Clean up function to set isMounted to false when the component unmounts
    return () => {
      setIsMounted(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  // Return the children wrapped in ChartContext.Provider if historical data is available
  if (!isDataAvailable) {
    return <>{children}</>
  };

  const chartProvider = {
    data: data,
  };

  return <ChartContext.Provider value={chartProvider}>{children}</ChartContext.Provider>;
};
