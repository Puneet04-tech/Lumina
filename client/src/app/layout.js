'use client';

import '@/globals.css';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Toaster } from 'react-hot-toast';
import { useRouter, usePathname } from 'next/navigation';

const publicRoutes = ['/login', '/register', '/'];

export default function RootLayout({ children }) {
  const { initializeAuth, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!publicRoutes.includes(pathname) && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, pathname, router]);

  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
