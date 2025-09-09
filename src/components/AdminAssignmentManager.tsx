import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { User, MapPin, Building, Home, CheckCircle, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const PAGE_SIZE = 10;

interface Profile {
  id: string;
  full_name: string;
}

interface District {
  id: string;
  name_ar: string;
  name_fr?: string;
  coordinator_name?: string;
  target_votes?: number;
  priority_level?: string;
  status?: string;
}

interface Building {
  id: string;
  building_number: string;
  district_id: string;
  assigned_representative_id: string | null;
  address: string | null;
  district?: { name_ar: string }; // Changed from district to cities
  profiles?: { full_name: string };
}

interface ResidentialSquare {
  id: string;
  square_number: number;
  building_id: string | null;
  assigned_representative_id: string | null;
}

const AdminAssignmentManager = () => {
  const [representatives, setRepresentatives] = useState<Profile[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [squares, setSquares] = useState<ResidentialSquare[]>([]);
  const [selectedRep, setSelectedRep] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalBuildings, setTotalBuildings] = useState(0);
  const [newBuildingNumber, setNewBuildingNumber] = useState('');
  const [newBuildingAddress, setNewBuildingAddress] = useState('');
  const [showAddBuilding, setShowAddBuilding] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      // Fetch representatives
      const { data: repsData, error: repsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'representative')
        .order('full_name');
      if (repsError) throw repsError;
      setRepresentatives(repsData || []);

      // Fetch districts/cities - Updated to use cities table
      const { data: districtsData, error: districtsError } = await supabase
        .from('districts') // Changed from 'districts' to 'cities'
        .select('*')
        .order('name_ar');
      if (districtsError) throw districtsError;
      setDistricts(districtsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      const message = error instanceof Error ? error.message : "خطأ في تحميل البيانات";
      toast({ variant: "destructive", title: "خطأ", description: message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchBuildings = useCallback(async (page: number, districtFilter?: string) => {
  setLoading(true);
  try {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase
      .from('buildings')
      .select(`
        *,
        districts!inner(name_ar),
        profiles(full_name)
      `, { count: 'exact' })
      .range(from, to);
    if (districtFilter) {
      query = query.eq('district_id', districtFilter);
    }
    const { data, error, count } = await query;
    if (error) throw error;
    const formattedBuildings = data?.map((building: any) => ({
      ...building,
      districts: building.districts, // Keep cities reference
      profiles: building.profiles
    })) || [];
    setBuildings(formattedBuildings);
    setTotalBuildings(count || 0);
  } catch (error) {
    console.error('Error fetching buildings:', error);
    const message = error instanceof Error ? error.message : "خطأ في تحميل المباني";
    toast({ variant: "destructive", title: "خطأ", description: message });
  } finally {
    setLoading(false);
  }
}, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchBuildings(currentPage, selectedDistrict);
  }, [fetchBuildings, currentPage, selectedDistrict]);

  const handleAssignBuildings = async () => {
    if (!selectedRep || selectedBuildings.length === 0) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الرجاء اختيار مندوب ومبنى واحد على الأقل." });
      return;
    }

    // Check if representative already has 6 buildings
    const { data: currentBuildings, error: checkError } = await supabase
      .from('buildings')
      .select('id')
      .eq('assigned_representative_id', selectedRep);

    if (checkError) {
      toast({ variant: "destructive", title: "خطأ", description: checkError.message });
      return;
    }

    if ((currentBuildings?.length || 0) + selectedBuildings.length > 6) {
      toast({ 
        variant: "destructive", 
        title: "تجاوز الحد المسموح", 
        description: `لا يمكن تعيين أكثر من 6 مباني للمندوب الواحد. المندوب لديه حالياً ${currentBuildings?.length || 0} مباني.` 
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('buildings')
        .update({ assigned_representative_id: selectedRep })
        .in('id', selectedBuildings);

      if (error) throw error;

      toast({ title: "تم بنجاح", description: "تم تعيين المباني بنجاح." });
      fetchBuildings(currentPage, selectedDistrict);
      setSelectedRep('');
      setSelectedBuildings([]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في التعيين";
      toast({ variant: "destructive", title: "خطأ في التعيين", description: message });
    } finally {
      setSaving(false);
    }
  };

  const addBuilding = async () => {
    if (!selectedDistrict || !newBuildingNumber) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الرجاء إدخال رقم المبنى واختيار المنطقة." });
      return;
    }

    try {
      const { error } = await supabase
        .from('buildings')
        .insert({
          building_number: newBuildingNumber,
          district_id: selectedDistrict,
          address: newBuildingAddress || null
        });

      if (error) throw error;

      toast({ title: "تم بنجاح", description: "تم إضافة المبنى بنجاح." });
      setNewBuildingNumber('');
      setNewBuildingAddress('');
      setShowAddBuilding(false);
      fetchBuildings(currentPage, selectedDistrict);
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في إضافة المبنى";
      toast({ variant: "destructive", title: "خطأ", description: message });
    }
  };

  const totalPages = Math.ceil(totalBuildings / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* District Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            فلترة المباني حسب المنطقة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="اختر المنطقة..." />
              </SelectTrigger>
              <SelectContent>
                {districts.map(district => (
                  <SelectItem key={district.id} value={district.id}>{district.name_ar}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog open={showAddBuilding} onOpenChange={setShowAddBuilding}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة مبنى جديد
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة مبنى جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>المنطقة</Label>
                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنطقة..." />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map(district => (
                          <SelectItem key={district.id} value={district.id}>{district.name_ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>رقم المبنى</Label>
                    <Input
                      type="text"
                      value={newBuildingNumber}
                      onChange={(e) => setNewBuildingNumber(e.target.value)}
                      placeholder="أدخل رقم المبنى"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>العنوان (اختياري)</Label>
                    <Input
                      value={newBuildingAddress}
                      onChange={(e) => setNewBuildingAddress(e.target.value)}
                      placeholder="أدخل عنوان المبنى"
                    />
                  </div>
                  <Button onClick={addBuilding} className="w-full">
                    إضافة المبنى
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Assignment Section */}
        <Card>
          <CardHeader>
            <CardTitle>تعيين المباني للمندوبين</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" /> 
                اختر المندوب
              </Label>
              <Select value={selectedRep} onValueChange={setSelectedRep}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر مندوب..." />
                </SelectTrigger>
                <SelectContent>
                  {representatives.map(rep => (
                    <SelectItem key={rep.id} value={rep.id}>{rep.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building className="w-4 h-4" /> 
                اختر المباني
              </Label>
              <p className="text-sm text-muted-foreground">
                اختر مبنى أو أكثر من القائمة على اليمين (الحد الأقصى 6 مباني لكل مندوب).
              </p>
              {selectedBuildings.length > 0 && (
                <p className="text-sm text-primary">
                  تم اختيار {selectedBuildings.length} مبنى
                </p>
              )}
            </div>
            <Button 
              onClick={handleAssignBuildings} 
              className="w-full" 
              disabled={saving || !selectedRep || selectedBuildings.length === 0}
            >
              {saving ? "جاري التعيين..." : "تعيين المباني المحددة"}
            </Button>
          </CardContent>
        </Card>

        {/* Buildings List */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة المباني</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="min-h-[400px]">
              {loading ? (
                <p>جاري تحميل المباني...</p>
              ) : buildings.length === 0 ? (
                <p className="text-muted-foreground">لا توجد مباني في هذه المنطقة</p>
              ) : (
                buildings.map(building => (
                  <div
                    key={building.id}
                    onClick={() => {
                      const newSelection = selectedBuildings.includes(building.id)
                        ? selectedBuildings.filter(id => id !== building.id)
                        : [...selectedBuildings, building.id];
                      setSelectedBuildings(newSelection);
                    }}
                    className={`p-3 mb-2 border rounded-md cursor-pointer flex justify-between items-center transition-all ${
                      selectedBuildings.includes(building.id) 
                        ? 'bg-primary/10 border-primary shadow-sm' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">
                        {building.district?.name_ar} - المبنى رقم {building.building_number}
                      </p>
                      {building.address && (
                        <p className="text-xs text-muted-foreground">{building.address}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {building.representative?.full_name ? 
                          `معين لـ: ${building.representative.full_name}` : 
                          'غير معين'
                        }
                      </p>
                    </div>
                    {selectedBuildings.includes(building.id) && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center justify-center pt-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setCurrentPage(p => p - 1)} 
                disabled={currentPage === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="mx-4 text-sm">
                صفحة {currentPage + 1} من {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setCurrentPage(p => p + 1)} 
                disabled={currentPage >= totalPages - 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAssignmentManager;
