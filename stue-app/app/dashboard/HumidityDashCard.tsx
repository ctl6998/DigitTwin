"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import HumidityChart from "./HumidityChart";


import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HumidityData } from "../type";

interface HumidityDashCardProps {
  data: HumidityData[];
}

const HumidityDashCard: React.FC<HumidityDashCardProps> = ({ data }) => {
  const convertTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Cảm biến độ ẩm</CardTitle>
            <CardDescription>Hiển thị dữ liệu trong 20 lần đo gần nhất</CardDescription>
          </div>
        </CardHeader>
        <HumidityChart data={data} />
      </Card>
      <Card className="xl:col-span-1" x-chunk="dashboard-01-chunk-5">
        <CardHeader>
          <CardTitle>Dữ liệu độ ẩm</CardTitle>
          <CardDescription>Kết quả từ cảm biến</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableCaption></TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Dữ liệu gốc</TableHead>
                  <TableHead>Dữ liệu Kalman</TableHead>
                </TableRow>
              </TableHeader>
              {data.length > 0 ? (
                <TableBody>
                  {data.slice().reverse().map((data, index) => (
                    <TableRow key={index}>
                      <TableCell>{convertTimestamp(data.timestamp)}</TableCell>
                      <TableCell>{data.humidityRaw.toFixed(4)} %</TableCell>
                      <TableCell>{data.humidityFilter.toFixed(4)} %</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <p>Loading...</p>
              )}
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default HumidityDashCard;