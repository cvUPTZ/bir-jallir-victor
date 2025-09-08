import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Home, LogOut, User, BarChart, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useProfile } from '@/hooks/useProfile';

const Layout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useProfile();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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

  return (
    <div className="flex min-h-screen" dir="rtl">
      <aside className="w-64 bg-background border-r p-4 flex flex-col">
        <h2 className="text-xl font-bold text-primary mb-8">القائمة الرئيسية</h2>
        <nav className="flex flex-col space-y-2 flex-grow">
          <Link to="/dashboard" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
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
              لوحة التحكم
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
