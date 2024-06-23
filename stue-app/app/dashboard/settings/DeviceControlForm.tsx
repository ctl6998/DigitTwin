"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/app/firebase/config";
import { getControl } from "@/app/services/firebaseService";
import { ControlData } from "@/app/type";
import { writeControl } from "@/app/services/firebaseService";

const FormSchema = z.object({
  enable_manual: z.boolean().default(false).optional(),
  enable_fan: z.boolean().default(false),
  enable_light: z.boolean().default(false),
  enable_heater: z.boolean().default(false),
  enable_humidifier: z.boolean().default(false),
});

export default function DeviceControlForm() {
  const [isManualEnabled, setIsManualEnabled] = useState(false);
  const [controlData, setControlData] = useState<ControlData | null>(null);

  // Get status on Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await getControl();
        setControlData(fetchedData);

        const dataRef = ref(database, "sensor_data/control");
        onValue(dataRef, (snapshot) => {
          const updatedData = snapshot.val();
          if (updatedData) {
            setControlData(updatedData);
          }
        });

        return () => {
          off(dataRef, "value");
        };
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(async () => {
      await fetchData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      enable_manual: false,
      enable_fan: false,
      enable_light: false,
      enable_heater: false,
      enable_humidifier: false,
    },
  });

  // Update settings switcher
  useEffect(() => {
    if (controlData) {
      form.reset({
        enable_manual: controlData.status === 1, // Convert from 0 and 1
        enable_fan: controlData.enable_fan === 1,
        enable_light: controlData.enable_light === 1,
        enable_heater: controlData.enable_heater === 1,
        enable_humidifier: controlData.enable_humidifier === 1,
      });
      setIsManualEnabled(controlData.status === 1);
    }
  }, [controlData, form]);

  // Push setitngs change to firebase
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    // const submitData = isManualEnabled ? data : { enable_manual: false };

    if (isManualEnabled) {
      const submitData = data;
      await writeControl({
        status: submitData.enable_manual ? 1 : 0,
        enable_fan: submitData.enable_fan ? 1 : 0,
        enable_light: submitData.enable_light ? 1 : 0,
        enable_heater: submitData.enable_heater ? 1 : 0,
        enable_humidifier: submitData.enable_humidifier ? 1 : 0,
      });

      toast({
        title: "Đã gửi lên hệ thống trạng thái:",
        description: (
          <div className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <p className="text-white">
              Chế độ điều khiển thủ công:{" "}
              {submitData.enable_manual ? "bật" : "tắt"}
            </p>
            <p className="text-white">
              Quạt: {submitData.enable_fan ? "bật" : "tắt"}
            </p>
            <p className="text-white">
              Đèn: {submitData.enable_light ? "bật" : "tắt"}
            </p>
            <p className="text-white">
              Lò sưởi: {submitData.enable_heater ? "bật" : "tắt"}
            </p>
            <p className="text-white">
              Máy tạo độ ẩm: {submitData.enable_humidifier ? "bật" : "tắt"}
            </p>
          </div>
        ),
      });
    } else {
      const submitData = {
        enable_manual: false,
        enable_fan: false,
        enable_light: false,
        enable_heater: false,
        enable_humidifier: false,
      };

      await writeControl({
        status: 0,
        enable_fan: 0,
        enable_light: 0,
        enable_heater: 0,
        enable_humidifier: 0,
      });

      toast({
        title: "Đã gửi lên hệ thống trạng thái:",
        description: (
          <div className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <p className="text-white">Chế độ điều khiển thủ công: tắt</p>
            <p className="text-white">Quạt: tắt</p>
            <p className="text-white">Đèn: tắt</p>
            <p className="text-white">Lò sưởi: tắt</p>
            <p className="text-white">Máy tạo độ ẩm: tắt</p>
          </div>
        ),
      });
    }
  }

  // Other options must be turned of with manual off
  function handleManualChange(value: boolean) {
    setIsManualEnabled(value);
    if (!value) {
      form.reset({
        enable_manual: false,
        enable_fan: false,
        enable_light: false,
        enable_heater: false,
        enable_humidifier: false,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="enable_manual"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Chế độ điều khiển thủ công
                    </FormLabel>
                    <FormDescription>
                      Điều khiển bật/tắt thiết bị theo nhu cầu
                    </FormDescription>
                  </div>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          handleManualChange(value);
                        }}
                      />
                      <span>{field.value ? "Tắt" : "Bật"}</span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enable_fan"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Điều khiển quạt</FormLabel>
                  </div>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                        }}
                        disabled={!isManualEnabled}
                        aria-readonly={!isManualEnabled}
                      />
                      <span>{field.value ? "Tắt" : "Bật"}</span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enable_light"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Điều khiển đèn</FormLabel>
                  </div>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                        }}
                        disabled={!isManualEnabled}
                        aria-readonly={!isManualEnabled}
                      />
                      <span>{field.value ? "Tắt" : "Bật"}</span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enable_heater"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Điều khiển lò sưởi
                    </FormLabel>
                  </div>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                        }}
                        disabled={!isManualEnabled}
                        aria-readonly={!isManualEnabled}
                      />
                      <span>{field.value ? "Tắt" : "Bật"}</span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enable_humidifier"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Điều khiển máy tạo độ ẩm
                    </FormLabel>
                  </div>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                        }}
                        disabled={!isManualEnabled}
                        aria-readonly={!isManualEnabled}
                      />
                      <span>{field.value ? "Tắt" : "Bật"}</span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
