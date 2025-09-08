import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Users, Megaphone, Shield, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";

const CampaignStrategy = () => {
  const strategies = [
    {
      title: "استراتيجية التواصل المباشر",
      icon: Users,
      priority: "عالية",
      progress: 75,
      status: "نشطة",
      tactics: [
        {
          name: "الزيارات المنزلية",
          target: "10 بيوت/يوم/منسق",
          timing: "المساء (6-9 مساءً) والعطل",
          message: "حلول محلية لمشاكل محلية",
          progress: 80
        },
        {
          name: "الاجتماعات المجتمعية",
          target: "اجتماعين/أسبوع/منطقة",
          timing: "المساجد، النوادي، البيوت الكبيرة",
          message: "الاستماع للمشاكل وتقديم الحلول",
          progress: 70
        }
      ]
    },
    {
      title: "استراتيجية الإعلام والتسويق",
      icon: Megaphone,
      priority: "عالية",
      progress: 65,
      status: "نشطة",
      tactics: [
        {
          name: "الإعلام التقليدي",
          target: "راديو محلي، صحف محلية",
          timing: "إعلانات يومية، مقالات أسبوعية",
          message: "ملصقات ولافتات في الأماكن الحيوية",
          progress: 60
        },
        {
          name: "الإعلام الرقمي",
          target: "Facebook، WhatsApp، SMS",
          timing: "منشورات يومية + فيديوهات",
          message: "مجموعات للمناطق، رسائل أسبوعية",
          progress: 70
        }
      ]
    },
    {
      title: "استراتيجية التعبئة المجتمعية",
      icon: Target,
      priority: "متوسطة",
      progress: 55,
      status: "تطوير",
      tactics: [
        {
          name: "الشراكات المحلية",
          target: "جمعيات الأحياء، النقابات",
          timing: "اتفاقيات شراكة",
          message: "الجمعيات الثقافية والرياضية",
          progress: 50
        },
        {
          name: "الفعاليات المجتمعية",
          target: "معارض خدمية، ندوات",
          timing: "أنشطة للشباب والنساء",
          message: "خدمات مجانية للمواطنين",
          progress: 60
        }
      ]
    }
  ];

  const keyMetrics = [
    {
      name: "معدل التحويل",
      value: "70%",
      description: "من مترددين إلى مؤيدين",
      trend: "إيجابي",
      target: "75%"
    },
    {
      name: "الوصول اليومي",
      value: "80",
      description: "ناخب يومياً",
      trend: "إيجابي",
      target: "100"
    },
    {
      name: "التفاعل الرقمي",
      value: "85%",
      description: "معدل التفاعل",
      trend: "مستقر",
      target: "90%"
    },
    {
      name: "رضا المؤيدين",
      value: "90%",
      description: "مستوى الرضا العام",
      trend: "إيجابي",
      target: "95%"
    }
  ];

  const riskManagement = [
    {
      risk: "حملات مضادة، إشاعات",
      category: "مخاطر سياسية",
      level: "متوسط",
      solution: "فريق إعلامي سريع الاستجابة، شفافية كاملة",
      status: "مراقب"
    },
    {
      risk: "نقص المتطوعين، مشاكل لوجستية",
      category: "مخاطر تنظيمية", 
      level: "منخفض",
      solution: "قاعدة احتياطية من المتطوعين، خطط بديلة",
      status: "مُدار"
    },
    {
      risk: "تجاوز الميزانية، انقطاع التمويل",
      category: "مخاطر مالية",
      level: "منخفض",
      solution: "مراقبة يومية للإنفاق، صندوق طوارئ",
      status: "مُدار"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "عالية": return "destructive";
      case "متوسطة": return "secondary";
      case "منخفضة": return "outline";
      default: return "outline";
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "عالي": return "danger";
      case "متوسط": return "warning";
      case "منخفض": return "campaign-success";
      default: return "muted";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "إيجابي": return <TrendingUp className="h-4 w-4 text-campaign-success" />;
      case "سلبي": return <TrendingUp className="h-4 w-4 text-danger rotate-180" />;
      default: return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Strategy Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {strategies.map((strategy, index) => {
          const Icon = strategy.icon;
          return (
            <Card key={index} className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5 text-primary" />
                  {strategy.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityColor(strategy.priority)}>
                    {strategy.priority}
                  </Badge>
                  <Badge variant={strategy.status === "نشطة" ? "default" : "secondary"}>
                    {strategy.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>التقدم العام</span>
                    <span className="font-semibold">{strategy.progress}%</span>
                  </div>
                  <Progress value={strategy.progress} className="h-2" />
                </div>

                <div className="space-y-3">
                  {strategy.tactics.map((tactic, tacticIndex) => (
                    <div key={tacticIndex} className="p-3 border rounded-lg space-y-2">
                      <div className="font-medium text-sm">{tactic.name}</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div><strong>الهدف:</strong> {tactic.target}</div>
                        <div><strong>التوقيت:</strong> {tactic.timing}</div>
                        <div><strong>الرسالة:</strong> {tactic.message}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>التقدم</span>
                          <span>{tactic.progress}%</span>
                        </div>
                        <Progress value={tactic.progress} className="h-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Key Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            مؤشرات الأداء الرئيسية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {keyMetrics.map((metric, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{metric.name}</h3>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">{metric.description}</div>
                </div>
                <div className="text-center">
                  <span className="text-xs text-muted-foreground">
                    الهدف: <span className="font-semibold text-campaign-target">{metric.target}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            إدارة المخاطر والأزمات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskManagement.map((risk, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{risk.category}</h3>
                    <p className="text-sm text-muted-foreground">{risk.risk}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant={getRiskLevelColor(risk.level)}>
                      {risk.level}
                    </Badge>
                    <Badge variant={risk.status === "مُدار" ? "default" : "secondary"} className="text-xs">
                      {risk.status}
                    </Badge>
                  </div>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <div className="text-sm">
                    <strong className="text-campaign-success">الحل:</strong> {risk.solution}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Response Plan */}
      <Card className="border-warning">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            خطة الاستجابة السريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">فريق الأزمات</h3>
              <p className="text-xs text-muted-foreground">3 أشخاص متاحين 24/7</p>
            </div>
            <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">بروتوكول الاتصال</h3>
              <p className="text-xs text-muted-foreground">تسلسل واضح للإبلاغ</p>
            </div>
            <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">قنوات الطوارئ</h3>
              <p className="text-xs text-muted-foreground">WhatsApp مباشر مع القيادة</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignStrategy;