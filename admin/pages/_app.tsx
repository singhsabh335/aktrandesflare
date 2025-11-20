import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import '../styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Protect admin routes
  useEffect(() => {
    const isAdminRoute = router.pathname.startsWith('/admin');
    const isLoginPage = router.pathname === '/login';
    
    if (isAdminRoute && !isLoginPage) {
      if (!user || user.role !== 'admin') {
        router.push('/login');
      }
    }
  }, [user, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

