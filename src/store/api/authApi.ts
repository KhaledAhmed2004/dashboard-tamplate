import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'super_admin';
    name: string;
  };
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/auth',
    prepareHeaders: (headers, { getState }) => {
      // Add authorization header if token exists
      const token = localStorage.getItem('adminToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: LoginResponse) => {
        // Store token in localStorage if login successful
        if (response.success && response.token) {
          localStorage.setItem('adminToken', response.token);
        }
        return response;
      },
      transformErrorResponse: (response: { status: number; data: any }) => ({
        message: response.data?.message || 'Login failed',
        status: response.status,
      }),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      transformResponse: (response: { success: boolean }) => {
        // Clear token from localStorage
        localStorage.removeItem('adminToken');
        return response;
      },
      invalidatesTags: ['Auth'],
    }),
    verifyToken: builder.query<LoginResponse, void>({
      query: () => '/verify',
      providesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useVerifyTokenQuery,
} = authApi;