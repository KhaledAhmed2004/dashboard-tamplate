import * as React from "react";
import { ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { navigationConfig } from "@/config/navigation";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarContent>
        {navigationConfig.map((section) => (
          <SidebarGroup key={section.id}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href;

                  if (item.children) {
                    return (
                      <Collapsible
                        key={item.id}
                        asChild
                        defaultOpen={item.isExpanded}
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={item.name}>
                              <item.icon
                                className={`h-4 w-4 ${
                                  item.color || "text-muted-foreground"
                                }`}
                              />
                              <span>{item.name}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children.map((subItem) => {
                                const isSubActive =
                                  location.pathname === subItem.href;
                                return (
                                  <SidebarMenuSubItem key={subItem.id}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={isSubActive}
                                      className="data-[active=true]:bg-muted data-[active=true]:text-foreground"
                                    >
                                      <a href={subItem.href}>
                                        <subItem.icon className="h-4 w-4" />
                                        <span>{subItem.name}</span>
                                        {subItem.badge && (
                                          <Badge
                                            variant="secondary"
                                            className="ml-auto h-5 text-xs"
                                          >
                                            {subItem.badge}
                                          </Badge>
                                        )}
                                      </a>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.name}
                        isActive={isActive}
                        className="data-[active=true]:bg-muted data-[active=true]:text-foreground"
                      >
                        <a href={item.href}>
                          <item.icon
                            className={`h-4 w-4 ${
                              item.color || "text-muted-foreground"
                            }`}
                          />
                          <span>{item.name}</span>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className="ml-auto h-5 text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* SidebarFooter removed */}
    </Sidebar>
  );
}
