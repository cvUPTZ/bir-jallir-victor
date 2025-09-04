import { useState } from "react";
import CampaignNavigation from "@/components/CampaignNavigation";
import CampaignOverview from "@/components/CampaignOverview";
import CampaignTimeline from "@/components/CampaignTimeline";
import CampaignTeam from "@/components/CampaignTeam";
import CampaignBudget from "@/components/CampaignBudget";
import CampaignDistricts from "@/components/CampaignDistricts";
import CampaignStrategy from "@/components/CampaignStrategy";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <CampaignOverview />;
      case "timeline":
        return <CampaignTimeline />;
      case "team":
        return <CampaignTeam />;
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
        <div className="animate-in slide-in-from-right-5 duration-300">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
