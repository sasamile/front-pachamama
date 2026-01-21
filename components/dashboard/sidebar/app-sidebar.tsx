"use client";

import * as React from "react";
import {
  IconDashboard,
  IconBuilding,
  IconUserCog,
  IconHelp,
  IconSearch,
  IconSettings,
  type Icon,
} from "@tabler/icons-react";

import Logo from "@/components/common/logo";
import { NavMain } from "@/components/dashboard/sidebar/nav-main";
import { NavSecondary } from "@/components/dashboard/sidebar/nav-secondary";
import { NavUser } from "@/components/dashboard/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { UserRole } from "@/lib/middleware/types";

interface NavItem {
  title: string;
  url: string;
  icon: Icon;
}

const getNavConfig = (
  role: UserRole
): {
  navMain: NavItem[];
  navSecondary: NavItem[];
} => {
  // En Pachamama hoy solo nos importa SUPERADMIN (sin subdominio)
  if (role !== "SUPERADMIN") {
    return { navMain: [], navSecondary: [] };
  }

  return {
    navMain: [
      { title: "Dashboard", url: `/`, icon: IconDashboard },
      { title: "Restaurantes", url: `/restaurantes`, icon: IconBuilding },
      { title: "Administradores", url: `/administradores`, icon: IconUserCog },
    ],
    navSecondary: [
      { title: "Configuración", url: `/superadmin/settings`, icon: IconSettings },
      { title: "Ayuda", url: `/superadmin/help`, icon: IconHelp },
      { title: "Buscar", url: `/superadmin/search`, icon: IconSearch },
    ],
  };
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole: UserRole;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export function AppSidebar({
  userRole,
  userName = "Usuario",
  userEmail = "",
  userAvatar,
  ...props
}: AppSidebarProps) {
  const navConfig = getNavConfig(userRole);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/">
                <Logo />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navConfig.navMain} />
        <NavSecondary items={navConfig.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            image: userAvatar,
            name: userName,
            email: userEmail,
            avatar: userAvatar,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}

