"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; // Obtener la URL actual
import { type LucideIcon } from "lucide-react";

import { Collapsible } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname() || ""; // Asegurar que pathname siempre tenga un valor válido

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname?.toLowerCase() === item.url.toLowerCase(); // Verifica si la URL está activa

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem className="group/collapsible-trigger">
                <div className="flex py-1  mt-2 w-full">
                  {isActive ? (
                    <div className="flex-grow">
                      <SidebarMenuButton
                        tooltip={item.title}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-700 text-white font-semibold shadow-md"
                      >
                        {item.icon && <item.icon className="w-5 h-5" />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </div>
                  ) : (
                    <Link href={item.url} className="flex-grow">
                      <SidebarMenuButton
                        tooltip={item.title}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        {item.icon && <item.icon className="w-5 h-5" />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  )}
                </div>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
