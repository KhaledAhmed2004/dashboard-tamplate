import * as React from "react"
import { ChevronRight, LogOut, User } from "lucide-react"
import { useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { navigationConfig } from "@/config/navigation"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
            A
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">AdminHub</span>
            <span className="truncate text-xs text-muted-foreground">Control Panel</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {navigationConfig.map((section) => (
          <SidebarGroup key={section.id}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href
                  
                  if (item.children) {
                    return (
                      <Collapsible key={item.id} asChild defaultOpen={item.isExpanded}>
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={item.name}>
                              <item.icon className={`h-4 w-4 ${item.color || 'text-muted-foreground'}`} />
                              <span>{item.name}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children.map((subItem) => {
                                const isSubActive = location.pathname === subItem.href
                                return (
                                  <SidebarMenuSubItem key={subItem.id}>
                                    <SidebarMenuSubButton 
                                      asChild 
                                      isActive={isSubActive}
                                    >
                                      <a href={subItem.href}>
                                        <subItem.icon className="h-4 w-4" />
                                        <span>{subItem.name}</span>
                                        {subItem.badge && (
                                          <Badge variant="secondary" className="ml-auto h-5 text-xs">
                                            {subItem.badge}
                                          </Badge>
                                        )}
                                      </a>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                )
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  }

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        asChild 
                        tooltip={item.name}
                        isActive={isActive}
                      >
                        <a href={item.href}>
                          <item.icon className={`h-4 w-4 ${item.color || 'text-muted-foreground'}`} />
                          <span>{item.name}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto h-5 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src="/avatars/shadcn.jpg" alt="Admin" />
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Admin User</span>
                <span className="truncate text-xs text-muted-foreground">admin@example.com</span>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}