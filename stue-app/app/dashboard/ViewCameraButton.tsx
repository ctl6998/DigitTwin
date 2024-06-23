import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { ScanEye } from "lucide-react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import convertTimestamp from "../lib/convert";
import { useEffect } from "react";

export function ViewCameraButton() {
  const [imageURL, setImageURL] = useState(null);
  const [noPerson, setNoPerson] = useState(null);
  const [cameraTime, setCameraTime] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openDialog = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://127.0.0.1:9999/storage");
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }
      const data = await response.json();
      setImageURL(data.image_path);
      setNoPerson(data.number_of_persons);
      const timeDate = convertTimestamp(data.timestamp)
      setCameraTime(timeDate);
      setIsOpen(true);

      console.log(data.image_path)
    } catch (error) {
      console.error("Error fetching image:", error);
      // Handle error state or display a message to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button style={{ marginBottom: "12px" }} onClick={openDialog}>
          <ScanEye className="h-4 w-4 mr-[8px]" />
          <div className="text-base">Theo dõi màn hình</div>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Dữ liệu Camera</AlertDialogTitle>
          <AlertDialogDescription>
            Dữ liệu cập nhật:
            {isLoading ? " Đang cập nhật..." : ` ${cameraTime}`}
          </AlertDialogDescription>
          <AlertDialogDescription>
            Số người trong phòng hiện tại:
            {isLoading ? " Đang cập nhật..." : ` ${noPerson}`}
          </AlertDialogDescription>
          {isLoading ? (
            <Skeleton className="h-[346.5px] w-100 rounded-xl" />
          ) : (
            <AspectRatio ratio={640 / 480} className="bg-muted">
              {imageURL && (
                <img
                  src={imageURL}
                  alt=""
                  className="rounded-md"
                />
              )}
            </AspectRatio>
          )}
         </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Đóng</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
