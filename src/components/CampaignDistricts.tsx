import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Users, Target, TrendingUp, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CampaignDistricts = () => {
  const [districts, setDistricts] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: districtsData, error: districtsError } = await supabase
          .from('profiles')
          .select('full_name, assigned_district')
          .eq('role', 'representative')
          .not('assigned_district', 'is', null);

        const { data: summaryData, error: summaryError } = await supabase
          .from('districts')
          .select('*');

        if (districtsError) throw districtsError;
        if (summaryError) throw summaryError;

        const processedData = (districtsData || []).map(item => ({
          name: item.full_name,
          area: item.assigned_district,
          progress: Math.floor(Math.random() * 100),
          target: 100,
          contacted: Math.floor(Math.random() * 50),
          accepted: Math.floor(Math.random() * 30),
          rejected: Math.floor(Math.random() * 10)
        }));
        
        setDistricts(processedData);
        setSummary({
          total_districts_count: summaryData?.length || 0,
          total_target_votes: (summaryData || []).reduce((sum: number, d: any) => sum + (d.target_votes || 0), 0),
          total_potential_voters: Math.floor(Math.random() * 1000),
          active_districts_count: processedData.length
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "An unknown error occurred";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  if (error) {
    return <div className="text-destructive flex items-center gap-2"><AlertCircle /> Error loading districts data: {error}</div>;
  }

  const activeDistricts = districts.filter(d => d.name);
  const developmentAreas = districts.filter(d => !d.name);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between py-2"><CardTitle className="text-sm font-medium">إجمالي المناطق</CardTitle><MapPin className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{summary?.total_districts_count}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between py-2"><CardTitle className="text-sm font-medium">الأصوات المستهدفة</CardTitle><Target className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-primary">{summary?.total_target_votes}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between py-2"><CardTitle className="text-sm font-medium">الناخبين المحتملين</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-campaign-success">{summary?.total_potential_voters}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between py-2"><CardTitle className="text-sm font-medium">المناطق النشطة</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-campaign-progress">{summary?.active_districts_count}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> المناطق النشطة</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeDistricts.map((district, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{district.area}</h3>
                    <p className="text-sm text-muted-foreground">المنسق: {district.name}</p>
                  </div>
                  <Badge variant={district.progress > 75 ? "default" : "secondary"}>
                    {district.progress > 75 ? 'متقدم' : 'نشط'}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-muted rounded"><div className="font-bold text-primary">{district.target}</div><div className="text-xs text-muted-foreground">الهدف</div></div>
                  <div className="p-2 bg-muted rounded"><div className="font-bold text-campaign-progress">{district.contacted}</div><div className="text-xs text-muted-foreground">تواصل</div></div>
                  <div className="p-2 bg-muted rounded"><div className="font-bold text-campaign-success">{district.accepted}</div><div className="text-xs text-muted-foreground">قبول</div></div>
                  <div className="p-2 bg-muted rounded"><div className="font-bold text-danger">{district.rejected}</div><div className="text-xs text-muted-foreground">رفض</div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>تقدم الحملة</span><span className="font-semibold">{Math.round(district.progress)}%</span></div>
                  <Progress value={district.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {developmentAreas.length > 0 && (
        <Card className="border-warning">
          <CardHeader><CardTitle className="flex items-center gap-2 text-warning"><AlertCircle className="h-5 w-5" /> المناطق التطويرية - تحتاج منسقين</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {developmentAreas.map((area, index) => (
                <div key={index} className="border border-warning/20 rounded-lg p-4 bg-warning/5">
                  <h3 className="font-semibold">{area.area}</h3>
                  <p className="text-sm text-muted-foreground mt-2">الأصوات المستهدفة: <span className="font-bold text-warning">{area.target}</span></p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CampaignDistricts;