import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Shield, CheckCircle, User, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Label } from '@/components/ui/label';

const PAGE_SIZE = 10;

interface Profile {
  id: string;
  full_name: string;
}

interface ResidentialSquare {
  id: string;
  square_number: number;
  district_name: string;
  assigned_to: string | null;
}

const Admin = () => {
  const [representatives, setRepresentatives] = useState<Profile[]>([]);
  const [squares, setSquares] = useState<ResidentialSquare[]>([]);
  const [selectedRep, setSelectedRep] = useState<string>('');
  const [selectedSquares, setSelectedSquares] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalSquares, setTotalSquares] = useState(0);
  const { toast } = useToast();

  const fetchReps = useCallback(async () => {
    try {
      const { data: repsData, error: repsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'representative')
        .order('full_name');
      if (repsError) throw repsError;
      setRepresentatives(repsData || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "خطأ في تحميل المندوبين", description: message });
    }
  }, [toast]);

  const fetchSquares = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from('residential_squares')
        .select(`id, square_number, districts ( name_ar ), profiles ( full_name )`, { count: 'exact' })
        .order('district_id')
        .order('square_number')
        .range(from, to);

      if (error) throw error;

      const formattedSquares = data.map((sq: any) => ({
        id: sq.id,
        square_number: sq.square_number,
        district_name: sq.districts?.name_ar || 'N/A',
        assigned_to: sq.profiles?.full_name || null,
      }));
      setSquares(formattedSquares);
      setTotalSquares(count || 0);

    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "خطأ في تحميل المربعات", description: message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReps();
    fetchSquares(currentPage);
  }, [fetchReps, fetchSquares, currentPage]);

  const handleAssign = async () => {
    if (!selectedRep || selectedSquares.length === 0) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الرجاء اختيار مندوب ومربع سكني واحد على الأقل." });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('residential_squares')
        .update({ assigned_representative_id: selectedRep })
        .in('id', selectedSquares);

      if (error) throw error;

      toast({ title: "تم بنجاح", description: "تم تعيين المربعات السكنية بنجاح." });
      fetchSquares(currentPage); // Refresh current page
      setSelectedRep('');
      setSelectedSquares([]);
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "خطأ في التعيين", description: message });
    } finally {
        setSaving(false);
    }
  };

  const totalPages = Math.ceil(totalSquares / PAGE_SIZE);

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-primary">
            <Shield className="w-6 h-6" />
            لوحة تحكم المسؤول
          </CardTitle>
          <CardDescription>تعيين المربعات السكنية للمندوبين.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>1. تعيين مهمة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><User className="w-4 h-4" /> اختر المندوب</Label>
              <Select value={selectedRep} onValueChange={setSelectedRep}>
                <SelectTrigger><SelectValue placeholder="اختر مندوب..." /></SelectTrigger>
                <SelectContent>
                  {representatives.map(rep => (
                    <SelectItem key={rep.id} value={rep.id}>{rep.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" /> اختر المربعات السكنية</Label>
              <p className="text-sm text-muted-foreground">اختر مربعًا أو أكثر من القائمة على اليسار لتعيينها للمندوب المختار.</p>
            </div>
            <Button onClick={handleAssign} className="w-full" disabled={saving || !selectedRep || selectedSquares.length === 0}>
              {saving ? "جاري التعيين..." : "تعيين المربعات المحددة"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. قائمة المربعات السكنية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="min-h-[400px]">
              {loading ? <p>جاري تحميل المربعات...</p> : squares.map(sq => (
                <div
                  key={sq.id}
                  onClick={() => {
                    const newSelection = selectedSquares.includes(sq.id)
                      ? selectedSquares.filter(id => id !== sq.id)
                      : [...selectedSquares, sq.id];
                    setSelectedSquares(newSelection);
                  }}
                  className={`p-3 mb-2 border rounded-md cursor-pointer flex justify-between items-center transition-all ${selectedSquares.includes(sq.id) ? 'bg-primary/10 border-primary shadow-sm' : 'hover:bg-muted/50'}`}
                >
                  <div>
                    <p className="font-semibold">{sq.district_name} - المربع {sq.square_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {sq.assigned_to ? `معين لـ: ${sq.assigned_to}` : 'غير معين'}
                    </p>
                  </div>
                  {selectedSquares.includes(sq.id) && <CheckCircle className="w-5 h-5 text-primary" />}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center pt-4">
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="mx-4 text-sm">
                    صفحة {currentPage + 1} من {totalPages}
                </span>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages - 1}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
