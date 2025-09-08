import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Users, MapPin, Calendar, TrendingUp, Award, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CampaignOverview = () => {
  const [stats, setStats] = useState<any>(null);
  const [priorities, setPriorities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: voterData, error: voterError } = await supabase
          .from('voter_census')
          .select('total_potential_voters, voters_with_cards, voters_without_cards');
        
        const { data: districtsData, error: districtsError } = await supabase
          .from('districts')
          .select('*');

        const { data: prioritiesData, error: prioritiesError } = await supabase
          .from('districts')
          .select('name_ar, target_votes, priority_level')
          .in('priority_level', ['high', 'medium'])
          .order('target_votes', { ascending: false })
          .limit(5);

        if (voterError) throw voterError;
        if (districtsError) throw districtsError;
        if (prioritiesError) throw prioritiesError;

        const totalPotential = (voterData || []).reduce((sum, item) => sum + (item.total_potential_voters || 0), 0);
        const totalWithCards = (voterData || []).reduce((sum, item) => sum + (item.voters_with_cards || 0), 0);
        const totalTargetVotes = (districtsData || []).reduce((sum, item) => sum + (item.target_votes || 0), 0);
        
        setStats({
          total_target_votes: totalTargetVotes,
          total_potential_voters: totalPotential,
          total_with_cards: totalWithCards,
          total_districts_count: districtsData?.length || 0,
          active_districts_count: (districtsData || []).filter((d: any) => d.coordinator_name).length
        });
        setPriorities(prioritiesData);
      } catch (e) {
        const message = e instanceof Error ? e.message : "An unknown error occurred";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = stats ? [
    { title: "إجمالي الأصوات المستهدفة", value: `${stats.total_target_votes}`, current: stats.total_potential_voters, target: stats.total_target_votes, icon: Target, color: "campaign-target" },
    { title: "الناخبين المحتملين", value: `${stats.total_potential_voters}`, current: stats.total_with_cards, target: stats.total_potential_voters, icon: Users, color: "campaign-success" },
    { title: "المناطق النشطة", value: `${stats.active_districts_count}`, current: stats.active_districts_count, target: stats.total_districts_count, icon: MapPin, color: "campaign-progress" },
    { title: "الأيام المتبقية", value: "60", current: 30, target: 90, icon: Calendar, color: "primary" } // Placeholder for days
  ] : [];

  if (loading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  if (error) {
    return <div className="text-destructive flex items-center gap-2"><AlertCircle /> Error loading dashboard: {error}</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary p-8 text-primary-foreground">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4"><Award className="h-8 w-8" /><h1 className="text-3xl font-bold">خطة الحملة الانتخابية الشاملة</h1></div>
          <p className="text-lg opacity-90 mb-6">مرحبا بك في لوحة التحكم المركزية لحملتك الانتخابية.</p>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent to-white/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const percentage = stat.target > 0 ? Math.round((stat.current / stat.target) * 100) : 0;
          return (
            <Card key={index} className="relative overflow-hidden transition-smooth hover:shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 text-${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{stat.value}</div>
                <Progress value={percentage} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" />{percentage}% من الهدف</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> المناطق ذات الأولوية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {priorities.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge variant={area.priority_level === "high" ? "destructive" : "secondary"}>
                    {area.priority_level === "high" ? "عالية" : "متوسطة"}
                  </Badge>
                  <span className="font-medium">{area.name_ar}</span>
                </div>
                <div className="text-left">
                  <span className="text-sm text-muted-foreground">الأصوات المستهدفة</span>
                  <div className="font-bold text-lg">{area.target_votes}</div>
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
