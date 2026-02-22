"use client";

import { Menu } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoBadge } from "@/components/dashboard/logo-badge";
import { cn } from "@/lib/utils";

interface TopbarProps {
  className?: string;
  onMenuClick?: () => void;
}

export function Topbar({ className, onMenuClick }: TopbarProps) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8",
        className
      )}
      style={{ backgroundColor: "rgba(255, 231, 169, 1)" }}
    >
      <div className="flex items-center gap-3">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d3b57a] bg-white/80 text-[#4b4030] shadow-sm transition hover:bg-white lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : null}
        <LogoBadge className="px-3 py-2 sm:px-4" />
      </div>
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 sm:h-12 sm:w-12">
          <AvatarImage src="/avatar.svg" alt="Madiha Aroa" />
          <AvatarFallback>MA</AvatarFallback>
        </Avatar>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-[#2f2a21]">Madiha Aroa</div>
          <div className="text-xs text-[#7b6a48]">Welcome back</div>
        </div>
      </div>
    </header>
  );
}
