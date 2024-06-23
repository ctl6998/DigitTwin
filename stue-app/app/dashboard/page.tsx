"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HumidityChart from "./HumidityChart";
import { useState, useEffect } from "react";
import { getData } from "../services/firebaseService";
import convertTimestamp from "../lib/convert";
import { database } from "@/app/firebase/config";
import { ref, get, onValue, off } from "firebase/database";
import { Button } from "@/components/ui/button";
import {
  CalendarClock,
  TriangleAlert,
  Cctv,
  ScanEye,
  SlidersHorizontal,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DashCard from "./DashCard";
import { TemperatureData } from "../type";
import { HumidityData } from "../type";
import { GasData } from "../type";
import TemperatureDashCard from "./TemperatureDashCard";
import HumidityDashCard from "./HumidityDashCard";
import { ViewCameraButton } from "./ViewCameraButton";
import Link from "next/link";

interface SensorData {
  timestamp: number;
  temperature: number;
  humidity: number;
}

type RawData = SensorData[];
type FilterData = SensorData[];

interface TimestampSensorData {
  distance: number;
  gas: number;
  humidity: number;
  temperature: number;
  timestamp: number;
}

type TimeRawData = TimestampSensorData[];
type FilterRawData = TimestampSensorData[];

const transformTimestampDataRaw = (data: any): any => {
  return Object.keys(data).map((key) => {
    const entry = data[key].raw;
    return {
      distance: entry.distance,
      gas: entry.gas,
      humidity: entry.humidity,
      temperature: entry.temperature,
      timestamp: entry.timestamp,
    };
  });
};

const transformTimestampDataFiltered = (data: any): any => {
  return Object.keys(data).map((key) => {
    const entry = data[key].filtered;
    return {
      distance: entry.distance,
      gas: entry.gas,
      humidity: entry.humidity,
      temperature: entry.temperature,
      timestamp: entry.timestamp,
    };
  });
};

const combineTemperatureData = (
  rawData: TimestampSensorData[],
  filteredData: TimestampSensorData[]
): TemperatureData[] => {
  return rawData.map((rawEntry, index) => {
    const filterEntry = filteredData[index];
    return {
      timestamp: rawEntry.timestamp,
      temperatureRaw: rawEntry.temperature,
      temperatureFilter: filterEntry.temperature,
    };
  });
};

const combineHumidityData = (
  rawData: TimestampSensorData[],
  filteredData: TimestampSensorData[]
): HumidityData[] => {
  return rawData.map((rawEntry, index) => {
    const filterEntry = filteredData[index];
    return {
      timestamp: rawEntry.timestamp,
      humidityRaw: rawEntry.humidity,
      humidityFilter: filterEntry.humidity,
    };
  });
};

const getGasInfo = (data: any) => {
  if (data.length > 0) {
    const lastItem = data[data.length - 1];
    return {
      timestamp: lastItem.timestamp,
      gas: lastItem.gas,
    };
  }
  return null;
};

export default function Page() {
  const [timeRawData, setTimeRawData] = useState<TimeRawData[]>([]);
  const [timeFilterData, setTimeFilterData] = useState<TimeRawData[]>([]);
  const [temperatureData, setTemperatureData] = useState<TemperatureData[]>([]);
  const [humidityData, setHumidityData] = useState<HumidityData[]>([]);
  const [gasData, setGasData] = useState<GasData>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await getData();
        // Get raw data
        const rawTimestampData = transformTimestampDataRaw(
          fetchedData.real_time_db
        );
        const filterTimestampData = transformTimestampDataFiltered(
          fetchedData.real_time_db
        );
        setTimeRawData(rawTimestampData);
        setTimeFilterData(filterTimestampData);

        // Get visualize data
        const temperatureTimestampData = combineTemperatureData(
          rawTimestampData,
          filterTimestampData
        );
        const humidityTimestampData = combineHumidityData(
          rawTimestampData,
          filterTimestampData
        );
        setTemperatureData(temperatureTimestampData);
        setHumidityData(humidityTimestampData);

        // Set up a real-time listener for changes
        const dataRef = ref(database, "sensor_data");
        onValue(dataRef, (snapshot) => {
          console.log("Update New");
          const updatedData = snapshot.val();
          if (updatedData) {
            setTimeRawData(transformTimestampDataRaw(updatedData.real_time_db));
            setTimeFilterData(
              transformTimestampDataFiltered(updatedData.real_time_db)
            );
            const latestGasInfo: any = getGasInfo(
              transformTimestampDataRaw(updatedData.real_time_db)
            );
            setGasData(latestGasInfo);
          }
        });
        // Clean up the listener when component unmounts
        return () => {
          off(dataRef, "value");
        };
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
    fetchData();
    // ISR to regenerate page every 10 seconds
    const interval = setInterval(async () => {
      await fetchData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // console.log("Temperature", temperatureData);
  // console.log("Humidity", humidityData);
  // console.log("Gas status", getGasInfo(timeRawData))
  // console.log(gasData);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* Title */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <div className="grid gap-4 md:grid-cols-1 md:gap-8 lg:grid-cols-1">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">
              Bảng điều khiển
            </h1>
          </div>
          <Tabs defaultValue="overview" className="w-[400px]">
            <TabsList>
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="filters">Bộ lọc Kalman</TabsTrigger>
              <TabsTrigger value="warnings">Cảnh báo</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {/* GasDangerCard */}
        <Card
          className="cardBgClass"
          x-chunk="dashboard-01-chunk-0"
          style={{
            backgroundColor: gasData?.gas === 0 ? "#d9ead3" : "#f4cccc",
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cảnh báo khí độc
            </CardTitle>
            <TriangleAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-[4px]">
              {gasData
                ? gasData.gas === 0
                  ? "An toàn"
                  : "Phát hiện khí độc"
                : "Đang cập nhật..."}
            </div>
            <Link href="/dashboard/settings">
              <Button variant="secondary" style={{ marginBottom: "12px" }}>
                <SlidersHorizontal className="h-4 w-4 mr-[8px]" />
                <div className="text-sm">Điều khiển thủ công</div>
              </Button>
            </Link>
            <p className="text-xs">
              Dữ liệu cập nhật:{" "}
              {gasData
                ? convertTimestamp(gasData.timestamp)
                : "Đang cập nhật..."}
            </p>
          </CardContent>
        </Card>
        {/* CameraCard */}
        <Card x-chunk="dashboard-01-chunk-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Camera theo dõi
            </CardTitle>
            <Cctv className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ViewCameraButton />
            <p className="text-xs">Dữ liệu cập nhật: 22/06/2024 02:18:48 AM</p>
          </CardContent>
        </Card>
      </div>
      <DashCard />
      {/* TemperatureDashCard */}
      <TemperatureDashCard data={temperatureData} />

      {/* HumidityDashCard */}
      <HumidityDashCard data={humidityData} />
    </main>
  );
}
