import React, { useState, useEffect, useMemo } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { SearchWithSuggestions } from '@/components/ui/search-with-suggestions';
import type { SearchSuggestion } from '@/components/ui/search-with-suggestions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  UserPlus
} from "lucide-react";

// Mock user data
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  joinDate: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'active',
    lastLogin: '2024-01-15',
    joinDate: '2023-06-15'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Editor',
    status: 'active',
    lastLogin: '2024-01-14',
    joinDate: '2023-08-20'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    role: 'User',
    status: 'inactive',
    lastLogin: '2024-01-10',
    joinDate: '2023-09-10'
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    role: 'Editor',
    status: 'pending',
    lastLogin: 'Never',
    joinDate: '2024-01-12'
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'david.brown@example.com',
    role: 'User',
    status: 'active',
    lastLogin: '2024-01-13',
    joinDate: '2023-11-05'
  },
  {
    id: '6',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    role: 'Admin',
    status: 'active',
    lastLogin: '2024-01-15',
    joinDate: '2023-05-20'
  },
  {
    id: '7',
    name: 'Robert Miller',
    email: 'robert.miller@example.com',
    role: 'User',
    status: 'inactive',
    lastLogin: '2024-01-08',
    joinDate: '2023-12-01'
  },
  {
    id: '8',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@example.com',
    role: 'Editor',
    status: 'active',
    lastLogin: '2024-01-14',
    joinDate: '2023-07-18'
  },
  {
    id: '9',
    name: 'James Taylor',
    email: 'james.taylor@example.com',
    role: 'User',
    status: 'pending',
    lastLogin: 'Never',
    joinDate: '2024-01-10'
  },
  {
    id: '10',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    role: 'Admin',
    status: 'active',
    lastLogin: '2024-01-15',
    joinDate: '2023-04-12'
  },
];

const ITEMS_PER_PAGE = 5;

const UserManagement: React.FC = () => {
  const [users] = useState<User[]>(mockUsers);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Debounce the search term with 300ms delay
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Reset to first page when debounced search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Generate search suggestions from user data
  const searchSuggestions = useMemo<SearchSuggestion[]>(() => {
    const suggestions: SearchSuggestion[] = [];
    
    // Add unique names
    const uniqueNames = [...new Set(users.map(user => user.name))];
    uniqueNames.forEach(name => {
      suggestions.push({
        id: `name-${name}`,
        text: name,
        type: 'name'
      });
    });

    // Add unique emails
    const uniqueEmails = [...new Set(users.map(user => user.email))];
    uniqueEmails.forEach(email => {
      suggestions.push({
        id: `email-${email}`,
        text: email,
        type: 'email'
      });
    });

    // Add unique roles
    const uniqueRoles = [...new Set(users.map(user => user.role))];
    uniqueRoles.forEach(role => {
      suggestions.push({
        id: `role-${role}`,
        text: role,
        type: 'role'
      });
    });

    return suggestions;
  }, [users]);

  // Filter users based on debounced search term, status, and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const getStatusBadge = (status: User['status']) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Note: Page reset will happen when debouncedSearchTerm changes
    // We don't reset immediately to avoid unnecessary re-renders
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all users in your system
          </p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account. Fill in the required information below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Name
                </label>
                <Input id="name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right">
                  Email
                </label>
                <Input id="email" type="email" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="role" className="text-right">
                  Role
                </label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center space-x-4">
        <SearchWithSuggestions
          value={searchTerm}
          onChange={handleSearch}
          suggestions={searchSuggestions}
          placeholder="Search users by name, email, or role..."
          className="flex-1 max-w-sm"
          maxSuggestions={8}
        />
        
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={handleRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Editor">Editor</SelectItem>
            <SelectItem value="User">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No users found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of{' '}
            {filteredUsers.length} users
          </div>
          <div className="flex justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;