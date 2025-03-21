// src/components/dash/app-sidebar.js
"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

import { Users, Award, UserCheck, Activity } from "lucide-react";

import { NavMain } from "@/components/dash/nav-main";
import { NavUser } from "@/components/dash/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import md5 from 'md5';

export function AppSidebar({ ...props }) {
  const { data: session, status } = useSession();
  const [userData, setUserData] = React.useState(null);





  // Efecto para actualizar el estado cuando session esté disponible
  React.useEffect(() => {
    // console.log("Sesión actual:", session);

    if (session) {
      const avatarUrl = `https://www.gravatar.com/avatar/${md5(session.user.email.trim().toLowerCase())}?s=40&d=retro`;

      setUserData({
        email: session.user.email || "correo@ejemplo.com",
        avatar: avatarUrl, // Avatar de Gravatar
        name: session.user.email || session.firstName, // Si no hay nombre, usar parte del email
      });
    }
  }, [session]);

  const isLoading = status === "Cargando" || !userData;

  const navMain = [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: Users,
      isActive: false,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
      isActive: false,
      //   items: [
      //     {
      //       title: "History",
      //       url: "/admin/users/history",
      //     },
      //     {
      //       title: "Settings",
      //       url: "/admin/users/settings",
      //     },
      //   ],
    },
    {
      title: "Challenges",
      url: "/admin/challenges",
      icon: Award,
      isActive: false,
    },
    {
      title: "Payouts",
      url: "/admin/payouts",
      icon: Award,
      isActive: false,
    },
    {
      title: "Withdrawals",
      url: "/admin/withdrawals",
      icon: UserCheck,
      isActive: false,
    },
    {
      title: "Broker Accounts",
      url: "/admin/brokerAccount",
      icon: Activity,
      isActive: false,
    },
    {
      title: "Steps",
      url: "/admin/steps",
      icon: Activity,
      isActive: false,
    },
    {
      title: "Manager",
      url: "/admin/manager",
      icon: Activity,
      isActive: false,
    },
    {
      title: "Parameters",
      url: "/admin/parameters",
      icon: Activity,
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