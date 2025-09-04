import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle, Users, Target, Megaphone, Calendar } from "lucide-react";

const CampaignTimeline = () => {
  const phases = [
    {
      title: "المرحلة الأولى: التأسيس والتخطيط",
      duration: "30 يوم",
      status: "مكتملة",
      progress: 100,
      color: "success",
      icon: CheckCircle2,
      tasks: [
        { name: "تعيين منسقين للمناطق", status: "مكتمل", priority: "عالية" },
        { name: "إعداد مقرات الحملة الفرعية", status: "مكتمل", priority: "عالية" },
        { name: "تجهيز قاعدة بيانات الناخبين", status: "مكتمل", priority: "متوسطة" },
        { name: "تدريب المنسقين والمتطوعين", status: "مكتمل", priority: "عالية" }
      ]
    },
    {
      title: "المرحلة الثانية: الزخم والتواصل",
      duration: "45 يوم",
      status: "جارية",
      progress: 65,
      color: "progress",
      icon: Clock,
      tasks: [
        { name: "زيارات منزلية منظمة", status: "جاري", priority: "عالية" },
        { name: "اجتماعات مجتمعية أسبوعية", status: "جاري", priority: "متوسطة" },
        { name: "توزيع المواد الدعائية", status: "مكتمل", priority: "عالية" },
        { name: "حملات إعلامية مركزة", status: "قريباً", priority: "عالية" }
      ]
    },
    {
      title: "المرحلة الثالثة: الحسم والتعبئة",
      duration: "15 يوم",
      status: "قادمة",
      progress: 0,
      color: "target",
      icon: AlertCircle,
      tasks: [
        { name: "تعبئة المؤيدين المؤكدين", status: "قريباً", priority: "عالية" },
        { name: "معالجة القضايا المعلقة", status: "قريباً", priority: "متوسطة" },
        { name: "تأمين وسائل النقل", status: "قريباً", priority: "عالية" },
        { name: "تجهيز مراقبي الصناديق", status: "قريباً", priority: "عالية" }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مكتمل": return "campaign-success";
      case "جاري": return "campaign-progress";
      case "قريباً": return "primary";
      default: return "muted";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "عالية": return "destructive";
      case "متوسطة": return "secondary";
      default: return "outline";
    }
  };

  const weeklyActivities = [
    {
      week: "الأسبوع الحالي",
      activities: [
        { day: "السبت", activity: "اجتماع فريق حي الونشريس", type: "team" },
        { day: "الأحد", activity: "زيارات منزلية - حي السلام", type: "field" },
        { day: "الاثنين", activity: "اجتماع مجتمعي - المسجد الكبير", type: "community" },
        { day: "الثلاثاء", activity: "حملة إعلامية - الراديو المحلي", type: "media" },
        { day: "الأربعاء", activity: "تدريب المتطوعين الجدد", type: "training" }
      ]
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "team": return Users;
      case "field": return Target;
      case "community": return Users;
      case "media": return Megaphone;
      case "training": return Users;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            الجدول الزمني للحملة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              return (
                <div key={index} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-6 w-6 text-${phase.color === "success" ? "campaign-success" : phase.color === "progress" ? "campaign-progress" : "primary"}`} />
                      <div>
                        <h3 className="font-semibold text-lg">{phase.title}</h3>
                        <p className="text-sm text-muted-foreground">{phase.duration}</p>
                      </div>
                    </div>
                    <Badge variant={phase.status === "مكتملة" ? "default" : phase.status === "جارية" ? "secondary" : "outline"}>
                      {phase.status}
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>التقدم</span>
                      <span>{phase.progress}%</span>
                    </div>
                    <Progress value={phase.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {phase.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="flex items-center justify-between p-3 rounded-md border">
                        <span className="text-sm">{task.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className={`text-xs border-${getStatusColor(task.status)}`}>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            الأنشطة الأسبوعية
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyActivities.map((week, weekIndex) => (
            <div key={weekIndex}>
              <h3 className="font-semibold mb-4">{week.week}</h3>
              <div className="space-y-3">
                {week.activities.map((activity, activityIndex) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <div key={activityIndex} className="flex items-center gap-4 p-3 rounded-lg border">
                      <ActivityIcon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">{activity.activity}</div>
                        <div className="text-sm text-muted-foreground">{activity.day}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignTimeline;