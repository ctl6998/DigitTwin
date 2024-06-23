'use client'
import Header from "./Header";
import LoadingScreen from "./LoadingScreen";
import { Suspense } from 'react'

import { AuthRequiredError } from "../exceptions";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from '@/app/firebase/config';
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children, 
}: {
  children: React.ReactNode;
}) {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  // While loading is true, show the loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  // If user is not authenticated, redirect to the home page
  if (!user) {
    router.push('/');
    return null; 
  }

  console.log('Loading:', loading, '|', 'Current user:', user.email);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Suspense fallback={<LoadingScreen />}>
        <Header userName={user.email} />
        {children}
      </Suspense>
    </div>
  );
}