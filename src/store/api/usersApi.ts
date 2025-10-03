import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'editor' | 'moderator';
  status: 'active' | 'inactive' | 'pending' | 'blocked';
  lastLogin: string;
  joinDate: string;
  avatar: string;
  blocked?: boolean;
}

export interface UsersResponse {
  users: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: 'admin' | 'user' | 'editor' | 'moderator';
  status: 'active' | 'inactive' | 'pending' | 'blocked';
  avatar?: string;
  blocked?: boolean;
}

export interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
  role?: 'admin' | 'user' | 'editor' | 'moderator';
  status?: 'active' | 'inactive' | 'pending' | 'blocked';
  avatar?: string;
  blocked?: boolean;
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'active' | 'inactive' | 'pending' | 'blocked';
  role?: 'all' | 'admin' | 'user' | 'editor' | 'moderator';
}

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE, credentials: 'include' }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<UsersResponse, UsersQueryParams>({
      query: () => ({ url: '/users' }),
      transformResponse: (response: { users: User[] }, _meta, params) => {
        const users = (response.users || []).map(u => ({ ...u, blocked: u.blocked ?? false }));
        let filteredUsers = users;
        if (params?.search) {
          const s = params.search.toLowerCase();
          filteredUsers = filteredUsers.filter(u =>
            u.name.toLowerCase().includes(s) ||
            u.email.toLowerCase().includes(s) ||
            u.role.toLowerCase().includes(s)
          );
        }
        if (params?.status && params.status !== 'all') {
          filteredUsers = filteredUsers.filter(u => (u.status || '').toLowerCase() === params.status);
        }
        if (params?.role && params.role !== 'all') {
          filteredUsers = filteredUsers.filter(u => (u.role || '').toLowerCase() === params.role);
        }
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginated = filteredUsers.slice(startIndex, endIndex);
        return {
          users: paginated,
          meta: { total: filteredUsers.length, page, limit, totalPages: Math.ceil(filteredUsers.length / limit) },
        } as UsersResponse;
      },
      providesTags: ['User'],
    }),

    getUserById: builder.query<User, string>({
      query: (id) => ({ url: `/users/${id}` }),
      providesTags: (result, error, id) => {
        void result; void error; return [{ type: 'User', id }];
      },
    }),

    createUser: builder.mutation<User, CreateUserRequest>({
      query: (userData) => ({ url: '/users', method: 'POST', body: userData }),
      invalidatesTags: ['User'],
    }),

    updateUser: builder.mutation<User, UpdateUserRequest>({
      query: ({ id, ...updateData }) => ({ url: `/users/${id}`, method: 'PUT', body: updateData }),
      invalidatesTags: (result, error, { id }) => {
        void result; void error; return [{ type: 'User', id }, 'User'];
      },
    }),

    deleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),

    searchUsers: builder.query<User[], string>({
      query: () => ({ url: '/users' }),
      transformResponse: (response: { users: User[] }, _meta, query) => {
        const list = (response.users || []).map(u => ({ ...u, blocked: u.blocked ?? false }));
        const s = (query || '').toLowerCase();
        return list
          .filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.role.toLowerCase().includes(s))
          .slice(0, 8);
      },
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useLazySearchUsersQuery,
} = usersApi;