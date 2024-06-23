"use client";

import React, { PureComponent } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
// Define the data point type
interface DataPoint {
  timestamp: number;
  temperatureRaw: number;
  temperatureFilter: number;
}
import convertTimestamp from "../lib/convert";

// Define the props type
interface SensorLineChartProps {
  data: DataPoint[];
}

const TemperatureChart: React.FC<SensorLineChartProps> = ({ data }) => {
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    return `${("0" + date.getHours()).slice(-2)}:${(
      "0" + date.getMinutes()
    ).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}`;
  };
  // Find the min and max temperatures to set the Y-axis domain
  const minTemperature = Math.min(...data.map((point) => point.temperatureRaw));
  const maxTemperature = Math.max(...data.map((point) => point.temperatureRaw));

  // Calculate the domain with a buffer
  const domainMin = Math.floor(minTemperature * 10) / 10; // Round down to nearest 0.1
  const domainMax = Math.ceil(maxTemperature * 10) / 10; // Round up to nearest 0.1

  // Generate tick values with a step of 0.1
  const ticks = [];
  for (let temp = domainMin; temp <= domainMax; temp += 0.1) {
    ticks.push(temp);
  }

  return (
    <div style={{ height: "500px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
          />
          <YAxis
            domain={[domainMin, domainMax]} // Set Y-axis domain
            ticks={ticks} // Set custom tick values
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="temperatureRaw"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="temperatureFilter"
            stroke="#82ca9d"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TemperatureChart;
