import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Bell, Settings2 } from "lucide-react";

import { BellRing, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const notifications = [
  {
    title: "Độ ẩm phòng dưới ngưỡng an toàn",
    description: "Dưới 10% RH: Quá khô, có thể gây tổn thương da và niêm mạc.",
  },
  {
    title: "Nhiệt độ phòng trên mức khuyến cáo",
    description: "Trên 32°C: Có nguy cơ ảnh hưởng đến sức khỏe, đặc biệt là cho người già và trẻ em.",
  },
  {
    title: "Cửa không khóa",
    description: "Hệ thống sẽ báo động khi phát hiện không có người trong phòng và cửa không khóa",
  },
];

type CardProps = React.ComponentProps<typeof Card>;

export default function Notification() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full lg:mr-4"
        >
          <Bell className="h-5 w-5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className={cn("p-0 w-500")}>
        <Card className={cn("w-full")}>
          <CardHeader>
            <CardTitle>Bật chế độ cảnh báo</CardTitle>
            <CardDescription>Bạn đang cài đặt 3 cảnh báo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className=" flex items-center space-x-4 rounded-md border p-4">
              <BellRing />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Nhận thông báo về Email
                </p>
                <p className="text-sm text-muted-foreground">
                  Gửi email cảnh bảo cho người thân khi điều kiện trong phòng vượt ngưỡng an toàn
                </p>
              </div>
              <Switch />
            </div>
            <div>
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                >
                  <span className="flex h-2 w-2 translate-y-1 rounded-full bg-red-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className={cn("flex justify-end")}>
            <AlertDialogFooter>
              <AlertDialogCancel>Quay lại</AlertDialogCancel>
              <AlertDialogAction>
                <Settings2 className="mr-2 h-4 w-4" />
                Cài đặt
              </AlertDialogAction>
              <AlertDialogAction>
                <Check className="mr-2 h-4 w-4" />
                Áp dụng
              </AlertDialogAction>
            </AlertDialogFooter>
          </CardFooter>
        </Card>
      </AlertDialogContent>
    </AlertDialog>
  );
}
