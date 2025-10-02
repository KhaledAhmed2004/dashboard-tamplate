import { Fragment } from "react"
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
import { Link, useLocation, useMatch } from "react-router-dom"
import { useGetUserByIdQuery } from "@/store/api/usersApi"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const userMatch = useMatch("/users/:id")
  const userId = userMatch?.params?.id || ""
  const { data: matchedUser } = useGetUserByIdQuery(userId, { skip: !userMatch })

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
  const visibleCrumbs: Array<({ label: string; href?: string; current?: boolean } | { ellipsis: true })> =
    crumbs.length > 3 ? [crumbs[0], { ellipsis: true }, ...crumbs.slice(-2)] : crumbs

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
                  <Fragment key={("ellipsis" in (c as any)) ? `ellipsis-${idx}` : `${(c as any).label}-${idx}`}>
                    {idx > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                    {"ellipsis" in (c as any) ? (
                      <BreadcrumbItem>
                        <BreadcrumbEllipsis />
                      </BreadcrumbItem>
                    ) : (
                      <BreadcrumbItem>
                        {c.current ? (
                          <BreadcrumbPage>{c.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={c.href || "#"}>{c.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    )}
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}