import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Users, Building, CheckCircle, HelpCircle, UserPlus } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Interfaces
interface District {
  id: string;
  name_ar: string;
  name_fr: string;
}

interface ResidentialSquare {
  id: string;
  square_number: number;
  building_codes: string[];
  total_buildings: number;
  surveyed_buildings: number;
}

interface CensusFormData {
  building_code: string;
  apartment_number: string;
  head_of_household: string;
  phone_number: string;
  has_voting_card: 'yes' | 'no' | null;
  notes: string;
}

// Helper component for the usage guide
const UsageGuide = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" size="icon">
        <HelpCircle className="w-4 h-4" />
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>دليل استخدام صفحة الإحصاء</DialogTitle>
        <DialogDescription>
          اتبع هذه الخطوات لتسجيل ناخب جديد:
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4" dir="rtl">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">1</div>
          <div>
            <h4 className="font-semibold">اختر المنطقة</h4>
            <p className="text-sm text-muted-foreground">ابدأ باختيار الحي، ثم المربع السكني، وأخيراً رقم العمارة من القوائم المنسدلة.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">2</div>
          <div>
            <h4 className="font-semibold">املأ بيانات الناخب</h4>
            <p className="text-sm text-muted-foreground">أدخل رقم الشقة (إجباري)، الاسم الكامل للناخب، ورقم هاتفه.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">3</div>
          <div>
            <h4 className="font-semibold">حدد حالة بطاقة الانتخاب</h4>
            <p className="text-sm text-muted-foreground">اختر "نعم" إذا كان الناخب يملك بطاقة انتخاب، أو "لا" إذا لم يكن يملكها.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">4</div>
          <div>
            <h4 className="font-semibold">حفظ البيانات</h4>
            <p className="text-sm text-muted-foreground">بعد التأكد من صحة جميع البيانات، اضغط على زر "حفظ بيانات الناخب" لإتمام العملية.</p>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);


const Census = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [squares, setSquares] = useState<ResidentialSquare[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedSquare, setSelectedSquare] = useState<string>('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CensusFormData>({
    building_code: '',
    apartment_number: '',
    head_of_household: '',
    phone_number: '',
    has_voting_card: null,
    notes: ''
  });

  const loadDistricts = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('districts').select('id, name_ar, name_fr').order('name_ar');
      if (error) throw error;
      setDistricts(data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "خطأ في تحميل الأحياء", description: message });
    }
  }, [toast]);

  const loadSquares = useCallback(async (districtId: string) => {
    try {
      // RLS ensures only assigned squares are fetched
      const { data, error } = await supabase.from('residential_squares').select('id, square_number, building_codes, total_buildings, surveyed_buildings').eq('district_id', districtId).order('square_number');
      if (error) throw error;
      setSquares(data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "خطأ في تحميل المربعات السكنية", description: message });
    }
  }, [toast]);

  useEffect(() => {
    loadDistricts();
  }, [loadDistricts]);

  useEffect(() => {
    if (selectedDistrict) {
      setSquares([]);
      setSelectedSquare('');
      loadSquares(selectedDistrict);
    }
  }, [selectedDistrict, loadSquares]);

  useEffect(() => {
    if (selectedBuilding) {
      setFormData(prev => ({ ...prev, building_code: selectedBuilding }));
    }
  }, [selectedBuilding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSquare || !selectedBuilding || !formData.has_voting_card) {
      toast({
        variant: "destructive",
        title: "بيانات غير مكتملة",
        description: "يرجى اختيار المنطقة وملء جميع الحقول الإجبارية.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (!profile) throw new Error("Profile not found");

      const dataToInsert = {
        residential_square_id: selectedSquare,
        building_code: formData.building_code,
        apartment_number: formData.apartment_number,
        head_of_household: formData.head_of_household,
        phone_number: formData.phone_number,
        voters_with_cards: formData.has_voting_card === 'yes' ? 1 : 0,
        voters_without_cards: formData.has_voting_card === 'no' ? 1 : 0,
        total_potential_voters: 1,
        notes: formData.notes,
        surveyed_by: profile.id,
        surveyed_at: new Date().toISOString(),
        survey_status: 'completed'
      };

      const { error } = await supabase.from('voter_census').insert(dataToInsert);
      if (error) throw error;

      toast({
        title: "تم الحفظ بنجاح!",
        description: "تم تسجيل بيانات الناخب.",
      });

      // Reset form
      setFormData({
        building_code: selectedBuilding,
        apartment_number: '',
        head_of_household: '',
        phone_number: '',
        has_voting_card: null,
        notes: ''
      });

      // Optionally, reload squares to update stats, though this might be slow
      // if (selectedDistrict) loadSquares(selectedDistrict);

    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "خطأ في حفظ البيانات",
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSquareData = squares.find(s => s.id === selectedSquare);
  const availableBuildings = selectedSquareData?.building_codes || [];

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-2xl text-primary">
                    <Users className="w-6 h-6" />
                    إحصاء و تسجيل الناخبين
                </CardTitle>
                <CardDescription>
                    تسجيل بيانات الناخبين بشكل فردي حسب العمارات والمربعات السكنية
                </CardDescription>
            </div>
            <UsageGuide />
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Selection Panel */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. اختيار المنطقة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>الحي</Label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger><SelectValue placeholder="اختر الحي" /></SelectTrigger>
                  <SelectContent>{districts.map(d => <SelectItem key={d.id} value={d.id}>{d.name_ar}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {selectedDistrict && (
                <div className="space-y-2">
                  <Label>المربع السكني</Label>
                  <Select value={selectedSquare} onValueChange={setSelectedSquare}>
                    <SelectTrigger><SelectValue placeholder="اختر المربع" /></SelectTrigger>
                    <SelectContent>{squares.length > 0 ? squares.map(s => <SelectItem key={s.id} value={s.id}>المربع {s.square_number}</SelectItem>) : <SelectItem value="none" disabled>لا توجد مربعات معينة</SelectItem>}</SelectContent>
                  </Select>
                </div>
              )}

              {selectedSquare && (
                <div className="space-y-2">
                  <Label>العمارة</Label>
                  <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                    <SelectTrigger><SelectValue placeholder="اختر العمارة" /></SelectTrigger>
                    <SelectContent>{availableBuildings.map(b => <SelectItem key={b} value={b}>عمارة {b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Census Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                2. بيانات الناخب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apartment_number">رقم الشقة</Label>
                    <Input id="apartment_number" value={formData.apartment_number} onChange={e => setFormData(p => ({ ...p, apartment_number: e.target.value }))} placeholder="رقم الشقة" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="head_of_household">الاسم الكامل</Label>
                    <Input id="head_of_household" value={formData.head_of_household} onChange={e => setFormData(p => ({ ...p, head_of_household: e.target.value }))} placeholder="اسم الناخب الكامل" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">رقم الهاتف (اختياري)</Label>
                  <Input id="phone_number" value={formData.phone_number} onChange={e => setFormData(p => ({ ...p, phone_number: e.target.value }))} placeholder="رقم هاتف الناخب" type="tel" />
                </div>

                <div className="space-y-3">
                    <Label>هل يحوز على بطاقة انتخاب؟</Label>
                    <RadioGroup
                        required
                        value={formData.has_voting_card || ''}
                        onValueChange={(value: 'yes' | 'no') => setFormData(p => ({ ...p, has_voting_card: value }))}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="has-card-yes" />
                            <Label htmlFor="has-card-yes">نعم</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="has-card-no" />
                            <Label htmlFor="has-card-no">لا</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea id="notes" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="أي ملاحظات إضافية..." rows={3} />
                </div>

                <Button type="submit" className="w-full" disabled={submitting || !selectedSquare || !selectedBuilding}>
                  {submitting ? "جاري الحفظ..." : "حفظ بيانات الناخب"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Census;