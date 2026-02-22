"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  Home,
  PieChart,
  List,
  ClipboardList,
  ShoppingCart,
  Wallet,
  Percent,
  Users,
  Table2,
  Package,
  Receipt,
  Ban,
  Heart,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/dashboard/home", icon: Home },
  { name: "Analytic", href: "/dashboard/analytic", icon: PieChart },
  { name: "All Items", href: "/dashboard/all-items", icon: List },
  { name: "Sales of items", href: "/dashboard/sales-of-items", icon: ClipboardList },
  { name: "List of spend Goods", href: "/dashboard/list-of-spend-goods", icon: ShoppingCart },
  { name: "Revenue", href: "/dashboard/revenue", icon: Wallet },
  { name: "Revenue per tax group", href: "/dashboard/revenue-per-tax-group", icon: Percent },
  // { name: "Revenue Per Waiter", href: "/dashboard/revenue-per-waiter", icon: Users },
  // { name: "Opens Tables", href: "/dashboard/opens-tables", icon: Table2 },
  // { name: "Stock of Goods", href: "/dashboard/stock-of-goods", icon: Package },
  // { name: "Bills", href: "/dashboard/bills", icon: Receipt },
  // { name: "Cancel Orders", href: "/dashboard/cancel-orders", icon: Ban },
].map((item, index) => ({ ...item, order: index }));

const FAVORITES_KEY = "ivangraf_admin_favorites";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [favorites, setFavorites] = React.useState<string[]>([]);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // ignore storage errors
    }
  }, [favorites]);

  const favoriteSet = React.useMemo(() => new Set(favorites), [favorites]);

  const sortedItems = React.useMemo(() => {
    return [...navItems].sort((a, b) => {
      const aFav = favoriteSet.has(a.href);
      const bFav = favoriteSet.has(b.href);
      if (aFav !== bFav) return aFav ? -1 : 1;
      return a.order - b.order;
    });
  }, [favoriteSet]);

  const toggleFavorite = (href: string) => {
    setFavorites((prev) =>
      prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]
    );
  };

  return (
    <aside
      className={cn("flex h-full flex-col gap-4 px-4 pb-6 pt-8", className)}
      style={{ backgroundColor: "rgba(255, 231, 169, 1)" }}
    >
      <nav className="flex flex-1 flex-col gap-2">
        {sortedItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isFavorite = favoriteSet.has(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[#2f2a21] transition",
                isActive
                  ? "bg-[#c99636] text-white shadow"
                  : "hover:bg-[#f0d28c]"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-[#2f2a21]")} />
                {item.name}
              </span>
              <button
                type="button"
                aria-label={`Toggle favorite for ${item.name}`}
                aria-pressed={isFavorite}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleFavorite(item.href);
                }}
                className="rounded-full p-1 transition hover:bg-white/30"
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "fill-white text-white"
                      : isFavorite
                        ? "fill-[#f4a021] text-[#f4a021]"
                        : "text-[#f4a021]"
                  )}
                />
              </button>
            </Link>
          );
        })}
      </nav>
      <Link
        href="/auth/login"
        className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-[#c93333]"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Link>
    </aside>
  );
}
