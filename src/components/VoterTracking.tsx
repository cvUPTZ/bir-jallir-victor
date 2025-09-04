import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Users, Phone, MapPin, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";

const VoterTracking = () => {
  const pipelineStages = [
    {
      stage: "لم يتم التواصل معه",
      probability: 10,
      count: 850,
      color: "muted"
    },
    {
      stage: "تم التواصل",
      probability: 50,
      count: 420,
      color: "campaign-progress"
    },
    {
      stage: "قبول",
      probability: 100,
      count: 680,
      color: "campaign-success"
    },
    {
      stage: "رفض",
      probability: 0,
      count: 150,
      color: "danger"
    }
  ];

  const voterDatabase = [
    {
      square: "المربع السكني 01",
      buildings: ["A6", "A12", "D3", "A3", "D5", "B8"],
      withCards: 145,
      withoutCards: 23,
      potential: 168,
      contacted: 120,
      accepted: 95,
      rejected: 15,
      manager: "أحمد محمد",
      phone: "0555-123-456",
      status: "مكتمل جزئياً"
    },
    {
      square: "المربع السكني 02", 
      buildings: ["A7", "A11", "A13", "A2", "D6", "C6"],
      withCards: 132,
      withoutCards: 18,
      potential: 150,
      contacted: 85,
      accepted: 70,
      rejected: 8,
      manager: "فاطمة أحمد",
      phone: "0555-234-567",
      status: "قيد العمل"
    },
    {
      square: "المربع السكني 03",
      buildings: ["B6", "A10", "B5", "A1", "A25", "A24"],
      withCards: 98,
      withoutCards: 12,
      potential: 110,
      contacted: 45,
      accepted: 35,
      rejected: 5,
      manager: "محمد علي",
      phone: "0555-345-678",
      status: "بداية"
    },
    {
      square: "المربع السكني 11",
      buildings: ["E5", "D9"],
      withCards: 89,
      withoutCards: 15,
      potential: 104,
      contacted: 78,
      accepted: 65,
      rejected: 8,
      manager: "خديجة بن سالم",
      phone: "0555-456-789",
      status: "متقدم"
    }
  ];

  const coordinatorProgress = [
    { name: "هشام", area: "حي الونشريس", target: 500, contacted: 420, accepted: 350, rejected: 45, progress: 84 },
    { name: "منير غزالي", area: "حي السلام", target: 150, contacted: 135, accepted: 95, rejected: 25, progress: 90 },
    { name: "منير أزرارق", area: "الحي العسكري", target: 70, contacted: 55, accepted: 38, rejected: 12, progress: 79 },
    { name: "موسى", area: "حي عائلة عيسات", target: 50, contacted: 30, accepted: 22, rejected: 5, progress: 60 },
    { name: "زاكي", area: "حي محمد مختاري", target: 150, contacted: 110, accepted: 85, rejected: 15, progress: 73 }
  ];

  const totalPotential = voterDatabase.reduce((sum, square) => sum + square.potential, 0);
  const totalContacted = voterDatabase.reduce((sum, square) => sum + square.contacted, 0);
  const totalAccepted = voterDatabase.reduce((sum, square) => sum + square.accepted, 0);
  const conversionRate = Math.round((totalAccepted / totalContacted) * 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مكتمل": return "campaign-success";
      case "متقدم": return "campaign-success"; 
      case "مكتمل جزئياً": return "campaign-progress";
      case "قيد العمل": return "warning";
      case "بداية": return "danger";
      default: return "muted";
    }
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            قمع تحويل الناخبين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {pipelineStages.map((stage, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className={`text-2xl font-bold text-${stage.color}`}>{stage.count}</div>
                <div className="text-sm text-muted-foreground mb-2">{stage.stage}</div>
                <div className="text-xs">احتمالية: {stage.probability}%</div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary">{totalPotential}</div>
              <div className="text-sm text-muted-foreground">إجمالي الناخبين المحتملين</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-campaign-progress">{totalContacted}</div>
              <div className="text-sm text-muted-foreground">تم التواصل معهم</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-campaign-success">{conversionRate}%</div>
              <div className="text-sm text-muted-foreground">معدل التحويل</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coordinator Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            أداء المنسقين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coordinatorProgress.map((coord, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{coord.name}</h3>
                    <p className="text-sm text-muted-foreground">{coord.area}</p>
                  </div>
                  <Badge variant={coord.progress >= 80 ? "default" : coord.progress >= 60 ? "secondary" : "outline"}>
                    {coord.progress}%
                  </Badge>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mb-3 text-center">
                  <div className="p-2 bg-muted rounded">
                    <div className="font-bold text-primary">{coord.target}</div>
                    <div className="text-xs text-muted-foreground">هدف</div>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <div className="font-bold text-campaign-progress">{coord.contacted}</div>
                    <div className="text-xs text-muted-foreground">تواصل</div>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <div className="font-bold text-campaign-success">{coord.accepted}</div>
                    <div className="text-xs text-muted-foreground">قبول</div>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <div className="font-bold text-danger">{coord.rejected}</div>
                    <div className="text-xs text-muted-foreground">رفض</div>
                  </div>
                </div>
                
                <Progress value={coord.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Residential Squares Database */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            قاعدة بيانات المربعات السكنية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {voterDatabase.map((square, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{square.square}</h3>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {square.buildings.map((building, buildingIndex) => (
                        <Badge key={buildingIndex} variant="outline" className="text-xs">
                          {building}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge variant={getStatusColor(square.status) as any}>
                    {square.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-primary">{square.potential}</div>
                    <div className="text-xs text-muted-foreground">ناخب محتمل</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-campaign-success">{square.withCards}</div>
                    <div className="text-xs text-muted-foreground">حائز بطاقة</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-warning">{square.withoutCards}</div>
                    <div className="text-xs text-muted-foreground">بدون بطاقة</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-campaign-progress">{square.contacted}</div>
                    <div className="text-xs text-muted-foreground">تم التواصل</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-campaign-success">{square.accepted}</div>
                    <div className="text-xs text-muted-foreground">مؤيد مؤكد</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm">مسؤول: {square.manager}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm">{square.phone}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>معدل التحويل</span>
                    <span>{Math.round((square.accepted / square.contacted) * 100)}%</span>
                  </div>
                  <Progress value={Math.round((square.accepted / square.contacted) * 100)} className="h-2" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 border border-warning/20 bg-warning/5 rounded-lg">
            <h3 className="font-semibold text-warning mb-2">المربعات المتبقية للإحصاء</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Array.from({length: 8}, (_, i) => i + 5).map(num => (
                <div key={num} className="text-center p-2 border border-warning/30 rounded text-sm">
                  المربع السكني {num.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoterTracking;