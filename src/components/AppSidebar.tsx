import { Home, BarChart, User, Shield, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const navigationItems = [
  { title: 'لوحة التحكم', url: '/home', icon: BarChart },
  { title: 'الإحصاء', url: '/census', icon: Home },
  { title: 'الملف الشخصي', url: '/profile', icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;

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

  return (
    <Sidebar
      className={`transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}
      collapsible="icon"
    >
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <h2 className="text-xl font-bold text-primary">القائمة الرئيسية</h2>
        )}
        <SidebarTrigger className="ml-auto" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            التنقل الرئيسي
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-smooth hover:bg-muted/80 ${
                        isActive(item.url)
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {profile?.role === 'admin' && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      to="/admin"
                      className={`flex items-center gap-3 p-3 rounded-lg transition-smooth hover:bg-muted/80 ${
                        isActive('/admin')
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <Shield className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">لوحة الإدارة</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            className={`w-full justify-start gap-3 hover:bg-destructive/10 hover:text-destructive ${
              isCollapsed ? 'px-2' : ''
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>تسجيل الخروج</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}