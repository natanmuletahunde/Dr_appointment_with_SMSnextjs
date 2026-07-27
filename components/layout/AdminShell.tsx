"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  Briefcase,
  CalendarDays,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Mail,
  Menu,
  Search,
  Settings,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { logoutCurrentSession } from "@/lib/actions/auth.actions";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/admin/patients", label: "Patients", icon: Users },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/admin/search", label: "Search", icon: Search },
  { href: "/admin/waitlist", label: "Waitlist", icon: ListOrdered },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/audit", label: "Audit log", icon: Activity },
  { href: "/admin/approvals", label: "Approvals", icon: ClipboardCheck },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutCurrentSession();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("accessKey");
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const nav = (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActivePath(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-14-medium transition-colors",
              active
                ? "bg-green-500/15 text-green-500"
                : "text-dark-700 hover:bg-dark-400 hover:text-light-200"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-dark-300">
      <aside className="left-sidebar sidebar sticky top-0 h-screen border-r border-dark-400 bg-dark-200">
        <Link href="/admin" className="mb-8 block">
          <Image
            src="/assets/icons/logo-full.svg"
            alt="CarePulse"
            width={162}
            height={32}
            className="h-8 w-fit"
            priority
          />
        </Link>
        {nav}
        <Button
          type="button"
          variant="ghost"
          className="mt-6 justify-start gap-3 px-3 text-dark-700 hover:bg-dark-400 hover:text-red-500"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <LogOut className="size-4" aria-hidden />
          {loggingOut ? "Signing out…" : "Log out"}
        </Button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="admin-header lg:hidden">
          <Link href="/admin">
            <Image
              src="/assets/icons/logo-full.svg"
              alt="CarePulse"
              width={140}
              height={28}
              className="h-7 w-fit"
            />
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </header>

        {mobileOpen ? (
          <div className="border-b border-dark-400 bg-dark-200 px-4 py-4 lg:hidden">
            {nav}
            <Button
              type="button"
              variant="ghost"
              className="mt-4 w-full justify-start gap-3 text-dark-700"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut className="size-4" aria-hidden />
              Log out
            </Button>
          </div>
        ) : null}

        <main className="admin-main flex-1 py-8">{children}</main>
      </div>
    </div>
  );
}
