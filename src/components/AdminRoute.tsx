import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

const AdminRoute = () => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) {
      return; // Wait for auth check to complete
    }

    if (profile?.role !== 'admin') {
      toast({
        variant: 'destructive',
        title: 'وصول مرفوض',
        description: 'ليس لديك صلاحية الوصول لهذه الصفحة.',
      });
      navigate('/census'); // Redirect if not an admin
    }
  }, [profile, loading, navigate, toast]);

  if (loading) {
    return <div>جاري التحقق من الصلاحيات...</div>; // Or a proper spinner component
  }

  return profile?.role === 'admin' ? <Outlet /> : null;
};

export default AdminRoute;
