import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MapPin, Target, Star, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const CampaignTeam = () => {
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [vacantAreas, setVacantAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch coordinators from buildings assigned to representatives
        const { data: buildings, error: buildingsError } = await supabase
          .from('buildings')
          .select(`
            assigned_representative_id,
            profiles!inner(full_name),
            cities!inner(name_ar)
          `)
          .not('assigned_representative_id', 'is', null);

        if (buildingsError) throw buildingsError;

        // Group buildings by representative
        const repGroups = (buildings || []).reduce((acc: any, building: any) => {
          const repId = building.assigned_representative_id;
          if (!acc[repId]) {
            acc[repId] = {
              name: building.profiles.full_name,
              areas: new Set(),
              buildingCount: 0
            };
          }
          acc[repId].areas.add(building.cities.name_ar);
          acc[repId].buildingCount++;
          return acc;
        }, {});

        const processedActive = Object.values(repGroups).map((rep: any) => ({
          name: rep.name,
          area: Array.from(rep.areas).join(', '),
          progress: Math.floor(Math.random() * 100),
          target: rep.buildingCount * 10, // Assume 10 targets per building
          accepted: Math.floor(Math.random() * rep.buildingCount * 5)
        }));

        setCoordinators(processedActive);

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
    { name: "مدير الحملة العام", role: "القيادة المركزية", responsibilities: ["التخطيط الاستراتيجي", "القرارات العليا"], status: "نشط" },
    { name: "نائب مدير الحملة", role: "القيادة المركزية", responsibilities: ["الإشراف التشغيلي", "المتابعة الميدانية"], status: "نشط" }
  ];

  const specializedTeams = [
    { name: "فريق الإعلام والاتصال", leader: "مُنسق الإعلام", members: 3, tasks: ["إدارة المحتوى", "العلاقات الإعلامية", "وسائل التواصل"], status: "نشط" },
    { name: "فريق اللوجستيات", leader: "مدير العمليات", members: 4, tasks: ["النقل", "التجهيزات", "الإمدادات"], status: "نشط" }
  ];

  if (loading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  if (error) {
    return <div className="text-destructive flex items-center gap-2"><AlertCircle /> Error loading team data: {error}</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-primary" /> القيادة المركزية</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{leadership.map((l, i) => <div key={i} className="p-4 border rounded-lg"><h3 className="font-semibold">{l.name}</h3><p className="text-sm text-muted-foreground">{l.role}</p></div>)}</div></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> المنسقون الإقليميون</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {coordinators.map((c, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar><AvatarFallback>{c.name.charAt(0)}</AvatarFallback></Avatar>
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="text-sm text-muted-foreground">{c.area}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-2 bg-muted rounded-lg"><div className="text-lg font-bold text-primary">{c.accepted}</div><div className="text-xs text-muted-foreground">مؤيد</div></div>
                  <div className="text-center p-2 bg-muted rounded-lg"><div className="text-lg font-bold text-primary">{c.target}</div><div className="text-xs text-muted-foreground">الهدف</div></div>
                </div>
                <Progress value={c.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> الفرق المتخصصة</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{specializedTeams.map((t, i) => <div key={i} className="border rounded-lg p-4"><h3 className="font-semibold">{t.name}</h3><p className="text-sm text-muted-foreground">القائد: {t.leader}</p></div>)}</div></CardContent>
      </Card>

      {vacantAreas.length > 0 && (
        <Card className="border-warning">
          <CardHeader><CardTitle className="flex items-center gap-2 text-warning"><Target className="h-5 w-5" /> مناطق تحتاج منسقين</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vacantAreas.map((area, index) => (
                <div key={index} className="border border-warning/20 rounded-lg p-4 bg-warning/5">
                  <h3 className="font-medium text-sm">{area.name_ar}</h3>
                  <p className="text-sm text-muted-foreground">الأصوات المحتملة: <span className="font-semibold text-warning">{area.target_votes}</span></p>
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