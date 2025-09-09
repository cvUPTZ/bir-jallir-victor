import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

const Layout = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/'); // Redirect to login if not authenticated
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full" dir="rtl">
          <div className="w-64 bg-background border-r p-4 flex flex-col">
            <Skeleton className="h-6 w-3/4 mb-8" />
            <div className="flex flex-col space-y-4 flex-grow">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="mt-auto">
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
          <main className="flex-1 p-4 sm:p-6 bg-muted/40">
            <Skeleton className="h-full w-full" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full" dir="rtl">
        <AppSidebar />
        <main className="flex-1 p-4 sm:p-6 bg-muted/40 overflow-x-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
