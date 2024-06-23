'use client'
import { useState } from 'react'
import { Metadata } from 'next'
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { auth } from '@/app/firebase/config'
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth'

import { AuthRequiredError } from "@/app/exceptions";
import { useRouter } from 'next/navigation'
import { useAuthState } from "react-firebase-hooks/auth";
import LoadingScreen from './dashboard/LoadingScreen'


export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter()

  const handleSignUp = async (event: any) => {
    event.preventDefault();
    try {
      const res = await signInWithEmailAndPassword(email, password);
      console.log({res});
      sessionStorage.setItem('user', 'true')
      setEmail('');
      setPassword('');
      return router.push("/dashboard")
    } catch(e) {
      console.log(e)
      throw new AuthRequiredError("Tài khoản không chính xác!")
    }
  };

  const [user, loading, error] = useAuthState(auth);

  // While loading is true, show the loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    router.push('/dashboard');
    return null; 
  }

  return (
    <div className="w-full lg:grid lg:h-screen lg:grid-cols-1 xl:h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Đăng nhập</h1>
            <p className="text-balance text-muted-foreground">
              Nhập Email và mật khẩu để đăng nhập vào hệ thống
            </p>
          </div>

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
                <div className="flex items-center">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Link
                    href="/lost-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Quên mật khẩu à?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Đăng nhập đi
              </Button>
              {/* <Button variant="outline" className="w-full">
                Login with Google
              </Button> */}
            </div>
          </form>

          <div className="mt-4 text-center text-sm">
            Chưa có tài khoản á?{' '}
            <Link href="/register" className="underline">
              Đăng ký thôi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
