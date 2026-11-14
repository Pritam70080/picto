"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  FolderOpen,
  Images,
  LogOut,
  Trash2,
} from "lucide-react";
import { useLogout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ThemeToggler } from "@/components/theme-toggler";
import { Spinner } from "@/components/ui/spinner";
import { StorageWidget } from "@/components/layout/storage-widget";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/lib/api";

const navItems = [
  { href: "/photos", label: "Photos", icon: Images },
  { href: "/albums", label: "Albums", icon: FolderOpen },
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/trash", label: "Trash", icon: Trash2 },
];

type SidebarNavProps = {
  user?: User | null;
  onNavigate?: () => void;
};

export function SidebarNav({ user, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const logoutMutation = useLogout();

  return (
    <div className="mobile-scrollbar-hidden flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain">
      <div className="border-b border-sidebar-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <img src="/Picto.png" alt="Picto Logo" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">Picto</p>
            <p className="text-xs text-muted-foreground">Manage your photos</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      <StorageWidget />

      <div className="mt-auto space-y-2 border-t border-sidebar-border px-3 py-3">

        {user && (
          <div className="rounded-xl bg-sidebar-accent/40 px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Signed in as</p>
            <div className="mt-2 flex min-w-0 items-center gap-3">
              <Avatar className="size-10 shadow-sm">
                <AvatarImage src={user.profileImage ?? undefined} alt={`${user.displayName}'s profile`} />
                <AvatarFallback>
                  {user.displayName.trim().charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{user.displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl px-2 py-1.5">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggler />
        </div>

        <button
          type="button"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors bg-linear-to-b from-primary/50 to-primary shadow-sm hover:bg-primary/80 dark:bg-linear-to-b dark:from-primary dark:to-primary/80 disabled:opacity-50"
        >
          {logoutMutation.isPending ? (
            <>
              <Spinner />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="size-4 shrink-0" />
              Sign out
            </>
          )}
        </button>
      </div>
    </div>
  );
}