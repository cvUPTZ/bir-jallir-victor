import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MapPin, Phone, Target, Star } from "lucide-react";

const CampaignTeam = () => {
  const leadership = [
    {
      name: "مدير الحملة العام",
      role: "القيادة المركزية",
      responsibilities: ["التخطيط الاستراتيجي", "القرارات العليا"],
      status: "نشط"
    },
    {
      name: "نائب مدير الحملة",
      role: "القيادة المركزية", 
      responsibilities: ["الإشراف التشغيلي", "المتابعة الميدانية"],
      status: "نشط"
    }
  ];

  const coordinators = [
    {
      name: "هشام",
      area: "حي الونشريس",
      team: 8,
      voters: 500,
      status: "قائد فريق",
      progress: 85,
      avatar: "/avatars/hisham.jpg"
    },
    {
      name: "منير غزالي", 
      area: "حي السلام",
      team: 4,
      voters: 150,
      status: "منسق",
      progress: 70,
      avatar: "/avatars/munir-g.jpg"
    },
    {
      name: "منير أزرارق",
      area: "الحي العسكري",
      team: 3,
      voters: 70,
      status: "منسق",
      progress: 60,
      avatar: "/avatars/munir-a.jpg"
    },
    {
      name: "زاكي",
      area: "حي محمد مختاري",
      team: 5,
      voters: 150,
      status: "منسق",
      progress: 75,
      avatar: "/avatars/zaki.jpg"
    },
    {
      name: "حمزة",
      area: "حي بن رحال",
      team: 2,
      voters: 60,
      status: "منسق",
      progress: 45,
      avatar: "/avatars/hamza.jpg"
    }
  ];

  const specializedTeams = [
    {
      name: "فريق الإعلام والاتصال",
      leader: "مُنسق الإعلام",
      members: 3,
      tasks: ["إدارة المحتوى", "العلاقات الإعلامية", "وسائل التواصل"],
      status: "نشط"
    },
    {
      name: "فريق اللوجستيات",
      leader: "مدير العمليات",
      members: 4,
      tasks: ["النقل", "التجهيزات", "الإمدادات"],
      status: "نشط"
    }
  ];

  const vacantAreas = [
    { name: "حي ألبيبي مصطفى", votes: 40, urgency: "عالية" },
    { name: "حي ألبيبي الأخير", votes: 50, urgency: "متوسطة" },
    { name: "حي ألاسبي", votes: 60, urgency: "متوسطة" }
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "campaign-success";
    if (progress >= 60) return "campaign-progress";
    return "danger";
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "قائد فريق": return "default";
      case "نشط": return "default";
      case "منسق": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Leadership */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            القيادة المركزية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leadership.map((leader, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{leader.name}</h3>
                  <Badge variant={getStatusVariant(leader.status)}>{leader.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{leader.role}</p>
                <div className="space-y-1">
                  {leader.responsibilities.map((resp, respIndex) => (
                    <span key={respIndex} className="inline-block text-xs bg-muted px-2 py-1 rounded-md ml-1">
                      {resp}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regional Coordinators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            المنسقون الإقليميون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {coordinators.map((coordinator, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={coordinator.avatar} alt={coordinator.name} />
                      <AvatarFallback>{coordinator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{coordinator.name}</h3>
                      <p className="text-sm text-muted-foreground">{coordinator.area}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(coordinator.status)}>
                    {coordinator.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-primary">{coordinator.team}</div>
                    <div className="text-xs text-muted-foreground">أعضاء الفريق</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-primary">{coordinator.voters}</div>
                    <div className="text-xs text-muted-foreground">ناخب مستهدف</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>التقدم</span>
                    <span>{coordinator.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-${getProgressColor(coordinator.progress)}`}
                      style={{ width: `${coordinator.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Specialized Teams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            الفرق المتخصصة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specializedTeams.map((team, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{team.name}</h3>
                  <Badge variant={getStatusVariant(team.status)}>{team.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  القائد: {team.leader} • {team.members} أعضاء
                </p>
                <div className="space-y-1">
                  {team.tasks.map((task, taskIndex) => (
                    <span key={taskIndex} className="inline-block text-xs bg-muted px-2 py-1 rounded-md ml-1">
                      {task}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vacant Areas - Need Coordinators */}
      <Card className="border-warning">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <Target className="h-5 w-5" />
            مناطق تحتاج منسقين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vacantAreas.map((area, index) => (
              <div key={index} className="border border-warning/20 rounded-lg p-4 bg-warning/5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{area.name}</h3>
                  <Badge variant={area.urgency === "عالية" ? "destructive" : "secondary"}>
                    {area.urgency}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  الأصوات المحتملة: <span className="font-semibold text-warning">{area.votes}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignTeam;