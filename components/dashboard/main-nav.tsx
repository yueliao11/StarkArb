"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Settings, 
  LineChart, 
  History,
} from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center space-x-2">
          <LineChart className="h-6 w-6" />
          <span className="font-bold">StarkArb</span>
        </Link>
      </div>
      <div className="flex-1 space-y-1 p-2">
        <Button
          variant={pathname === "/" ? "secondary" : "ghost"}
          className="w-full justify-start"
          asChild
        >
          <Link href="/">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button
          variant={pathname === "/trades" ? "secondary" : "ghost"}
          className="w-full justify-start"
          asChild
        >
          <Link href="/trades">
            <History className="mr-2 h-4 w-4" />
            Trades
          </Link>
        </Button>
        <Button
          variant={pathname === "/analysis" ? "secondary" : "ghost"}
          className="w-full justify-start"
          asChild
        >
          <Link href="/analysis">
            <LineChart className="mr-2 h-4 w-4" />
            Analysis
          </Link>
        </Button>
        <Button
          variant={pathname === "/settings" ? "secondary" : "ghost"}
          className="w-full justify-start"
          asChild
        >
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>
    </div>
  )
}