import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ChevronLeft, Mail, User as UserIcon, CalendarDays, ShieldCheck, Ban, CheckCircle } from 'lucide-react';
import { useGetUserByIdQuery, useUpdateUserMutation } from '@/store/api/usersApi';
import { toast } from 'sonner';

const UserDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useGetUserByIdQuery(id || '');
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'blocked': return 'bg-red-200 text-red-900';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'moderator': return 'bg-orange-100 text-orange-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-10 flex items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading user...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-10 text-center text-red-600">
            Failed to load user details.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/users')} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Users
        </Button>
        <Button
          variant={user.status === 'blocked' ? 'outline' : 'destructive'}
          onClick={async () => {
            try {
              const targetStatus = user.status === 'blocked' ? 'active' : 'blocked';
              await updateUser({ id: user.id, status: targetStatus }).unwrap();
              toast.success(user.status === 'blocked' ? 'User unblocked' : 'User blocked', {
                description: `${user.name} has been ${user.status === 'blocked' ? 'unblocked' : 'blocked'}.`
              });
            } catch (err) {
              console.error('Toggle block failed:', err);
              toast.error('Failed to update user');
            }
          }}
          disabled={isUpdating}
          className={user.status === 'blocked' ? 'text-green-700' : ''}
          title={user.status === 'blocked' ? 'Unblock user' : 'Block user'}
        >
          {user.status === 'blocked' ? (
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Unblock</span>
          ) : (
            <span className="flex items-center gap-2"><Ban className="h-4 w-4" /> Block</span>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-2xl font-bold text-gray-900">{user.name}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
            <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <UserIcon className="h-4 w-4" />
                <span>Full Name</span>
              </div>
              <div className="text-gray-900 font-medium">{user.name}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </div>
              <div className="text-gray-900 font-medium">{user.email}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <ShieldCheck className="h-4 w-4" />
                <span>Role</span>
              </div>
              <div className="text-gray-900 font-medium capitalize">{user.role}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <CalendarDays className="h-4 w-4" />
                <span>Join Date</span>
              </div>
              <div className="text-gray-900 font-medium">{user.joinDate}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <CalendarDays className="h-4 w-4" />
                <span>Last Login</span>
              </div>
              <div className="text-gray-900 font-medium">{user.lastLogin}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetails;