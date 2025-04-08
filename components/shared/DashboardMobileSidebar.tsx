"use client";

import { Button } from "@ui/button";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@ui/sheet";
import { DashboardSidebar } from "./DashboardSidebar";

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-18 left-4 z-50"
          aria-label="Toggle Sidebar"
        >
          <Menu size={24} />
        </Button>
      </SheetTrigger>
      <SheetDescription className="sr-only">
        Dashboard Navigation
      </SheetDescription>
      <SheetContent side="left" className="bg-white p-0 w-64">
        <SheetHeader className="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <SheetTitle className="text-gray-900">Dashboard</SheetTitle>
        </SheetHeader>
        <DashboardSidebar />
      </SheetContent>
    </Sheet>
  );
}
