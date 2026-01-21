import React from "react";
import { headers } from "next/headers";

import { AppSidebar } from "@/components/dashboard/sidebar/app-sidebar";
import { PachamamaSiteHeader } from "@/components/dashboard/sidebar/pachamama-site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { UserRole } from "@/lib/middleware/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();

  const userRole = (headersList.get("x-user-role") || "SUPERADMIN") as UserRole;
  const userEmail = headersList.get("x-user-email") || "";
  const userAvatar = headersList.get("x-user-image") || "";
  const userName =
    headersList.get("x-user-name") || userEmail.split("@")[0] || "Usuario";

  return (
    <SidebarProvider>
      <AppSidebar
        variant="inset"
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
        userAvatar={userAvatar}
      />
      <SidebarInset>
        <PachamamaSiteHeader userRole={userRole} />
        <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
