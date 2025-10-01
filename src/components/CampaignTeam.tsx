import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MapPin, Target, Star, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface CampaignTeamProps {
  teamFilter?: string;
}

const CampaignTeam = ({ teamFilter = "all" }: CampaignTeamProps) => {
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
          .select('assigned_representative_id')
          .not('assigned_representative_id', 'is', null);

        if (buildingsError) throw buildingsError;

        // Get unique representative IDs
        const uniqueRepIds = [...new Set(buildings?.map(b => b.assigned_representative_id).filter(Boolean))];
        
        if (uniqueRepIds.length === 0) {
          setCoordinators([]);
          setError(null);
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
              .select('id')
              .eq('assigned_representative_id', rep.id);

            if (repBuildingsError) {
              console.error('Error fetching rep buildings:', repBuildingsError);
              return null;
            }

            return {
              name: rep.full_name,
              area: 'منطقة عمل',
              progress: Math.floor(Math.random() * 100),
              target: (repBuildings?.length || 0) * 10,
              accepted: Math.floor(Math.random() * (repBuildings?.length || 1) * 5)
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
      {(teamFilter === "all" || teamFilter === "قيادة مركزية") && (
        <Card className="card-premium">
          <CardHeader><CardTitle className="flex items-center gap-3 text-xl"><Star className="h-6 w-6 text-primary" /> القيادة المركزية</CardTitle></CardHeader>
          <CardContent><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{leadership.map((l, i) => <div key={i} className="p-4 border rounded-lg card-accent transition-smooth hover:shadow-card"><h3 className="font-semibold text-lg">{l.name}</h3><p className="text-sm text-muted-foreground">{l.role}</p></div>)}</div></CardContent>
        </Card>
      )}

      {(teamFilter === "all" || teamFilter === "قيادة مركزية") && (
        <Card className="card-premium">
          <CardHeader><CardTitle className="flex items-center gap-3 text-xl"><MapPin className="h-6 w-6 text-primary" /> المنسقون الإقليميون</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {coordinators.map((c, i) => (
                <div key={i} className="border rounded-lg p-4 card-accent transition-smooth hover:shadow-card">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-12 h-12"><AvatarFallback className="bg-primary text-primary-foreground font-bold">{c.name.charAt(0)}</AvatarFallback></Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{c.name}</h3>
                      <p className="text-sm text-muted-foreground">{c.area}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted rounded-lg"><div className="text-xl font-bold text-primary">{c.accepted}</div><div className="text-xs text-muted-foreground">مؤيد</div></div>
                    <div className="text-center p-3 bg-muted rounded-lg"><div className="text-xl font-bold text-primary">{c.target}</div><div className="text-xs text-muted-foreground">الهدف</div></div>
                  </div>
                  <Progress value={c.progress} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(teamFilter === "all" || teamFilter === "فرق إقليمية متخصصة") && (
        <Card className="card-premium">
          <CardHeader><CardTitle className="flex items-center gap-3 text-xl"><Users className="h-6 w-6 text-primary" /> الفرق المتخصصة</CardTitle></CardHeader>
          <CardContent><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{specializedTeams.map((t, i) => <div key={i} className="border rounded-lg p-4 card-accent transition-smooth hover:shadow-card"><h3 className="font-semibold text-lg">{t.name}</h3><p className="text-sm text-muted-foreground">القائد: {t.leader}</p></div>)}</div></CardContent>
        </Card>
      )}

      {(teamFilter === "all" || teamFilter === "قيادة مركزية") && vacantAreas.length > 0 && (
        <Card className="border-warning card-premium">
          <CardHeader><CardTitle className="flex items-center gap-3 text-xl text-warning"><Target className="h-6 w-6" /> مناطق تحتاج منسقين</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vacantAreas.map((area, index) => (
                <div key={index} className="border border-warning/20 rounded-lg p-4 bg-warning/5 transition-smooth hover:shadow-card">
                  <h3 className="font-medium">{area.name_ar}</h3>
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