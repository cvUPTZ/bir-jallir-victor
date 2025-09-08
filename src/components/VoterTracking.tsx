import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Phone, MapPin, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const VoterTracking = () => {
  const { data: pipelineStages, isLoading: isLoadingPipeline } = useQuery({
    queryKey: ["pipelineStages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("voter_census").select("survey_status");
      if (error) throw new Error(error.message);
      
      // Process the data to create pipeline stages
      const stages = [
        { stage: 'محتمل', count: data?.filter(d => d.survey_status === 'pending').length || 0, color: 'blue', probability: 25 },
        { stage: 'تم التواصل', count: data?.filter(d => d.survey_status === 'contacted').length || 0, color: 'orange', probability: 50 },
        { stage: 'مؤيد', count: data?.filter(d => d.survey_status === 'accepted').length || 0, color: 'green', probability: 75 },
        { stage: 'مؤكد', count: data?.filter(d => d.survey_status === 'confirmed').length || 0, color: 'campaign-success', probability: 90 }
      ];
      return stages;
    },
  });

  const { data: voterDatabase, isLoading: isLoadingVoterDatabase } = useQuery({
    queryKey: ["voterDatabase"],
    queryFn: async () => {
      const { data: squares, error: squaresError } = await supabase
        .from("residential_squares")
        .select("*, profiles(full_name, phone)")
        .not('assigned_representative_id', 'eq', null);
      
      if (squaresError) throw new Error(squaresError.message);
      
      const { data: census, error: censusError } = await supabase
        .from("voter_census")
        .select("*");
      
      if (censusError) throw new Error(censusError.message);
      
      // Process the data to create voter database view
      const processed = squares?.map(square => {
        const squareCensus = census?.filter(c => c.residential_square_id === square.id) || [];
        return {
          square_number: square.square_number,
          building_codes: square.building_codes,
          potential: squareCensus.reduce((sum, c) => sum + (c.total_potential_voters || 0), 0),
          with_cards: squareCensus.reduce((sum, c) => sum + (c.voters_with_cards || 0), 0),
          without_cards: squareCensus.reduce((sum, c) => sum + (c.voters_without_cards || 0), 0),
          contacted: squareCensus.filter(c => c.survey_status === 'contacted').length,
          accepted: squareCensus.filter(c => c.survey_status === 'accepted').length,
          manager: square.profiles?.full_name || 'غير محدد',
          manager_phone: square.profiles?.phone || ''
        };
      }) || [];
      
      return processed;
    },
  });

  const { data: coordinatorProgress, isLoading: isLoadingCoordinator } = useQuery({
    queryKey: ["coordinatorProgress"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "representative");
      
      if (profilesError) throw new Error(profilesError.message);
      
      const { data: squares, error: squaresError } = await supabase
        .from("residential_squares")
        .select("*");
      
      if (squaresError) throw new Error(squaresError.message);
      
      const { data: census, error: censusError } = await supabase
        .from("voter_census")
        .select("*");
      
      if (censusError) throw new Error(censusError.message);
      
      // Process coordinator progress
      const processed = profiles?.map(profile => {
        const assignedSquares = squares?.filter(s => s.assigned_representative_id === profile.id) || [];
        const squareCensus = census?.filter(c => 
          assignedSquares.some(s => s.id === c.residential_square_id)
        ) || [];
        
        const target = assignedSquares.length * 100;
        const contacted = squareCensus.filter(c => c.survey_status === 'contacted').length;
        const accepted = squareCensus.filter(c => c.survey_status === 'accepted').length;
        const rejected = squareCensus.filter(c => c.survey_status === 'rejected').length;
        const progress = target > 0 ? Math.round((squareCensus.length / target) * 100) : 0;
        
        return {
          name: profile.full_name,
          area: profile.assigned_district || 'غير محدد',
          target,
          contacted,
          accepted,
          rejected,
          progress
        };
      }) || [];
      
      return processed;
    },
  });

  const totalPotential = voterDatabase?.reduce((sum, square) => sum + (square.potential || 0), 0) || 0;
  const totalContacted = voterDatabase?.reduce((sum, square) => sum + (square.contacted || 0), 0) || 0;
  const totalAccepted = voterDatabase?.reduce((sum, square) => sum + (square.accepted || 0), 0) || 0;
  const conversionRate = totalContacted > 0 ? Math.round((totalAccepted / totalContacted) * 100) : 0;

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

  if (isLoadingPipeline || isLoadingVoterDatabase || isLoadingCoordinator) {
    return (
      <div className="space-y-6">
        <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-96 w-full" /></CardContent></Card>
      </div>
    );
  }

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
            {pipelineStages?.map((stage, index) => (
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
            {coordinatorProgress?.map((coord, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{coord.name}</h3>
                    <p className="text-sm text-muted-foreground">{coord.area}</p>
                  </div>
                  <Badge variant={coord.progress && coord.progress >= 80 ? "default" : coord.progress && coord.progress >= 60 ? "secondary" : "outline"}>
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
                
                <Progress value={coord.progress || 0} className="h-2" />
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
            {voterDatabase?.map((square, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">المربع السكني {square.square_number}</h3>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {square.building_codes?.map((building, buildingIndex) => (
                        <Badge key={buildingIndex} variant="outline" className="text-xs">
                          {building}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-primary">{square.potential}</div>
                    <div className="text-xs text-muted-foreground">ناخب محتمل</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-campaign-success">{square.with_cards}</div>
                    <div className="text-xs text-muted-foreground">حائز بطاقة</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-warning">{square.without_cards}</div>
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
                    <span className="text-sm">{square.manager_phone}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>معدل التحويل</span>
                    <span>{square.contacted && square.contacted > 0 ? Math.round(((square.accepted || 0) / square.contacted) * 100) : 0}%</span>
                  </div>
                  <Progress value={square.contacted && square.contacted > 0 ? Math.round(((square.accepted || 0) / square.contacted) * 100) : 0} className="h-2" />
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