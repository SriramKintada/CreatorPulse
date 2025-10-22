import type { ReactNode } from "react"
import { TopNav } from "./top-nav"
import { Sidebar } from "./sidebar"
import { MobileNav } from "./mobile-nav"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto pb-20 md:pb-0">{children}</main>
      </div>
      <MobileNav />
    </div>
  )
}
