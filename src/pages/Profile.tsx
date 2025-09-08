import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { User, Target, CheckSquare, Building } from 'lucide-react';

interface AssignedSquare {
  id: string;
  square_number: number;
  district_name: string;
  total_buildings: number;
  surveyed_buildings: number;
  progress: number;
}

const Profile = () => {
  const { profile, loading: profileLoading } = useProfile();
  const [assignedSquares, setAssignedSquares] = useState<AssignedSquare[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignedData = useCallback(async (profileId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('residential_squares')
        .select(`
          id,
          square_number,
          total_buildings,
          surveyed_buildings,
          districts ( name_ar )
        `)
        .eq('assigned_representative_id', profileId);

      if (error) throw error;

      const formattedData = data.map((sq: any) => ({
        id: sq.id,
        square_number: sq.square_number,
        district_name: sq.districts.name_ar,
        total_buildings: sq.total_buildings,
        surveyed_buildings: sq.surveyed_buildings,
        progress: sq.total_buildings > 0 ? (sq.surveyed_buildings / sq.total_buildings) * 100 : 0,
      }));
      setAssignedSquares(formattedData);
    } catch (error) {
      console.error("Error fetching assigned squares:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      fetchAssignedData(profile.id);
    }
  }, [profile, fetchAssignedData]);

  if (profileLoading || loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <User />
            {profile?.full_name}
          </CardTitle>
          <CardDescription>مرحبًا بك في صفحة ملفك الشخصي وأهدافك.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المربعات المعينة</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{assignedSquares.length}</div>
                <p className="text-xs text-muted-foreground">مربع سكني</p>
            </CardContent>
        </Card>
        {/* Other summary cards can go here */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>أهدافك الحالية</CardTitle>
          <CardDescription>هذه هي المربعات السكنية المعينة لك. هدفك هو مسح جميع العمارات في كل مربع.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {assignedSquares.length > 0 ? (
            assignedSquares.map(square => (
              <div key={square.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{square.district_name} - المربع {square.square_number}</h3>
                    <span className="text-sm font-medium text-muted-foreground">
                        {square.surveyed_buildings} / {square.total_buildings} عمارة
                    </span>
                </div>
                <Progress value={square.progress} />
              </div>
            ))
          ) : (
            <p>ليس لديك أي مربعات سكنية معينة لك حاليًا.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
