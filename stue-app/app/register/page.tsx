'use client'
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

import { useState } from "react";
import { auth } from '@/app/firebase/config'
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth'
import { AuthRequiredError } from "@/app/exceptions";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [createUserEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);

  const handleSignUp = async (event: any) => {
    event.preventDefault();
    try {
      const res = await createUserEmailAndPassword(email, password);
      console.log({res});
      sessionStorage.setItem('user', 'true')
      setEmail('');
      setPassword('');
    } catch(e) {
      console.log(e)
      throw new AuthRequiredError("Hmm, lỗi rồi chờ tí!")
    }
  };

  return (
    <div className="w-full lg:flex lg:h-screen lg:items-center lg:justify-center xl:h-screen">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Đăng kí phát</CardTitle>
          <CardDescription>
            Nhập Email và mật khẩu sử dụng vào đây đê, nhớ nhập cho chính xác
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Đăng kí! Đăng kí!
              </Button>
              {/* <Button variant="outline" className="w-full">
                Login with Google
              </Button> */}
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Có rồi mà mất pass á?{" "}
            <Link href="/lost-password" className="underline">
              Tìm cho!
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Assuming these components (Card, CardHeader, CardTitle, CardDescription, CardContent, Label, Input, Button, Link) are predefined and imported from a component library or your own component definitions.
