"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  LayoutDashboard,
  ListOrdered,
  Mail,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PatientShellProps = {
  userId: string;
  children: ReactNode;
};

export function PatientShell({ userId, children }: PatientShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      href: `/patients/${userId}/dashboard`,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: `/patients/${userId}/appointments`,
      label: "Appointments",
      icon: CalendarDays,
    },
    {
      href: `/patients/${userId}/messages`,
      label: "Messages",
      icon: Mail,
    },
    {
      href: `/patients/${userId}/waitlist`,
      label: "Waitlist",
      icon: ListOrdered,
    },
    {
      href: `/patients/${userId}/profile`,
      label: "Profile",
      icon: UserRound,
    },
    {
      href: `/patients/${userId}/notifications`,
      label: "Notifications",
      icon: Bell,
    },
  ] as const;

  const nav = (
    <nav aria-label="Patient portal" className="flex flex-1 flex-col gap-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
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
        <Link href={`/patients/${userId}/dashboard`} className="mb-8 block">
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
        <Link
          href="/"
          className="mt-6 text-14-regular text-dark-600 hover:text-green-500"
        >
          ← Back to home
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="admin-header lg:hidden">
          <Link href={`/patients/${userId}/dashboard`}>
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
          </div>
        ) : null}

        <main className="admin-main flex-1 py-8">{children}</main>
      </div>
    </div>
  );
}
