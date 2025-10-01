import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useLoginMutation } from '@/store/api/authApi';

// Enhanced schema validation
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid admin email address')
    .toLowerCase()
    .trim()
    .refine(
      (email) => email.includes('@admin.') || email.includes('@company.') || email.endsWith('.admin'),
      'Please use a valid admin email domain'
    ),
  password: z
    .string()
    .min(8, 'Admin password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Custom hook for password visibility
const usePasswordVisibility = () => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  return { showPassword, togglePasswordVisibility };
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();
  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange', // Real-time validation
  });

  const handleSubmit = async (data: LoginFormData) => {
    try {
      const result = await login({
        email: data.email,
        password: data.password,
      }).unwrap();

      if (result.success) {
        // Navigate to dashboard on successful login
        navigate('/dashboard');
      }
    } catch (error: any) {
      // Error is handled by RTK Query and displayed in the UI
      console.error('Login failed:', error);
    }
  };

  const handleError = (errors: any) => {
    // Handle form validation errors appropriately
    console.error('Form validation errors:', errors);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header Section */}
        <header className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h2>
          <p className="text-gray-600">
            Sign in to access the admin panel
          </p>
        </header>

        {/* Login Card */}
        <Card className="shadow-lg border border-gray-200">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center text-gray-800">
              Admin Login
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Display API Error */}
            {error && (
              <aside className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {'data' in error ? (error.data as any)?.message || 'Login failed' : 'Network error occurred'}
              </aside>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit, handleError)} className="space-y-5">
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Admin Email
                      </FormLabel>
                      <FormControl>
                        <fieldset className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                          <Input
                            type="email"
                            placeholder="admin@company.com"
                            className="pl-10 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                            {...field}
                          />
                        </fieldset>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <nav className="flex items-center justify-between">
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Admin Password
                        </FormLabel>
                      </nav>
                      <FormControl>
                        <fieldset className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter admin password"
                            className="pl-10 pr-10 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </fieldset>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center space-x-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Login;