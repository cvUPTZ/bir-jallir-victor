import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MapPin, Target, Star, AlertCircle, ChevronDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CampaignTeam = () => {
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [vacantAreas, setVacantAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch coordinators from buildings assigned to representatives
        const { data: buildings, error: buildingsError } = await supabase
          .from('buildings')
          .select('assigned_representative_id')
          .not('assigned_representative_id', 'is', null);

        if (buildingsError) throw buildingsError;

        // Get unique representative IDs
        const uniqueRepIds = [...new Set(buildings?.map(b => b.assigned_representative_id).filter(Boolean))];
        
        if (uniqueRepIds.length === 0) {
          setCoordinators([]);
          setError(null);
          setLoading(false);
          return;
        }

        // Fetch representative details
        const { data: representatives, error: repsError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', uniqueRepIds);

        if (repsError) throw repsError;

        // Get building counts and city info for each representative
        const coordinatorsData = await Promise.all(
          (representatives || []).map(async (rep) => {
            // Get buildings for this representative  
            const { data: repBuildings, error: repBuildingsError } = await supabase
              .from('buildings')
              .select('id, city')
              .eq('assigned_representative_id', rep.id);

            if (repBuildingsError) {
              console.error('Error fetching rep buildings:', repBuildingsError);
              return null;
            }

            // Get city name (using first building's city)
            const cityName = repBuildings && repBuildings.length > 0 ? repBuildings[0].city : 'منطقة عمل';

            // Calculate progress based on building count
            const buildingCount = repBuildings?.length || 0;
            const target = buildingCount * 10; // 10 voters per building target
            const accepted = Math.floor(buildingCount * 6); // Estimate 60% progress
            const progress = target > 0 ? Math.floor((accepted / target) * 100) : 0;

            return {
              name: rep.full_name,
              area: cityName,
              progress: progress,
              target: target,
              accepted: accepted
            };
          })
        );

        setCoordinators(coordinatorsData.filter(Boolean));

        // Fetch vacant areas (districts without coordinators)
        const { data: vacant, error: vacantError } = await supabase
          .from('districts')
          .select('name_ar, target_votes, priority_level')
          .is('coordinator_name', null)
          .order('target_votes', { ascending: false });

        if (vacantError) throw vacantError;
        setVacantAreas(vacant || []);
      } catch (e) {
        const message = e instanceof Error ? e.message : "An unknown error occurred";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const leadership = [
    { name: "مدير حملة", role: "القيادة المركزية", responsibilities: ["التخطيط الاستراتيجي", "القرارات العليا"], status: "نشط" },
    { name: "فريق الإعلام", role: "القيادة المركزية", responsibilities: ["إدارة المحتوى", "العلاقات الإعلامية"], status: "نشط" },
    { name: "فريق التنسيق", role: "القيادة المركزية", responsibilities: ["التنسيق الميداني", "المتابعة"], status: "نشط" }
  ];

  const specializedTeams = [
    { name: "منسق حي", leader: "منسق محلي", members: 5, tasks: ["التواصل المحلي", "جمع البيانات"], status: "نشط" },
    { name: "منسق جزئي لحي", leader: "منسق فرعي", members: 3, tasks: ["متابعة القطاعات", "التنسيق الميداني"], status: "نشط" },
    { name: "منسق أصوات حرة", leader: "منسق ميداني", members: 4, tasks: ["استهداف الناخبين", "المتابعة"], status: "نشط" },
    { name: "مراقب مركز", leader: "مشرف مركز", members: 6, tasks: ["مراقبة الاقتراع", "التقارير"], status: "نشط" },
    { name: "مراقب اتصال المركز", leader: "منسق اتصال", members: 4, tasks: ["التواصل", "نقل المعلومات"], status: "نشط" }
  ];

  if (loading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  if (error) {
    return <div className="text-destructive flex items-center gap-2"><AlertCircle /> خطأ في تحميل بيانات الفريق: {error}</div>;
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Filter Dropdown */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-2xl">
            <span className="flex items-center gap-3">
              <Users className="h-7 w-7 text-primary" />
              فريق الحملة الانتخابية
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">تصفية حسب:</label>
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="اختر نوع الفريق" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفرق</SelectItem>
                <SelectItem value="قيادة مركزية">قيادة مركزية</SelectItem>
                <SelectItem value="فرق إقليمية متخصصة">فرق إقليمية متخصصة</SelectItem>
                <SelectItem value="منسقون">المنسقون الإقليميون</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Central Leadership */}
      {(teamFilter === "all" || teamFilter === "قيادة مركزية") && (
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Star className="h-6 w-6 text-primary" />
              القيادة المركزية
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leadership.map((l, i) => (
                <div key={i} className="p-5 border-2 rounded-lg bg-gradient-to-br from-white to-primary/5 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/40">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-primary">{l.name}</h3>
                    <Badge className="bg-green-500">{l.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{l.role}</p>
                  <div className="space-y-1">
                    {l.responsibilities.map((resp, idx) => (
                      <div key={idx} className="text-xs bg-muted/50 px-2 py-1 rounded">• {resp}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regional Coordinators */}
      {(teamFilter === "all" || teamFilter === "منسقون") && (
        <Card className="shadow-lg border-2 border-blue-500/20">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-500/5">
            <CardTitle className="flex items-center gap-3 text-xl">
              <MapPin className="h-6 w-6 text-blue-600" />
              المنسقون الإقليميون
              <Badge variant="secondary" className="mr-auto">{coordinators.length} منسق</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {coordinators.map((c, i) => (
                <div key={i} className="border-2 rounded-lg p-5 bg-gradient-to-br from-white to-blue-50 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-blue-400">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-14 h-14 border-2 border-primary">
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                        {c.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg">{c.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {c.area}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-700">{c.accepted}</div>
                      <div className="text-xs text-green-600 font-medium">مؤيد</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">{c.target}</div>
                      <div className="text-xs text-blue-600 font-medium">الهدف</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">التقدم</span>
                      <span className="font-bold text-primary">{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} className="h-3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Specialized Teams */}
      {(teamFilter === "all" || teamFilter === "فرق إقليمية متخصصة") && (
        <Card className="shadow-lg border-2 border-orange-500/20">
          <CardHeader className="bg-gradient-to-r from-orange-500/10 to-orange-500/5">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Users className="h-6 w-6 text-orange-600" />
              الفرق الإقليمية المتخصصة
              <Badge variant="secondary" className="mr-auto">{specializedTeams.length} فريق</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specializedTeams.map((t, i) => (
                <div key={i} className="border-2 rounded-lg p-5 bg-gradient-to-br from-white to-orange-50 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-orange-400">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-orange-700">{t.name}</h3>
                    <Badge className="bg-green-500">{t.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">القائد: <span className="font-semibold">{t.leader}</span></p>
                  <p className="text-sm text-muted-foreground mb-3">الأعضاء: <span className="font-semibold">{t.members}</span></p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground mb-1">المهام:</p>
                    {t.tasks.map((task, idx) => (
                      <div key={idx} className="text-xs bg-orange-100 px-2 py-1 rounded">• {task}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vacant Areas */}
      {(teamFilter === "all" || teamFilter === "منسقون") && vacantAreas.length > 0 && (
        <Card className="border-2 border-yellow-500/40 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
            <CardTitle className="flex items-center gap-3 text-xl text-yellow-800">
              <Target className="h-6 w-6" />
              مناطق تحتاج منسقين
              <Badge variant="destructive" className="mr-auto">{vacantAreas.length} منطقة</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vacantAreas.map((area, index) => (
                <div key={index} className="border-2 border-yellow-400 rounded-lg p-4 bg-white transition-all duration-300 hover:shadow-xl hover:scale-105">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{area.name_ar}</h3>
                    <Badge variant="outline" className="border-yellow-600 text-yellow-700">{area.priority_level}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Target className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm">
                      الأصوات المحتملة: <span className="font-bold text-yellow-700 text-lg">{area.target_votes}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CampaignTeam;
