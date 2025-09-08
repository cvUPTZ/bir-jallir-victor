import { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, LogOut, User, BarChart, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

const Layout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/'); // Redirect to login if not authenticated
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "تم تسجيل الخروج بنجاح",
      });
      navigate('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الخروج",
        description: message,
      });
    }
  };

  if (loading || !user) {
    // Display a skeleton loader while auth state is being determined
    return (
      <div className="flex min-h-screen" dir="rtl">
        <aside className="w-64 bg-background border-r p-4 flex flex-col">
          <Skeleton className="h-6 w-3/4 mb-8" />
          <div className="flex flex-col space-y-4 flex-grow">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="mt-auto">
            <Skeleton className="h-8 w-full" />
          </div>
        </aside>
        <main className="flex-1 p-6 bg-muted/40">
          <Skeleton className="h-full w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" dir="rtl">
      <aside className="w-64 bg-background border-r p-4 flex flex-col">
        <h2 className="text-xl font-bold text-primary mb-8">القائمة الرئيسية</h2>
        <nav className="flex flex-col space-y-2 flex-grow">
          <Link to="/home" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
            <BarChart className="w-5 h-5" />
            لوحة التحكم
          </Link>
          <Link to="/census" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
            <Home className="w-5 h-5" />
            الإحصاء
          </Link>
          <Link to="/profile" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
            <User className="w-5 h-5" />
            الملف الشخصي
          </Link>
          {profile?.role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted text-primary">
              <Shield className="w-5 h-5" />
              لوحة الإدارة
            </Link>
          )}
        </nav>
        <div className="mt-auto">
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-3">
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6 bg-muted/40">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
