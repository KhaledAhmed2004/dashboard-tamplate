import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'editor' | 'moderator';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  joinDate: string;
  avatar: string;
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
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
}

export interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
  role?: 'admin' | 'user' | 'editor' | 'moderator';
  status?: 'active' | 'inactive' | 'pending';
  avatar?: string;
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'active' | 'inactive' | 'pending';
  role?: 'all' | 'admin' | 'user' | 'editor' | 'moderator';
}

// Simulate local storage for mock data persistence
const getStoredUsers = (): User[] => {
  const stored = localStorage.getItem('mockUsers');
  return stored ? JSON.parse(stored) : null;
};

const setStoredUsers = (users: User[]): void => {
  localStorage.setItem('mockUsers', JSON.stringify(users));
};

const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<UsersResponse, UsersQueryParams>({
      queryFn: async (params) => {
        try {
          // Try to get from localStorage first, then fallback to JSON file
          let users = getStoredUsers();
          
          if (!users) {
            const response = await fetch('/api/users.json');
            const data = await response.json();
            users = data.users;
            setStoredUsers(users);
          }

          // Apply filters
          let filteredUsers = users;

          if (params.search) {
            const searchLower = params.search.toLowerCase();
            filteredUsers = filteredUsers.filter(user =>
              user.name.toLowerCase().includes(searchLower) ||
              user.email.toLowerCase().includes(searchLower) ||
              user.role.toLowerCase().includes(searchLower)
            );
          }

          if (params.status && params.status !== 'all') {
            filteredUsers = filteredUsers.filter(user => user.status === params.status);
          }

          if (params.role && params.role !== 'all') {
            filteredUsers = filteredUsers.filter(user => user.role === params.role);
          }

          // Apply pagination
          const page = params.page || 1;
          const limit = params.limit || 10;
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

          return {
            data: {
              users: paginatedUsers,
              meta: {
                total: filteredUsers.length,
                page,
                limit,
                totalPages: Math.ceil(filteredUsers.length / limit)
              }
            }
          };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: 'Failed to fetch users' } };
        }
      },
      providesTags: ['User'],
    }),

    getUserById: builder.query<User, string>({
      queryFn: async (id) => {
        try {
          const users = getStoredUsers();
          if (!users) {
            const response = await fetch('/api/users.json');
            const data = await response.json();
            setStoredUsers(data.users);
          }
          
          const user = (users || []).find(u => u.id === id);
          if (!user) {
            return { error: { status: 404, data: 'User not found' } };
          }
          
          return { data: user };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: 'Failed to fetch user' } };
        }
      },
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    createUser: builder.mutation<User, CreateUserRequest>({
      queryFn: async (userData) => {
        try {
          let users = getStoredUsers();
          
          if (!users) {
            const response = await fetch('/api/users.json');
            const data = await response.json();
            users = data.users;
          }

          const newUser: User = {
            id: generateId(),
            ...userData,
            avatar: userData.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
            joinDate: new Date().toISOString().split('T')[0],
            lastLogin: 'Never'
          };

          const updatedUsers = [...users, newUser];
          setStoredUsers(updatedUsers);

          return { data: newUser };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: 'Failed to create user' } };
        }
      },
      invalidatesTags: ['User'],
    }),

    updateUser: builder.mutation<User, UpdateUserRequest>({
      queryFn: async ({ id, ...updateData }) => {
        try {
          let users = getStoredUsers();
          
          if (!users) {
            const response = await fetch('/api/users.json');
            const data = await response.json();
            users = data.users;
          }

          const userIndex = users.findIndex(u => u.id === id);
          if (userIndex === -1) {
            return { error: { status: 404, data: 'User not found' } };
          }

          const updatedUser = { ...users[userIndex], ...updateData };
          users[userIndex] = updatedUser;
          setStoredUsers(users);

          return { data: updatedUser };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: 'Failed to update user' } };
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
    }),

    deleteUser: builder.mutation<{ success: boolean }, string>({
      queryFn: async (id) => {
        try {
          let users = getStoredUsers();
          
          if (!users) {
            const response = await fetch('/api/users.json');
            const data = await response.json();
            users = data.users;
          }

          const userIndex = users.findIndex(u => u.id === id);
          if (userIndex === -1) {
            return { error: { status: 404, data: 'User not found' } };
          }

          users.splice(userIndex, 1);
          setStoredUsers(users);

          return { data: { success: true } };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: 'Failed to delete user' } };
        }
      },
      invalidatesTags: ['User'],
    }),

    searchUsers: builder.query<User[], string>({
      queryFn: async (query) => {
        try {
          let users = getStoredUsers();
          
          if (!users) {
            const response = await fetch('/api/users.json');
            const data = await response.json();
            users = data.users;
            setStoredUsers(users);
          }

          const searchLower = query.toLowerCase();
          const filtered = users
            .filter(user =>
              user.name.toLowerCase().includes(searchLower) ||
              user.email.toLowerCase().includes(searchLower) ||
              user.role.toLowerCase().includes(searchLower)
            )
            .slice(0, 8);

          return { data: filtered };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: 'Failed to search users' } };
        }
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

// Export the User type for use in components
export type { User };