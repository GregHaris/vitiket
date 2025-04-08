"use client";

import { BarChart, Calendar, CreditCard, Ticket, User } from "lucide-react";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { cn } from "@/lib/utils";

const items = [
  { title: "Tickets", url: "/dashboard/tickets", icon: Ticket },
  {
    title: "Organized Events",
    url: "/dashboard/organized-events",
    icon: Calendar,
  },
  { title: "Bank Details", url: "/dashboard/bank-details", icon: CreditCard },
  { title: "Profile", url: "/dashboard/profile", icon: User },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart },
];

interface DashboardSidebarProps {
  className?: string;
  children?: ReactNode;
}

export function DashboardSidebar({
  className,
  children,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "bg-white text-black flex flex-col h-full w-64",
        "border-r border-gray-200",
        className,
      )}
    >
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex flex-col gap-2">
          <div className="text-gray-500 text-xs font-medium px-2 py-1">
            Navigation
          </div>
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md text-sm",
                  "hover:bg-gray-100 hover:text-gray-900",
                  "focus-visible:ring-2 focus-visible:ring-gray-300 outline-none",
                  pathname === item.url
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-700",
                )}
              >
                <item.icon className="w-4 h-4 shrink-0 text-gray-600" />
                <span className="truncate">{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
