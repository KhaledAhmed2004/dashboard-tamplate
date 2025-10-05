import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchWithSuggestions } from '@/components/ui/search-with-suggestions';
import UserModal from '@/components/UserModal';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { toast } from 'sonner';
import { 
  useGetUsersQuery, 
  useLazySearchUsersQuery, 
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  type User 
} from '@/store/api/usersApi';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  Ban,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';

const UserManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchValue, setSearchValue] = useState(''); // Add search input value state
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user' | 'editor' | 'moderator'>('all');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // RTK Query hooks
  const { 
    data: usersData, 
    isLoading, 
    error 
  } = useGetUsersQuery({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    status: statusFilter,
    role: roleFilter
  });

  const [searchUsers] = useLazySearchUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const navigate = useNavigate();

  const users = usersData?.users || [];
  const totalPages = usersData?.meta?.totalPages || 1;
  const totalUsers = usersData?.meta?.total || 0;

  // Convert User objects to SearchSuggestion format
  const convertUsersToSuggestions = (users: User[]) => {
    return users.map(user => ({
      id: user.id,
      text: `${user.name} (${user.email})`,
      type: 'name' as const
    }));
  };

  const simulateAsyncSearch = async (query: string) => {
    if (query.length < 2) return [];
    
    try {
      const result = await searchUsers(query);
      return convertUsersToSuggestions(result.data || []);
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setSearchTerm(value); // Update the actual search term for API calls
    setCurrentPage(1);
  };

  const handleCreateUser = async (userData: any) => {
    try {
      await createUser(userData).unwrap();
      setIsUserModalOpen(false);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleUpdateUser = async (userData: any) => {
    if (!editingUser) return;
    
    try {
      await updateUser({ id: editingUser.id, ...userData }).unwrap();
      setEditingUser(null);
      setIsUserModalOpen(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    
    try {
      await deleteUser(deletingUser.id).unwrap();
      toast.success('User deleted', {
        description: `${deletingUser.name} has been removed.`
      });
      setDeletingUser(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setDeletingUser(user);
  };

  const toggleBlockUser = async (user: User) => {
    try {
      const targetStatus = user.status === 'blocked' ? 'active' : 'blocked';
      await updateUser({ id: user.id, status: targetStatus }).unwrap();
      toast.success(user.status === 'blocked' ? 'User unblocked' : 'User blocked', {
        description: `${user.name} has been ${user.status === 'blocked' ? 'unblocked' : 'blocked'}.`
      });
    } catch (error) {
      console.error('Failed to toggle block:', error);
      toast.error('Failed to update user status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'blocked': return 'bg-red-200 text-red-900';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    const r = role?.toLowerCase();
    switch (r) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'moderator': return 'bg-orange-100 text-orange-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Error loading users. Please try again later.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage your application users</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchWithSuggestions
                value={searchValue}
                onChange={handleSearchChange}
                suggestions={[]}
                placeholder="Search users by name, email, or role..."
                onSearch={simulateAsyncSearch}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => { setStatusFilter(value); setCurrentPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={(value: any) => { setRoleFilter(value); setCurrentPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Users ({totalUsers})</span>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {/* Table header skeleton */}
              <div className="grid grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
              {/* Rows skeleton */}
              {[...Array(6)].map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-28" />
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : !users || users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Last Login</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Join Date</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {user.lastLogin}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {user.joinDate}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/users/${user.id}`)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(user)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(user)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBlockUser(user)}
                            className={`h-8 w-8 p-0 ${user.status === 'blocked' ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
                            title={user.status === 'blocked' ? 'Unblock' : 'Block'}
                          >
                            {user.status === 'blocked' ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalUsers)} of {totalUsers} users
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                />
              </PaginationItem>
              {(() => {
                const items: (number | 'ellipsis')[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) items.push(i);
                } else {
                  items.push(1);
                  if (currentPage > 3) items.push('ellipsis');
                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);
                  for (let i = start; i <= end; i++) items.push(i);
                  if (currentPage < totalPages - 2) items.push('ellipsis');
                  items.push(totalPages);
                }

                return items.map((p, idx) => (
                  <PaginationItem key={`${p}-${idx}`}>
                    {p === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        isActive={currentPage === p}
                        onClick={(e) => { e.preventDefault(); setCurrentPage(p as number); }}
                      >
                        {p}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ));
              })()}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* User Modal */}
  <UserModal
    isOpen={isUserModalOpen}
    onClose={() => {
      setIsUserModalOpen(false);
      setEditingUser(null);
    }}
    onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
    user={editingUser}
    mode={editingUser ? 'edit' : 'create'}
    isLoading={isCreating || isUpdating}
  />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteUser}
        userName={deletingUser?.name || ''}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default UserManagement;