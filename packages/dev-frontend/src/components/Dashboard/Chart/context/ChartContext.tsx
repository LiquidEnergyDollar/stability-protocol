import { createContext, useContext } from "react";
import { HistoricalDataItem } from "./ChartProvider"

type ChartContextType = {
  data: HistoricalDataItem[];
};

export const ChartContext = createContext<ChartContextType | null>(null);

export const useHistoricalData = async (): Promise<ChartContextType | null> => {
  const context = useContext(ChartContext);
  return context;
};
