import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  return (
    <div className="w-full lg:flex lg:h-screen lg:items-center lg:justify-center xl:h-screen">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Mất khẩu</CardTitle>
          <CardDescription>
            Có mỗi cái mật khẩu cũng không nhớ được!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Nhập lại Email để cấp lại cho nè</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Xin lại mật khẩu
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            <Link href="/" className="underline">
              Quay lại
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
