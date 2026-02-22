import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoBadgeProps {
  className?: string;
}

export function LogoBadge({ className }: LogoBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl bg-black px-3 py-2 text-white shadow-sm sm:px-4",
        className
      )}
    >
      <Image
        src="/logo.png"
        alt="Logo"
        width={112}
        height={53}
        className="h-9 w-auto sm:h-12"
      />
    </div>
  );
}
