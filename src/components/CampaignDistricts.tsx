import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Users, Target, TrendingUp, AlertCircle } from "lucide-react";

const CampaignDistricts = () => {
  const districts = [
    {
      name: "حي الونشريس",
      coordinator: "هشام",
      votes: 500,
      priority: "عالية",
      progress: 85,
      status: "متقدم",
      population: 1200,
      coverage: 95,
      activities: ["زيارات منزلية", "اجتماعات مجتمعية", "توزيع المواد"]
    },
    {
      name: "حي محمد مختاري", 
      coordinator: "زاكي",
      votes: 150,
      priority: "عالية",
      progress: 75,
      status: "نشط",
      population: 400,
      coverage: 80,
      activities: ["زيارات منزلية", "توزيع المواد"]
    },
    {
      name: "حي عدل قريشي",
      coordinator: "مُنسق الإعلام",
      votes: 150,
      priority: "عالية",
      progress: 70,
      status: "نشط",
      population: 350,
      coverage: 85,
      activities: ["حملة إعلامية", "اجتماعات"]
    },
    {
      name: "حي السلام",
      coordinator: "منير غزالي",
      votes: 150,
      priority: "متوسطة",
      progress: 60,
      status: "نشط",
      population: 380,
      coverage: 70,
      activities: ["تطوير العلاقات", "اجتماعات"]
    },
    {
      name: "الحي العسكري",
      coordinator: "منير أزرارق", 
      votes: 70,
      priority: "متوسطة",
      progress: 55,
      status: "نشط",
      population: 180,
      coverage: 65,
      activities: ["قضايا أمنية", "زيارات"]
    },
    {
      name: "حي بن رحال",
      coordinator: "حمزة",
      votes: 60,
      priority: "متوسطة",
      progress: 45,
      status: "يحتاج تركيز",
      population: 160,
      coverage: 50,
      activities: ["بناء الثقة"]
    }
  ];

  const developmentAreas = [
    { name: "حي ألبيبي مصطفى", votes: 40, population: 120, status: "يحتاج منسق" },
    { name: "حي ألبيبي الأخير", votes: 50, population: 140, status: "يحتاج منسق" },
    { name: "حي ألاسبي", votes: 60, population: 180, status: "يحتاج منسق" }
  ];

  const totalVotes = districts.reduce((sum, district) => sum + district.votes, 0);
  const totalCoverage = Math.round(districts.reduce((sum, district) => sum + district.coverage, 0) / districts.length);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "عالية": return "destructive";
      case "متوسطة": return "secondary";
      case "منخفضة": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "متقدم": return "campaign-success";
      case "نشط": return "campaign-progress";
      case "يحتاج تركيز": return "warning";
      case "يحتاج منسق": return "danger";
      default: return "muted";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "campaign-success";
    if (progress >= 60) return "campaign-progress"; 
    return "warning";
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المناطق</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20</div>
            <p className="text-xs text-muted-foreground">منطقة انتخابية</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأصوات المستهدفة</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalVotes}</div>
            <p className="text-xs text-muted-foreground">صوت مؤكد</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط التغطية</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-campaign-success">{totalCoverage}%</div>
            <p className="text-xs text-muted-foreground">من الناخبين</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المناطق النشطة</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-campaign-progress">{districts.length}</div>
            <p className="text-xs text-muted-foreground">من أصل 20</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Districts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            المناطق النشطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {districts.map((district, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{district.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      المنسق: {district.coordinator}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant={getPriorityColor(district.priority)}>
                      {district.priority}
                    </Badge>
                    <Badge variant={getStatusColor(district.status) as any}>
                      {district.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-2 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-primary">{district.votes}</div>
                    <div className="text-xs text-muted-foreground">أصوات مستهدفة</div>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-primary">{district.population}</div>
                    <div className="text-xs text-muted-foreground">إجمالي السكان</div>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-primary">{district.coverage}%</div>
                    <div className="text-xs text-muted-foreground">نسبة التغطية</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>تقدم الحملة</span>
                    <span className="font-semibold">{district.progress}%</span>
                  </div>
                  <Progress value={district.progress} className="h-2" />
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">الأنشطة الجارية:</span>
                  <div className="flex flex-wrap gap-1">
                    {district.activities.map((activity, activityIndex) => (
                      <span key={activityIndex} className="text-xs bg-muted px-2 py-1 rounded-md">
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Development Areas */}
      <Card className="border-warning">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertCircle className="h-5 w-5" />
            المناطق التطويرية - تحتاج منسقين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {developmentAreas.map((area, index) => (
              <div key={index} className="border border-warning/20 rounded-lg p-4 bg-warning/5">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold">{area.name}</h3>
                    <Badge variant="outline" className="mt-1 text-xs border-warning text-warning">
                      {area.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-warning/10 rounded">
                      <div className="font-bold text-warning">{area.votes}</div>
                      <div className="text-xs text-muted-foreground">أصوات محتملة</div>
                    </div>
                    <div className="p-2 bg-warning/10 rounded">
                      <div className="font-bold text-warning">{area.population}</div>
                      <div className="text-xs text-muted-foreground">سكان</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    فرصة ذهبية لكسب أصوات إضافية
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignDistricts;