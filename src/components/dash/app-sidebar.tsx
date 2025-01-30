"use client";

import * as React from "react";

import { Users, Award, Frame, PieChart, UserCheck, GalleryVerticalEnd, AudioWaveform, Command } from "lucide-react"; // Importar iconos

import { NavMain } from "@/components/dash/nav-main";
import { NavProjects } from "@/components/dash/nav-projects";
import { NavUser } from "@/components/dash/nav-user";
import { TeamSwitcher } from "@/components/dash/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  // Aquí filtramos las opciones para solo tener Users, Challenges y Retiros
  navMain: [
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
      url: "/admin/challenges", // URL para la página de Challenges
      icon: Award, // Icono que representa a "Challenges"
      isActive: false,

    },
    {
      title: "Withdrawals",
      url: "/admin/withdrawals", // URL para la página de Retiros
      icon: UserCheck, // Icono que representa a "Retiros"
      isActive: false,

    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}




  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "/admin/retiros",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "/admin/challenges",
  //     icon: PieChart,
  //   }
 
  // ],