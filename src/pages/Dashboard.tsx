import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FeatureCard } from '@/components/ui/feature-card'
import { Users, TrendingUp, CreditCard, Gauge } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts'
import { useGetDashboardStatsQuery } from '@/store/api/dashboardApi'
import { Skeleton } from '@/components/ui/skeleton'

export function Dashboard() {
  const { data, isLoading: loading, error } = useGetDashboardStatsQuery()
  const errorMsg = useMemo(() => {
    if (!error) return null
    const maybe = (error as any)?.error || (error as any)?.data || (error as any)?.status
    return typeof maybe === 'string' ? maybe : 'Failed to load dashboard data'
  }, [error])

  return (
    <main className="space-y-8 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
      </header>

      {loading && (
        <section className="space-y-8">
          {/* KPI Skeletons */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>

          {/* Chart Skeletons */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-lg border">
                <div className="p-4">
                  <Skeleton className="h-5 w-48" />
                </div>
                <div className="p-4">
                  <Skeleton className="h-64 w-full" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {errorMsg && (
        <div className="text-sm text-red-600">{errorMsg}</div>
      )}

      {data && (
        <section className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              title="Total Users"
              description="All registered users"
              value={String(data.stats.totalUsers)}
              trend={`+${data.stats.newSignups} new this month`}
              icon={<Users className="h-5 w-5" />}
              color="blue"
              disableHover
            />
            <FeatureCard
              title="Active Users"
              description="Currently active"
              value={String(data.stats.activeUsers)}
              trend={`${data.stats.monthlyGrowth}% MoM growth`}
              icon={<TrendingUp className="h-5 w-5" />}
              color="green"
              disableHover
            />
            <FeatureCard
              title="Revenue"
              description="Total revenue"
              value={`$${(data.stats.totalRevenue).toLocaleString()}`}
              trend="Monthly trend"
              icon={<CreditCard className="h-5 w-5" />}
              color="purple"
              disableHover
            />
            <FeatureCard
              title="Conversion Rate"
              description="Signups to users"
              value={`${data.stats.conversionRate}%`}
              trend="Engagement"
              icon={<Gauge className="h-5 w-5" />}
              color="orange"
              disableHover
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.chartData.userGrowth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.chartData.revenue} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          
        </section>
      )}
    </main>
  )
}
