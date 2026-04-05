'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function ProtectedRoute({ children, requiredRole = null }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      toast.error('Access Denied: Insufficient permissions');
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, requiredRole, router]);

  if (!isAuthenticated) return null;
  if (requiredRole && user?.role !== requiredRole) return null;

  return children;
}

export function RoleBasedContent({ children, allowedRoles = [] }) {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
}
