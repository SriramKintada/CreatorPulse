"use client"

import type React from "react"

import { MainLayout } from "@/components/layout/main-layout"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent-primary/5 px-4">
        {children}
      </div>
    </MainLayout>
  )
}
