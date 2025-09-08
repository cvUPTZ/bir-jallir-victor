import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useProfile } from '@/hooks/useProfile';

const AdminRoute = () => {
  const { profile, loading, error } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return; // Wait for profile check to complete

    if (error || profile?.role !== 'admin') {
      toast({
        variant: 'destructive',
        title: 'وصول مرفوض',
        description: 'ليس لديك صلاحية الوصول لهذه الصفحة.',
      });
      navigate('/census'); // Redirect if not an admin or if there's an error
    }
  }, [profile, loading, error, navigate, toast]);

  if (loading) {
    return <div>جاري التحقق من الصلاحيات...</div>; // Or a proper spinner component
  }

  // Render children only if the user is an admin
  return profile?.role === 'admin' ? <Outlet /> : null;
};

export default AdminRoute;
