import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Mail, Lock, User, GraduationCap, Users, Shield } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../utils/api';
import { toast } from 'react-toastify';
import { UserRole } from '../../types';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
  studentId: z.string().optional(),
  institution: z.string().optional(),
  subject: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'STUDENT'
    }
  });

  const watchRole = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const response = await api.post<{
        token: string;
        user: any;
      }>('/auth/register', {
        ...data,
        role: selectedRole
      });

      login(response.token, '', response.user);

      // Redirect to role-specific dashboard
      const defaultPath = `/${response.user.role.toLowerCase()}/dashboard`;
      navigate(defaultPath, { replace: true });

      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      value: 'STUDENT' as UserRole,
      label: 'Student',
      icon: GraduationCap,
      description: 'Submit assignments and track progress'
    },
    {
      value: 'TEACHER' as UserRole,
      label: 'Teacher',
      icon: Users,
      description: 'Create assignments and grade submissions'
    },
    {
      value: 'ADMIN' as UserRole,
      label: 'Administrator',
      icon: Shield,
      description: 'Manage users and system settings'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <BookOpen className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select your role
            </label>
            <div className="grid grid-cols-1 gap-3">
              {roles.map((role) => (
                <div key={role.value}>
                  <input
                    {...register('role')}
                    type="radio"
                    id={role.value}
                    value={role.value}
                    className="sr-only"
                    onChange={() => setSelectedRole(role.value)}
                  />
                  <label
                    htmlFor={role.value}
                    className={`
                      relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none
                      ${selectedRole === role.value 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <role.icon className="h-5 w-5 text-gray-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {role.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {role.description}
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('firstName')}
              placeholder="First name"
              error={errors.firstName?.message}
            />
            <Input
              {...register('lastName')}
              placeholder="Last name"
              error={errors.lastName?.message}
            />
          </div>

          <Input
            {...register('email')}
            type="email"
            placeholder="Email address"
            error={errors.email?.message}
          />

          <Input
            {...register('password')}
            type="password"
            placeholder="Password"
            error={errors.password?.message}
          />

          <Input
            {...register('confirmPassword')}
            type="password"
            placeholder="Confirm password"
            error={errors.confirmPassword?.message}
          />

          {/* Conditional fields based on role */}
          {selectedRole === 'STUDENT' && (
            <Input
              {...register('studentId')}
              placeholder="Student ID (optional)"
              error={errors.studentId?.message}
            />
          )}

          {(selectedRole === 'TEACHER' || selectedRole === 'ADMIN') && (
            <>
              <Input
                {...register('institution')}
                placeholder="Institution name"
                error={errors.institution?.message}
              />
              {selectedRole === 'TEACHER' && (
                <Input
                  {...register('subject')}
                  placeholder="Subject area"
                  error={errors.subject?.message}
                />
              )}
            </>
          )}

          <div className="flex items-center">
            <input
              {...register('acceptTerms')}
              id="accept-terms"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
          )}

          <Button
            type="submit"
            fullWidth
            loading={loading}
          >
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
};