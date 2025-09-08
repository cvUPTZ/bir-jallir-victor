import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Users, Calendar, DollarSign, Map, Target, Vote, LogIn, LogOut, Menu, X } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CampaignNavigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const tabs = [
    {
      id: "overview",
      label: "نظرة عامة",
      icon: LayoutDashboard,
      description: "إحصائيات الحملة الرئيسية"
    },
    {
      id: "timeline", 
      label: "الجدول الزمني",
      icon: Calendar,
      description: "مراحل الحملة والأنشطة"
    },
    {
      id: "team",
      label: "الفريق",
      icon: Users,
      description: "المنسقين وأعضاء الفريق"
    },
    {
      id: "voters",
      label: "تتبع الناخبين",
      icon: Target,
      description: "قاعدة بيانات الناخبين والتحويل"
    },
    {
      id: "budget",
      label: "الميزانية",
      icon: DollarSign,
      description: "الأموال والمصروفات"
    },
    {
      id: "districts",
      label: "المناطق",
      icon: Map,
      description: "التقسيم الجغرافي"
    },
    {
      id: "strategy",
      label: "الاستراتيجية",
      icon: Target,
      description: "الخطط التكتيكية"
    }
  ];

  const handleAuthAction = async () => {
    if (user) {
      try {
        await signOut();
        navigate('/');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    } else {
      navigate('/auth');
    }
  };

  const handleCensusNavigation = () => {
    if (user) {
      navigate('/census');
    } else {
      navigate('/auth');
    }
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col gap-4">
        {/* Header with User Info and Mobile Menu Toggle */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">حملة انتخابية 2025</h1>
          <div className="flex items-center gap-2">
            {user && profile && (
              <div className="hidden md:flex items-center gap-2">
                <Badge variant="secondary">{profile.full_name}</Badge>
                <Badge variant="outline">{profile.role === 'representative' ? 'منسق' : profile.role}</Badge>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`${isOpen ? 'block' : 'hidden md:block'}`}>
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "flex items-center gap-2 h-auto p-3 text-sm font-medium transition-smooth",
                    isActive && "bg-primary text-primary-foreground shadow-campaign"
                  )}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <div className="text-right">
                    <div className="font-semibold">{tab.label}</div>
                    <div className={cn(
                      "text-xs opacity-80",
                      !isActive && "text-muted-foreground"
                    )}>
                      {tab.description}
                    </div>
                  </div>
                </Button>
              );
            })}

            {/* Census Button */}
            <Button
              variant="outline"
              className="flex items-center gap-2 h-auto p-3 text-sm font-medium border-primary/50"
              onClick={() => {
                handleCensusNavigation();
                setIsOpen(false);
              }}
            >
              <Vote className="h-4 w-4" />
              <div className="text-right">
                <div className="font-semibold">إحصاء الناخبين</div>
                <div className="text-xs opacity-80 text-muted-foreground">
                  تسجيل بطاقات الانتخاب
                </div>
              </div>
            </Button>

            {/* Auth Button */}
            <Button
              variant={user ? "destructive" : "default"}
              className="flex items-center gap-2 h-auto p-3 text-sm font-medium"
              onClick={() => {
                handleAuthAction();
                setIsOpen(false);
              }}
            >
              {user ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              <div className="text-right">
                <div className="font-semibold">
                  {user ? 'تسجيل خروج' : 'تسجيل دخول'}
                </div>
                <div className="text-xs opacity-80">
                  {user ? 'إنهاء الجلسة' : 'دخول النظام'}
                </div>
              </div>
            </Button>
          </nav>

          {/* Mobile User Info */}
          {user && profile && (
            <div className="md:hidden border-t pt-4 mt-4">
              <div className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-primary">{profile.full_name}</span>
                <span className="text-muted-foreground">
                  {profile.role === 'representative' ? 'منسق الحملة' : profile.role}
                </span>
                {profile.assigned_district && (
                  <span className="text-xs text-muted-foreground">
                    المنطقة: {profile.assigned_district}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CampaignNavigation;