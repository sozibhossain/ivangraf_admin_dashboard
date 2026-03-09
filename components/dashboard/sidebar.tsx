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
import { signOut, useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  type ApiEnvelope,
  type UserPreferences,
  getUserPreferences,
  updateUserPreferences,
} from "@/lib/api";
import { clearActiveConnectionId } from "@/lib/connection-storage";
import { getErrorMessage } from "@/lib/error";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/dashboard/home", icon: Home },
  { name: "Analytic", href: "/dashboard/analytic", icon: PieChart },
  { name: "All Items", href: "/dashboard/all-items", icon: List },
  { name: "Sales of items", href: "/dashboard/sales-of-items", icon: ClipboardList },
  { name: "List of spend Goods", href: "/dashboard/list-of-spend-goods", icon: ShoppingCart },
  { name: "Revenue", href: "/dashboard/revenue", icon: Wallet },
  { name: "Revenue per tax group", href: "/dashboard/revenue-per-tax-group", icon: Percent },
  { name: "Revenue Per Waiter", href: "/dashboard/revenue-per-waiter", icon: Users },
  { name: "Opens Tables", href: "/dashboard/opens-tables", icon: Table2 },
  { name: "Stock of Goods", href: "/dashboard/stock-of-goods", icon: Package },
  { name: "Bills", href: "/dashboard/bills", icon: Receipt },
  { name: "Cancel Orders", href: "/dashboard/cancel-orders", icon: Ban },
].map((item, index) => ({ ...item, order: index }));

const EMPTY_FAVORITES: string[] = [];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

function buildUpdatedFavorites(current: string[], href: string) {
  if (current.includes(href)) {
    return current.filter((item) => item !== href);
  }
  return [...current, href];
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const preferencesQueryKey = React.useMemo(
    () => ["user", "preferences", session?.user?.id || "anonymous"] as const,
    [session?.user?.id]
  );

  const preferencesQuery = useQuery({
    queryKey: preferencesQueryKey,
    queryFn: getUserPreferences,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (favoriteSidebarItems: string[]) =>
      updateUserPreferences({ favoriteSidebarItems }),
    onMutate: async (nextFavorites) => {
      await queryClient.cancelQueries({ queryKey: preferencesQueryKey });
      const previous = queryClient.getQueryData<ApiEnvelope<UserPreferences>>(preferencesQueryKey);

      queryClient.setQueryData<ApiEnvelope<UserPreferences>>(preferencesQueryKey, {
        success: true,
        message: "OK",
        data: { favoriteSidebarItems: nextFavorites },
      });

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(preferencesQueryKey, context.previous);
      }
      toast.error(getErrorMessage(error, "Failed to save favorites"));
    },
    onSuccess: (response) => {
      queryClient.setQueryData(preferencesQueryKey, response);
    },
  });

  React.useEffect(() => {
    if (!preferencesQuery.error) return;
    toast.error(getErrorMessage(preferencesQuery.error, "Failed to load favorites"));
  }, [preferencesQuery.error]);

  const favorites = preferencesQuery.data?.data.favoriteSidebarItems ?? EMPTY_FAVORITES;
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
    const nextFavorites = buildUpdatedFavorites(favorites, href);
    updatePreferencesMutation.mutate(nextFavorites);
  };

  async function handleLogout() {
    clearActiveConnectionId();
    queryClient.removeQueries({ queryKey: ["user", "preferences"] });
    await signOut({ callbackUrl: "/auth/login" });
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col gap-4 overflow-hidden px-4 pb-6 pt-6 sm:pt-8",
        className
      )}
      style={{ backgroundColor: "rgba(255, 231, 169, 1)" }}
    >
      <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {sortedItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isFavorite = favoriteSet.has(item.href);
          return (
            <div
              key={item.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[#2f2a21] transition",
                isActive ? "bg-[#c99636] text-white shadow" : "hover:bg-[#f0d28c]"
              )}
            >
              <Link
                href={item.href}
                onClick={() => onNavigate?.()}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-[#2f2a21]")} />
                {item.name}
              </Link>
              <button
                type="button"
                aria-label={`Toggle favorite for ${item.name}`}
                aria-pressed={isFavorite}
                onClick={() => toggleFavorite(item.href)}
                className="rounded-full p-1 transition hover:bg-white/30"
                disabled={updatePreferencesMutation.isPending}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? isFavorite
                        ? "fill-white text-white"
                        : "text-white/85"
                      : isFavorite
                        ? "fill-[#f4a021] text-[#f4a021]"
                        : "text-[#f4a021]"
                  )}
                />
              </button>
            </div>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2 text-left text-sm font-semibold text-[#c93333]"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );
}
