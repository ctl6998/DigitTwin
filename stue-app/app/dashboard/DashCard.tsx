import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { Activity, Users, CalendarClock, RotateCw } from "lucide-react";

export default function DashCard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card x-chunk="dashboard-01-chunk-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Thời gian theo dõi</CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-[4px]">35 ngày</div>
          <p className="text-xs text-muted-foreground">từ 01/06/2024</p>
        </CardContent>
      </Card>

      <Card x-chunk="dashboard-01-chunk-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Số lượng cảm biển</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-[4px]">03 cảm biến</div>
          <p className="text-xs text-muted-foreground">thông tin chi tiết</p>
        </CardContent>
      </Card>

      <Card x-chunk="dashboard-01-chunk-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Trung bình người trong phòng</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-[4px]">12 người/ngày</div>
          <p className="text-xs text-muted-foreground">cao điểm 3:00PM - 6:00PM</p>
        </CardContent>
      </Card>

      {/* <Card x-chunk="dashboard-01-chunk-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Số người trong phòng hiện tại</CardTitle>
          <RotateCw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-[4px]">2 người</div>
          <p className="text-xs text-muted-foreground">tự động cập nhật mỗi 30 phút</p>
        </CardContent>
      </Card> */}
    </div>
  );
};