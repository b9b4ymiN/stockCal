"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, LineChart, Settings, ChartArea } from "lucide-react";
import { ModeToggle } from "./ui/mode-toggle";

export default function Header() {
  return (
    <header className=" top-0 w-full   shadow z-50 px-6 py-3 border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center space-x-2">
          <Briefcase className="w-6 h-6  " />
          <span className="text-xl font-bold  ">MyCal</span>
        </Link>

        {/* NAV BUTTONS */}
        <nav className="flex space-x-4">
          <Link href="/">
            <Button variant="outline">
              <LineChart className="w-4 h-4 mr-2" />
              DCF
            </Button>
          </Link>

          <Link href="/pe">
            <Button variant="outline">
              <Briefcase className="w-4 h-4 mr-2" />
              PE
            </Button>
          </Link>

          <Link href="/ev-ebitda">
            <Button variant="outline">
              <ChartArea className="w-4 h-4 mr-2" />
              EV/EBITDA
            </Button>
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
