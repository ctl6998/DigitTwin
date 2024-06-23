"use client";

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-96">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Lỗi rồi bạn ơi</AlertTitle>
          <AlertDescription>
            {error.message || "Lỗi ở đâu rồi"}
          </AlertDescription>
        </Alert>
        <div className="flex mt-4 space-x-2">
          <Button variant="outline" onClick={reset}>
            Thử lại xem
          </Button>
          <Link href="/" className="underline">
            <Button variant="secondary">Quay đầu là bờ</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
