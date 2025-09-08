import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Users, Building, CheckCircle, Clock, AlertCircle } from 'lucide-react';

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

interface CensusData {
  building_code: string;
  apartment_number: string;
  head_of_household: string;
  phone_number: string;
  voters_with_cards: number;
  voters_without_cards: number;
  total_potential_voters: number;
  notes: string;
}

const Census = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [squares, setSquares] = useState<ResidentialSquare[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedSquare, setSelectedSquare] = useState<string>('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CensusData>({
    building_code: '',
    apartment_number: '',
    head_of_household: '',
    phone_number: '',
    voters_with_cards: 0,
    voters_without_cards: 0,
    total_potential_voters: 0,
    notes: ''
  });

  useEffect(() => {
    loadDistricts();
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      loadSquares(selectedDistrict);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedBuilding) {
      setFormData(prev => ({ ...prev, building_code: selectedBuilding }));
    }
  }, [selectedBuilding]);

  useEffect(() => {
    const total = formData.voters_with_cards + formData.voters_without_cards;
    setFormData(prev => ({ ...prev, total_potential_voters: total }));
  }, [formData.voters_with_cards, formData.voters_without_cards]);

  const loadDistricts = async () => {
    try {
      const { data, error } = await supabase
        .from('districts')
        .select('id, name_ar, name_fr')
        .order('name_ar');

      if (error) throw error;
      setDistricts(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في تحميل الأحياء",
        description: error.message,
      });
    }
  };

  const loadSquares = async (districtId: string) => {
    try {
      const { data, error } = await supabase
        .from('residential_squares')
        .select('id, square_number, building_codes, total_buildings, surveyed_buildings')
        .eq('district_id', districtId)
        .order('square_number');

      if (error) throw error;
      setSquares(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في تحميل المربعات السكنية",
        description: error.message,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSquare || !selectedBuilding) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى اختيار المربع السكني والعمارة",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { error } = await supabase
        .from('voter_census')
        .insert({
          residential_square_id: selectedSquare,
          building_code: formData.building_code,
          apartment_number: formData.apartment_number,
          head_of_household: formData.head_of_household,
          phone_number: formData.phone_number,
          voters_with_cards: formData.voters_with_cards,
          voters_without_cards: formData.voters_without_cards,
          total_potential_voters: formData.total_potential_voters,
          notes: formData.notes,
          surveyed_by: profile?.id,
          surveyed_at: new Date().toISOString(),
          survey_status: 'completed'
        });

      if (error) throw error;

      toast({
        title: "تم حفظ البيانات بنجاح!",
        description: "تم إضافة إحصاء الناخبين للعمارة",
      });

      // Reset form
      setFormData({
        building_code: '',
        apartment_number: '',
        head_of_household: '',
        phone_number: '',
        voters_with_cards: 0,
        voters_without_cards: 0,
        total_potential_voters: 0,
        notes: ''
      });
      setSelectedBuilding('');

      // Reload squares to update surveyed count
      if (selectedDistrict) {
        loadSquares(selectedDistrict);
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في حفظ البيانات",
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSquareData = squares.find(s => s.id === selectedSquare);
  const availableBuildings = selectedSquareData?.building_codes || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-primary">
              <Users className="w-6 h-6" />
              إحصاء بطاقات الانتخاب
            </CardTitle>
            <CardDescription>
              تسجيل بيانات الناخبين حسب العمارات والمربعات السكنية
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Selection Panel */}
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">اختيار المنطقة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>الحي</Label>
                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحي" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDistrict && (
                  <div className="space-y-2">
                    <Label>المربع السكني</Label>
                    <Select value={selectedSquare} onValueChange={setSelectedSquare}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المربع السكني" />
                      </SelectTrigger>
                      <SelectContent>
                        {squares.map((square) => (
                          <SelectItem key={square.id} value={square.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>المربع السكني {square.square_number}</span>
                              <Badge variant={square.surveyed_buildings === square.total_buildings ? "default" : "secondary"}>
                                {square.surveyed_buildings}/{square.total_buildings}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedSquare && (
                  <div className="space-y-2">
                    <Label>العمارة</Label>
                    <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العمارة" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBuildings.map((building) => (
                          <SelectItem key={building} value={building}>
                            عمارة {building}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedSquareData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    إحصائيات المربع
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>إجمالي العمارات</span>
                    <Badge variant="outline">{selectedSquareData.total_buildings}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>تم المسح</span>
                    <Badge variant="default">{selectedSquareData.surveyed_buildings}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>متبقي</span>
                    <Badge variant="secondary">
                      {selectedSquareData.total_buildings - selectedSquareData.surveyed_buildings}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Census Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  بيانات الإحصاء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>رقم الشقة (اختياري)</Label>
                      <Input
                        value={formData.apartment_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, apartment_number: e.target.value }))}
                        placeholder="رقم الشقة"
                        dir="rtl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>رب البيت</Label>
                      <Input
                        value={formData.head_of_household}
                        onChange={(e) => setFormData(prev => ({ ...prev, head_of_household: e.target.value }))}
                        placeholder="اسم رب البيت"
                        required
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>رقم الهاتف</Label>
                    <Input
                      value={formData.phone_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="رقم الهاتف"
                      type="tel"
                      dir="rtl"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>عدد الحائزين على بطاقة</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.voters_with_cards}
                        onChange={(e) => setFormData(prev => ({ ...prev, voters_with_cards: parseInt(e.target.value) || 0 }))}
                        className="text-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>عدد غير الحائزين على بطاقة</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.voters_without_cards}
                        onChange={(e) => setFormData(prev => ({ ...prev, voters_without_cards: parseInt(e.target.value) || 0 }))}
                        className="text-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>إجمالي الناخبين المحتملين</Label>
                      <Input
                        type="number"
                        value={formData.total_potential_voters}
                        readOnly
                        className="text-center bg-muted"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>ملاحظات</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="أي ملاحظات إضافية..."
                      rows={3}
                      dir="rtl"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={submitting || !selectedSquare || !selectedBuilding}
                  >
                    {submitting ? "جاري الحفظ..." : "حفظ البيانات"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Census;