import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { User, MapPin, Building, CheckCircle, ChevronLeft, ChevronRight, Plus, Search, XCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const PAGE_SIZE = 10;

// Interfaces for our data structures
interface Profile {
  id: string;
  full_name: string;
}

interface RepresentativeWithCount extends Profile {
  building_count: number;
}

interface District {
  id: string;
  name_ar: string;
}

interface BuildingData {
  id: string;
  building_number: string;
  assigned_representative_id: string | null;
  address: string | null;
  building_code: string | null;
  district_name?: string;
  representative_name?: string | null;
}

const AdminAssignmentManager = () => {
  // State Management
  const [representatives, setRepresentatives] = useState<RepresentativeWithCount[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [buildings, setBuildings] = useState<BuildingData[]>([]);
  const [selectedRep, setSelectedRep] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalBuildings, setTotalBuildings] = useState(0);
  
  // State for new building dialog
  const [newBuildingNumber, setNewBuildingNumber] = useState('');
  const [newBuildingAddress, setNewBuildingAddress] = useState('');
  const [newBuildingDistrict, setNewBuildingDistrict] = useState<string>('');
  const [showAddBuilding, setShowAddBuilding] = useState(false);

  // State for search and debouncing to prevent excessive API calls
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const { toast } = useToast();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0); // Reset page to 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch initial data (districts and representatives with their building counts)
  const fetchData = useCallback(async () => {
    try {
      // Fetch districts
      const { data: districtsData, error: districtsError } = await supabase
        .from('districts')
        .select('id, name_ar')
        .order('name_ar');
      if (districtsError) throw districtsError;
      setDistricts(districtsData || []);

      // Fetch representatives
      const { data: repsData, error: repsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'representative')
        .order('full_name');
      if (repsError) throw repsError;

      // Fetch building counts for each representative
      const { data: countsData, error: countsError } = await supabase
        .from('buildings')
        .select('assigned_representative_id')
        .not('assigned_representative_id', 'is', null);
      if (countsError) throw countsError;

      const counts = (countsData || []).reduce((acc, { assigned_representative_id }) => {
        if (assigned_representative_id) {
            acc[assigned_representative_id] = (acc[assigned_representative_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const repsWithCounts = (repsData || []).map(rep => ({
        ...rep,
        building_count: counts[rep.id] || 0,
      }));
      setRepresentatives(repsWithCounts);

    } catch (error) {
      console.error('Error fetching data:', error);
      const message = error instanceof Error ? error.message : "خطأ في تحميل البيانات";
      toast({ variant: "destructive", title: "خطأ", description: message });
    }
  }, [toast]);

  // Fetch buildings based on pagination, filters, and search
  const fetchBuildings = useCallback(async () => {
    setLoading(true);
    try {
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      let query = supabase
        .from('buildings')
        .select('*, profiles(full_name)', { count: 'exact' })
        .range(from, to)
        .order('building_number');
      
      if (selectedDistrict !== 'all') {
        query = query.eq('district_id', selectedDistrict);
      }
      
      if (debouncedSearchTerm) {
        query = query.or(`building_number.ilike.%${debouncedSearchTerm}%,address.ilike.%${debouncedSearchTerm}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      
      const processedBuildings = (data || []).map((b: any) => ({ ...b, representative_name: b.profiles?.full_name }));
      setBuildings(processedBuildings);
      setTotalBuildings(count || 0);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      const message = error instanceof Error ? error.message : "خطأ في تحميل المباني";
      toast({ variant: "destructive", title: "خطأ", description: message });
    } finally {
      setLoading(false);
    }
  }, [toast, currentPage, selectedDistrict, debouncedSearchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  // Handler to assign selected buildings to the selected representative
  const handleAssignBuildings = async () => {
    if (!selectedRep || selectedBuildings.length === 0) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الرجاء اختيار مندوب ومبنى واحد على الأقل." });
      return;
    }

    const representative = representatives.find(r => r.id === selectedRep);
    if (!representative) return;

    if (representative.building_count + selectedBuildings.length > 6) {
      toast({ 
        variant: "destructive", 
        title: "تجاوز الحد المسموح", 
        description: `لا يمكن تعيين أكثر من 6 مباني للمندوب. ${representative.full_name} لديه حالياً ${representative.building_count} مباني.` 
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('buildings').update({ assigned_representative_id: selectedRep }).in('id', selectedBuildings);
      if (error) throw error;

      toast({ title: "تم بنجاح", description: "تم تعيين المباني بنجاح." });
      await Promise.all([fetchBuildings(), fetchData()]);
      setSelectedRep('');
      setSelectedBuildings([]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في التعيين";
      toast({ variant: "destructive", title: "خطأ في التعيين", description: message });
    } finally {
      setSaving(false);
    }
  };

  // Handler to unassign selected buildings
  const handleUnassignBuildings = async () => {
    if (selectedBuildings.length === 0) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('buildings').update({ assigned_representative_id: null }).in('id', selectedBuildings);
      if (error) throw error;

      toast({ title: "تم بنجاح", description: `تم إلغاء تعيين ${selectedBuildings.length} مبنى.` });
      await Promise.all([fetchBuildings(), fetchData()]);
      setSelectedBuildings([]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في إلغاء التعيين";
      toast({ variant: "destructive", title: "خطأ", description: message });
    } finally {
      setSaving(false);
    }
  };

  // Handler to add a new building
  const addBuilding = async () => {
    if (!newBuildingNumber || !newBuildingDistrict) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الرجاء إدخال رقم المبنى واختيار الحي." });
      return;
    }
    try {
      const { error } = await supabase.from('buildings').insert([{ building_number: newBuildingNumber, address: newBuildingAddress || null, building_code: newBuildingNumber, district_id: newBuildingDistrict }]);
      if (error) throw error;

      toast({ title: "تم بنجاح", description: "تم إضافة المبنى بنجاح." });
      setNewBuildingNumber('');
      setNewBuildingAddress('');
      setNewBuildingDistrict('');
      setShowAddBuilding(false);
      fetchBuildings();
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في إضافة المبنى";
      toast({ variant: "destructive", title: "خطأ", description: message });
    }
  };

  const totalPages = Math.ceil(totalBuildings / PAGE_SIZE);

  const representativeOptions = useMemo(() => (
    representatives.map(rep => (
      <SelectItem key={rep.id} value={rep.id}>
        {rep.full_name} ({rep.building_count}/6)
      </SelectItem>
    ))
  ), [representatives]);

  return (
    <div className="space-y-6">
      <Card className="card-premium">
        <CardHeader><CardTitle className="flex items-center gap-3 text-2xl"><MapPin className="w-7 h-7 text-primary" />إدارة التعيين</CardTitle></CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Assignment & Actions Section */}
        <Card className="card-accent">
          <CardHeader><CardTitle className="text-xl">الأوامر والتعيين</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium"><User className="w-4 h-4 text-primary" />اختر المندوب</Label>
              <Select value={selectedRep} onValueChange={setSelectedRep}><SelectTrigger className="shadow-card"><SelectValue placeholder="اختر مندوب..." /></SelectTrigger><SelectContent>{representativeOptions}</SelectContent></Select>
            </div>
            
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">اختر مبنى أو أكثر من القائمة على اليسار لتنفيذ أمر التعيين أو إلغاء التعيين.</p>
            {selectedBuildings.length > 0 && <div className="status-success">تم اختيار {selectedBuildings.length} مبنى</div>}

            <div className="flex gap-3">
              <Button onClick={handleAssignBuildings} className="w-full btn-primary" disabled={saving || !selectedRep || selectedBuildings.length === 0}>{saving ? "جاري الحفظ..." : "تعيين المحدد"}</Button>
              <Button onClick={handleUnassignBuildings} variant="destructive" className="w-full" disabled={saving || selectedBuildings.length === 0}>{saving ? "جاري الحفظ..." : "إلغاء تعيين المحدد"}</Button>
            </div>
          </CardContent>
        </Card>

        {/* Buildings List & Filters */}
        <Card className="card-premium">
          <CardHeader><CardTitle className="text-xl">قائمة المباني ({totalBuildings})</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="بحث بالرقم أو العنوان..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 shadow-card" />
              </div>
              <Select value={selectedDistrict} onValueChange={(value) => { setSelectedDistrict(value); setCurrentPage(0); }}>
                <SelectTrigger className="shadow-card"><SelectValue placeholder="فلترة حسب الحي..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأحياء</SelectItem>
                  {districts.map(d => <SelectItem key={d.id} value={d.id}>{d.name_ar}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="min-h-[400px]">
              {loading ? <div className="flex items-center justify-center py-12"><div className="pulse-glow p-4 rounded-lg"><Building className="w-8 h-8 text-primary animate-pulse" /><p className="mt-2 text-sm text-muted-foreground">جاري تحميل المباني...</p></div></div>
              : buildings.length === 0 ? <div className="text-center py-12"><Building className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" /><p className="text-muted-foreground text-lg">لا توجد مباني تطابق البحث</p></div>
              : <div className="space-y-3">{buildings.map(building => (
                  <div key={building.id} onClick={() => setSelectedBuildings(prev => prev.includes(building.id) ? prev.filter(id => id !== building.id) : [...prev, building.id])} className={`p-4 border rounded-lg cursor-pointer flex justify-between items-center transition-smooth ${selectedBuildings.includes(building.id) ? 'bg-primary/10 border-primary shadow-campaign scale-[1.02]' : 'hover:bg-muted/50 hover:shadow-card hover:scale-[1.01]'}`}>
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">المبنى رقم {building.building_number}</p>
                      {building.address && <p className="text-sm text-muted-foreground">{building.address}</p>}
                      <p className="text-sm">{building.representative_name ? <span className="status-success">معين لـ: {building.representative_name}</span> : <span className="status-progress">غير معين</span>}</p>
                    </div>
                    {selectedBuildings.includes(building.id) && <CheckCircle className="w-6 h-6 text-primary" />}
                  </div>))}
                </div>}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t">
                 <Dialog open={showAddBuilding} onOpenChange={setShowAddBuilding}>
                  <DialogTrigger asChild><Button className="flex items-center gap-2 btn-primary"><Plus className="w-4 h-4" />إضافة مبنى</Button></DialogTrigger>
                  <DialogContent className="card-premium">
                    <DialogHeader><DialogTitle className="text-xl">إضافة مبنى جديد</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2"><Label>الحي</Label><Select value={newBuildingDistrict} onValueChange={setNewBuildingDistrict}><SelectTrigger><SelectValue placeholder="اختر الحي..." /></SelectTrigger><SelectContent>{districts.map(d => <SelectItem key={d.id} value={d.id}>{d.name_ar}</SelectItem>)}</SelectContent></Select></div>
                      <div className="space-y-2"><Label>رقم المبنى</Label><Input value={newBuildingNumber} onChange={(e) => setNewBuildingNumber(e.target.value)} placeholder="أدخل رقم المبنى" /></div>
                      <div className="space-y-2"><Label>العنوان (اختياري)</Label><Input value={newBuildingAddress} onChange={(e) => setNewBuildingAddress(e.target.value)} placeholder="أدخل عنوان المبنى" /></div>
                      <Button onClick={addBuilding} className="w-full btn-primary">إضافة المبنى</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}><ChevronRight className="h-4 w-4" /></Button>
                  <div className="px-4 py-2 bg-muted rounded-lg text-sm font-medium">صفحة {currentPage + 1} من {totalPages}</div>
                  <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages - 1}><ChevronLeft className="h-4 w-4" /></Button>
                </div>
              </div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAssignmentManager;
