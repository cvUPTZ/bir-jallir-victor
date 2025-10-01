import { useState } from "react";
import CampaignNavigation from "@/components/CampaignNavigation";
import CampaignOverview from "@/components/CampaignOverview";
import CampaignTimeline from "@/components/CampaignTimeline";
import CampaignTeam from "@/components/CampaignTeam";
import VoterTracking from "@/components/VoterTracking";
import CampaignBudget from "@/components/CampaignBudget";
import CampaignDistricts from "@/components/CampaignDistricts";
import CampaignStrategy from "@/components/CampaignStrategy";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [teamFilter, setTeamFilter] = useState<string>("all");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <CampaignOverview />;
      case "timeline":
        return <CampaignTimeline />;
      case "team":
        return <CampaignTeam teamFilter={teamFilter} />;
      case "voters":
        return <VoterTracking />;
      case "budget":
        return <CampaignBudget />;
      case "districts":
        return <CampaignDistricts />;
      case "strategy":
        return <CampaignStrategy />;
      default:
        return <CampaignOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <CampaignNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === "team" && (
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">تصفية حسب الفريق:</label>
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفرق</SelectItem>
                  <SelectItem value="قيادة مركزية">القيادة المركزية</SelectItem>
                  <SelectItem value="فرق إقليمية متخصصة">الفرق المتخصصة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        )}
        <div className="animate-in slide-in-from-right-5 duration-300">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
