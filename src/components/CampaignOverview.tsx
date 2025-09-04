import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Users, MapPin, Calendar, TrendingUp, Award } from "lucide-react";

const CampaignOverview = () => {
  const stats = [
    {
      title: "إجمالي الأصوات المستهدفة",
      value: "2,000+",
      current: 1300,
      target: 2000,
      icon: Target,
      color: "campaign-target"
    },
    {
      title: "المناطق المغطاة",
      value: "15/20",
      current: 15,
      target: 20,
      icon: MapPin,
      color: "campaign-progress"
    },
    {
      title: "أعضاء الفريق",
      value: "8+",
      current: 8,
      target: 10,
      icon: Users,
      color: "campaign-success"
    },
    {
      title: "الأيام المتبقية",
      value: "75",
      current: 15,
      target: 90,
      icon: Calendar,
      color: "primary"
    }
  ];

  const priorities = [
    { name: "حي الونشريس", votes: 500, priority: "عالية", color: "danger" },
    { name: "حي محمد مختاري", votes: 150, priority: "عالية", color: "danger" },
    { name: "حي عدل قريشي", votes: 150, priority: "عالية", color: "danger" },
    { name: "حي السلام", votes: 150, priority: "متوسطة", color: "warning" },
    { name: "الحي العسكري", votes: 70, priority: "متوسطة", color: "warning" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary p-8 text-primary-foreground">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Award className="h-8 w-8" />
            <h1 className="text-3xl font-bold">خطة الحملة الانتخابية الشاملة</h1>
          </div>
          <p className="text-lg opacity-90 mb-6">
            الخطة الاستراتيجية للفوز في الانتخابات المحلية - بئر الجير، وهران
          </p>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm font-semibold">
              الهدف: 65% من الأصوات
            </Badge>
            <Badge variant="secondary" className="text-sm font-semibold">
              المدة: 90 يوم
            </Badge>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent to-white/10" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const percentage = Math.round((stat.current / stat.target) * 100);
          
          return (
            <Card key={index} className="relative overflow-hidden transition-smooth hover:shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 text-${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{stat.value}</div>
                <Progress value={percentage} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {percentage}% من الهدف
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Priority Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            المناطق ذات الأولوية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {priorities.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge variant={area.color === "danger" ? "destructive" : "secondary"}>
                    {area.priority}
                  </Badge>
                  <span className="font-medium">{area.name}</span>
                </div>
                <div className="text-left">
                  <span className="text-sm text-muted-foreground">الأصوات المستهدفة</span>
                  <div className="font-bold text-lg">{area.votes}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignOverview;