import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LayoutDashboard, Users, Calendar, DollarSign, Map, Target, Settings } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CampaignNavigation = ({ activeTab, onTabChange }: NavigationProps) => {
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

  return (
    <Card className="p-2">
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
              onClick={() => onTabChange(tab.id)}
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
      </nav>
    </Card>
  );
};

export default CampaignNavigation;