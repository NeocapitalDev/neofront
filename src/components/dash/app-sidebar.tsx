"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

import { Users, Award, UserCheck } from "lucide-react";

import { NavMain } from "@/components/dash/nav-main";
import { NavUser } from "@/components/dash/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession();
  const [userData, setUserData] = React.useState(null);

  // Efecto para actualizar el estado cuando session esté disponible
  React.useEffect(() => {
    console.log("Sesión actual:", session);

    if (session) {
      setUserData({
        email: session.user.email || "correo@ejemplo.com",
        avatar: "/images/icon-dark.png", // Avatar por defecto
        name: session.user.email.split("@")[0] || "Usuario", // Si no hay nombre, usar parte del email
      });
    }
  }, [session]);

  const isLoading = status === "loading" || !userData;

  const navMain = [
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
      isActive: false,
      items: [
        {
          title: "History",
          url: "/admin/users/history",
        },
        {
          title: "Settings",
          url: "/admin/users/settings",
        },
      ],
    },
    {
      title: "Challenges",
      url: "/admin/challenges",
      icon: Award,
      isActive: false,
    },
    {
      title: "Withdrawals",
      url: "/admin/withdrawals",
      icon: UserCheck,
      isActive: false,
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarFooter>
        {isLoading ? (
          <p className="text-center text-gray-500">Cargando sesión...</p>
        ) : (
          <NavUser user={userData} />
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}