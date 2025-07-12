"use client";

import { Search, MapPin } from "lucide-react";
import { useState } from "react";

import { Button } from "@ui/button";
import { DatePicker } from "@ui/date-picker";
import { Input } from "@ui/input";

export function HeroSection() {
  const [date, setDate] = useState<Date>();

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary py-20 md:py-28 overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 lg:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-8 text-neutral-white leading-tight animate-fade-in-up delay-100">
            Where tech minds{" "}
            <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              connect
            </span>{" "}
            and innovate
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Discover groundbreaking conferences, workshops, and networking
            events that shape the future of technology.
          </p>

          {/* Enhanced Search Bar */}
          <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl p-3 max-w-5xl mx-auto animate-fade-in-up delay-300">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative md:flex-grow">
                <Search className="search-bar-icon" />
                <Input
                  placeholder="AI, blockchain, web3..."
                  className="search-bar-input"
                />
              </div>
              <div className="relative md:flex-grow">
                <MapPin className="search-bar-icon" />
                <Input
                  placeholder="Lagos, Remote..."
                  className="search-bar-input"
                />
              </div>
              <div className="relative md:flex-grow">
                <DatePicker date={date} setDate={setDate} placeholder="When?" />
              </div>
              <Button className="search-bar-button">
                <Search className="hidden md:inline w-6 h-6 mr-0 group-hover:scale-110 transition-transform duration-200" />
                <span className="ml-2 md:hidden text-xl font-medium">
                  Search
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
