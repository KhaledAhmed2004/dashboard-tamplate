import { Fragment, useMemo } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { BreadcrumbEllipsis } from "@/components/ui/breadcrumb"
import { Link, useLocation, useMatch, useNavigate } from "react-router-dom"
import { useGetUserByIdQuery } from "@/store/api/usersApi"
import { useVerifyTokenQuery, useLogoutMutation } from "@/store/api/authApi"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Bell, LogOut, Settings, User as UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const userMatch = useMatch("/users/:id")
  const userId = userMatch?.params?.id || ""
  const { data: matchedUser } = useGetUserByIdQuery(userId, { skip: !userMatch })
  const { data: auth } = useVerifyTokenQuery()
  const [logout] = useLogoutMutation()

  const pathname = location.pathname
  const segments = pathname.split("/").filter(Boolean)

  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s

  // Build basic crumbs
  const crumbs: Array<{ label: string; href?: string; current?: boolean }> = []
  crumbs.push({ label: "Home", href: "/" })

  if (segments[0] === "dashboard") {
    crumbs.push({ label: "Dashboard", href: "/dashboard", current: true })
  } else if (segments[0] === "users") {
    if (segments.length > 1) {
      crumbs.push({ label: "User Management", href: "/users" })
      crumbs.push({ label: matchedUser?.name || "User Details", current: true })
    } else {
      crumbs.push({ label: "User Management", href: "/users", current: true })
    }
  } else if (segments.length) {
    // Fallback: map unknown segments to labels
    const base = `/${segments[0]}`
    if (segments.length === 1) {
      crumbs.push({ label: capitalize(segments[0]), href: base, current: true })
    } else {
      crumbs.push({ label: capitalize(segments[0]), href: base })
      crumbs.push({ label: capitalize(segments[1]), current: true })
    }
  }

  // Apply ellipsis if there are too many crumbs (keep first and last two)
  type Crumb = { label: string; href?: string; current?: boolean }
  type EllipsisCrumb = { ellipsis: true }
  const visibleCrumbs: Array<Crumb | EllipsisCrumb> =
    crumbs.length > 3 ? [crumbs[0], { ellipsis: true }, ...crumbs.slice(-2)] : crumbs

  const notifications = useMemo(() => (
    [
      { id: "n1", title: "3 new user signups", time: "Just now" },
      { id: "n2", title: "FAQ updated by editor", time: "10m ago" },
      { id: "n3", title: "Legal docs saved", time: "1h ago" },
    ]
  ), [])

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } catch (_) {}
    navigate("/login")
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {visibleCrumbs.map((c, idx) => (
                  <Fragment key={("ellipsis" in c) ? `ellipsis-${idx}` : `${(c as Crumb).label}-${idx}`}>
                    {idx > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                    {"ellipsis" in c ? (
                      <BreadcrumbItem>
                        <BreadcrumbEllipsis />
                      </BreadcrumbItem>
                    ) : (
                      <BreadcrumbItem>
                        {(c as Crumb).current ? (
                          <BreadcrumbPage>{(c as Crumb).label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={(c as Crumb).href || "#"}>{(c as Crumb).label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    )}
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-3 px-4">
            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-[10px]" variant="secondary">
                    {notifications.length}
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Notifications</span>
                  <span className="text-xs text-muted-foreground">{notifications.length} new</span>
                </div>
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div key={n.id} className="rounded-md border p-2">
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-xs text-muted-foreground">{n.time}</div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={undefined} alt={auth?.user?.name || "User"} />
                    <AvatarFallback>
                      {(auth?.user?.name || "U").slice(0,2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm">{auth?.user?.name || "Profile"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  {auth?.user?.email || "Signed in"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}