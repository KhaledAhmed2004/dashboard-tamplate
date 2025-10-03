import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type DashboardStats = {
  stats: {
    totalUsers: number;
    activeUsers: number;
    pendingUsers: number;
    inactiveUsers: number;
    totalRevenue: number;
    monthlyGrowth: number;
    newSignups: number;
    conversionRate: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    user?: { name: string; avatar?: string };
  }>;
  chartData: {
    userGrowth: Array<{ month: string; users: number }>;
    revenue: Array<{ month: string; revenue: number }>;
  };
};

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      async queryFn(_arg, _api, _extra, baseQuery) {
        const res: any = await (baseQuery as any)({ url: '/dashboard-stats.json', method: 'GET' });
        if (res.error) return { error: res.error };
        return { data: res.data as DashboardStats };
      },
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;