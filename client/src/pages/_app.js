import '@/globals.css';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';

const publicRoutes = ['/login', '/register', '/'];

function MyApp({ Component, pageProps }) {
  const { initializeAuth, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!publicRoutes.includes(router.pathname) && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </>
  );
}

export default MyApp;
