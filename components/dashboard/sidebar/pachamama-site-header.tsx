"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { UserRole } from "@/lib/middleware/types";

interface PachamamaSiteHeaderProps {
  userRole: UserRole;
  title?: string;
}

export function PachamamaSiteHeader({ userRole, title }: PachamamaSiteHeaderProps) {
  const computedTitle =
    title ?? (userRole === "SUPERADMIN" ? "Pachamama · Superadmin" : "Pachamama");

  return (
    <header className="flex h-10 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <h1 className="text-base font-medium">{computedTitle}</h1>
      </div>
    </header>
  );
}

