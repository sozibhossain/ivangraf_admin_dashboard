import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoBadgeProps {
  className?: string;
}

export function LogoBadge({ className }: LogoBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-white shadow-sm",
        className
      )}
    >
     <Image src="/logo.png" alt="Logo" width={400} height={400} className="w-[112px] h-[53px]"/>
    </div>
  );
}