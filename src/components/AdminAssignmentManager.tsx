import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { User, MapPin, Building, CheckCircle, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
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
}

interface BuildingData {
  id: string;
  building_number: string;
  assigned_representative_id: string | null;
  address: string | null;
  building_code: string | null;
  district_name?: string;
  representative_name?: string;
}

const AdminAssignmentManager = () => {
  const [representatives, setRepresentatives] = useState<Profile[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [buildings, setBuildings] = useState<BuildingData[]>([]);
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

      // Fetch districts
      const { data: districtsData, error: districtsError } = await supabase
        .from('districts')
        .select('id, name_ar')
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
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('building_number');
      
      // For now, let's not filter by district since the column structure is unclear
      const { data: buildingsData, error: buildingsError, count } = await query;
      if (buildingsError) throw buildingsError;
      
      // Process buildings data
      const processedBuildings = await Promise.all(
        (buildingsData || []).map(async (building: any) => {
          const buildingDetail: BuildingData = {
            id: building.id,
            building_number: building.building_number || building.building_code || '',
            assigned_representative_id: building.assigned_representative_id,
            address: building.address,
            building_code: building.building_code,
          };
          
          // Fetch representative name if assigned
          if (building.assigned_representative_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', building.assigned_representative_id)
              .maybeSingle();
            if (profileData) {
              buildingDetail.representative_name = profileData.full_name;
            }
          }
          
          return buildingDetail;
        })
      );
      
      setBuildings(processedBuildings);
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
    fetchBuildings(0);
  }, [fetchBuildings]);

  useEffect(() => {
    fetchBuildings(currentPage);
  }, [fetchBuildings, currentPage]);

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
      for (const buildingId of selectedBuildings) {
        const { error } = await supabase
          .from('buildings')
          .update({ assigned_representative_id: selectedRep })
          .eq('id', buildingId);
        
        if (error) throw error;
      }

      toast({ title: "تم بنجاح", description: "تم تعيين المباني بنجاح." });
      fetchBuildings(currentPage);
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
    if (!newBuildingNumber) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الرجاء إدخال رقم المبنى." });
      return;
    }

    try {
      const { error } = await supabase
        .from('buildings')
        .insert([{
          building_number: newBuildingNumber,
          address: newBuildingAddress || null,
          building_code: newBuildingNumber
        }]);

      if (error) throw error;

      toast({ title: "تم بنجاح", description: "تم إضافة المبنى بنجاح." });
      setNewBuildingNumber('');
      setNewBuildingAddress('');
      setShowAddBuilding(false);
      fetchBuildings(currentPage);
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في إضافة المبنى";
      toast({ variant: "destructive", title: "خطأ", description: message });
    }
  };

  const totalPages = Math.ceil(totalBuildings / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <MapPin className="w-7 h-7 text-primary" />
            إدارة تعيين المباني للمندوبين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <Dialog open={showAddBuilding} onOpenChange={setShowAddBuilding}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 btn-primary">
                  <Plus className="w-4 h-4" />
                  إضافة مبنى جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="card-premium">
                <DialogHeader>
                  <DialogTitle className="text-xl">إضافة مبنى جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">رقم المبنى</Label>
                    <Input
                      type="text"
                      value={newBuildingNumber}
                      onChange={(e) => setNewBuildingNumber(e.target.value)}
                      placeholder="أدخل رقم المبنى"
                      className="shadow-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">العنوان (اختياري)</Label>
                    <Input
                      value={newBuildingAddress}
                      onChange={(e) => setNewBuildingAddress(e.target.value)}
                      placeholder="أدخل عنوان المبنى"
                      className="shadow-card"
                    />
                  </div>
                  <Button onClick={addBuilding} className="w-full btn-primary">
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
        <Card className="card-accent">
          <CardHeader>
            <CardTitle className="text-xl">تعيين المباني للمندوبين</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4 text-primary" /> 
                اختر المندوب
              </Label>
              <Select value={selectedRep} onValueChange={setSelectedRep}>
                <SelectTrigger className="shadow-card">
                  <SelectValue placeholder="اختر مندوب..." />
                </SelectTrigger>
                <SelectContent>
                  {representatives.map(rep => (
                    <SelectItem key={rep.id} value={rep.id}>{rep.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Building className="w-4 h-4 text-primary" /> 
                اختر المباني
              </Label>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                اختر مبنى أو أكثر من القائمة على اليمين (الحد الأقصى 6 مباني لكل مندوب).
              </p>
              {selectedBuildings.length > 0 && (
                <div className="status-success">
                  تم اختيار {selectedBuildings.length} مبنى
                </div>
              )}
            </div>
            <Button 
              onClick={handleAssignBuildings} 
              className="w-full btn-primary" 
              disabled={saving || !selectedRep || selectedBuildings.length === 0}
            >
              {saving ? "جاري التعيين..." : "تعيين المباني المحددة"}
            </Button>
          </CardContent>
        </Card>

        {/* Buildings List */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-xl">قائمة المباني</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="min-h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="pulse-glow p-4 rounded-lg">
                    <Building className="w-8 h-8 text-primary animate-pulse" />
                    <p className="mt-2 text-sm text-muted-foreground">جاري تحميل المباني...</p>
                  </div>
                </div>
              ) : buildings.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-lg">لا توجد مباني</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {buildings.map(building => (
                    <div
                      key={building.id}
                      onClick={() => {
                        const newSelection = selectedBuildings.includes(building.id)
                          ? selectedBuildings.filter(id => id !== building.id)
                          : [...selectedBuildings, building.id];
                        setSelectedBuildings(newSelection);
                      }}
                      className={`p-4 border rounded-lg cursor-pointer flex justify-between items-center transition-smooth ${
                        selectedBuildings.includes(building.id) 
                          ? 'bg-primary/10 border-primary shadow-campaign scale-[1.02]' 
                          : 'hover:bg-muted/50 hover:shadow-card hover:scale-[1.01]'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">
                          المبنى رقم {building.building_number}
                        </p>
                        {building.address && (
                          <p className="text-sm text-muted-foreground">{building.address}</p>
                        )}
                        <p className="text-sm">
                          {building.representative_name ? (
                            <span className="status-success">معين لـ: {building.representative_name}</span>
                          ) : (
                            <span className="status-progress">غير معين</span>
                          )}
                        </p>
                      </div>
                      {selectedBuildings.includes(building.id) && (
                        <CheckCircle className="w-6 h-6 text-primary animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center pt-6 border-t">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setCurrentPage(p => p - 1)} 
                    disabled={currentPage === 0}
                    className="shadow-card hover:shadow-campaign"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="px-4 py-2 bg-muted rounded-lg text-sm font-medium">
                    صفحة {currentPage + 1} من {totalPages}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setCurrentPage(p => p + 1)} 
                    disabled={currentPage >= totalPages - 1}
                    className="shadow-card hover:shadow-campaign"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAssignmentManager;