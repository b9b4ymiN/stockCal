"use client";
import { ModeToggle } from "@/components/ui/mode-toggle";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border rounded-lg shadow-md">
      <Avatar>
        <AvatarImage src="https://ui.shadcn.com/avatars/shadcn.jpg" />
        <AvatarFallback>THP</AvatarFallback>
      </Avatar>
      <nav className="space-x-4">
        <Link href="/">DCF</Link>
        <Link href="/pe">PE</Link>
        <Link href="/ev-ebitda">EV/EBITDA</Link>
      </nav>
      <ModeToggle />
    </header>
  );
}
