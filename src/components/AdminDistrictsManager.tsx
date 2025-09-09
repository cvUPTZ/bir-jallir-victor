import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';

interface District {
  id: string;
  name_ar: string;
  name_fr: string | null;
  coordinator_name: string | null;
  target_votes: number;
  status: string;
  priority_level: string;
}

const AdminDistrictsManager = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    name_ar: '',
    name_fr: '',
    coordinator_name: '',
    target_votes: '',
    status: 'pending',
    priority_level: 'medium'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .order('name_ar');

      if (error) throw error;
      setDistricts(data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في تحميل المناطق";
      toast({ variant: "destructive", title: "خطأ", description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name_ar) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الرجاء إدخال اسم المنطقة بالعربية." });
      return;
    }

    try {
      const districtData = {
        name_ar: formData.name_ar,
        name_fr: formData.name_fr || null,
        coordinator_name: formData.coordinator_name || null,
        target_votes: parseInt(formData.target_votes) || 0,
        status: formData.status,
        priority_level: formData.priority_level
      };

      if (editingDistrict) {
        const { error } = await supabase
          .from('districts')
          .update(districtData)
          .eq('id', editingDistrict.id);

        if (error) throw error;
        toast({ title: "تم بنجاح", description: "تم تحديث المنطقة بنجاح." });
      } else {
        const { error } = await supabase
          .from('districts')
          .insert(districtData);

        if (error) throw error;
        toast({ title: "تم بنجاح", description: "تم إضافة المنطقة بنجاح." });
      }

      resetForm();
      fetchDistricts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في الحفظ";
      toast({ variant: "destructive", title: "خطأ", description: message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('districts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "تم بنجاح", description: "تم حذف المنطقة بنجاح." });
      fetchDistricts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في الحذف";
      toast({ variant: "destructive", title: "خطأ", description: message });
    }
  };

  const resetForm = () => {
    setFormData({
      name_ar: '',
      name_fr: '',
      coordinator_name: '',
      target_votes: '',
      status: 'pending',
      priority_level: 'medium'
    });
    setEditingDistrict(null);
    setShowAddDialog(false);
  };

  const startEdit = (district: District) => {
    setFormData({
      name_ar: district.name_ar,
      name_fr: district.name_fr || '',
      coordinator_name: district.coordinator_name || '',
      target_votes: district.target_votes.toString(),
      status: district.status,
      priority_level: district.priority_level
    });
    setEditingDistrict(district);
    setShowAddDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "pending": return "secondary";
      case "completed": return "outline";
      default: return "secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "نشط";
      case "pending": return "في الانتظار";
      case "completed": return "مكتمل";
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high": return "عالية";
      case "medium": return "متوسطة";
      case "low": return "منخفضة";
      default: return priority;
    }
  };

  if (loading) {
    return <div>جاري تحميل المناطق...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">إدارة المناطق</h2>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => resetForm()}>
              <Plus className="w-4 h-4" />
              إضافة منطقة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingDistrict ? 'تعديل المنطقة' : 'إضافة منطقة جديدة'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>الاسم بالعربية</Label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                  placeholder="اسم المنطقة"
                />
              </div>
              <div className="space-y-2">
                <Label>الاسم بالفرنسية</Label>
                <Input
                  value={formData.name_fr}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_fr: e.target.value }))}
                  placeholder="Nom de la région"
                />
              </div>
              <div className="space-y-2">
                <Label>اسم المنسق</Label>
                <Input
                  value={formData.coordinator_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, coordinator_name: e.target.value }))}
                  placeholder="اسم المنسق المسؤول"
                />
              </div>
              <div className="space-y-2">
                <Label>الأصوات المستهدفة</Label>
                <Input
                  type="number"
                  value={formData.target_votes}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_votes: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>مستوى الأولوية</Label>
                <Select value={formData.priority_level} onValueChange={(value) => setFormData(prev => ({ ...prev, priority_level: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="low">منخفضة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="pending">في الانتظار</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  {editingDistrict ? 'تحديث' : 'إضافة'}
                </Button>
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Districts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {districts.map((district) => (
          <Card key={district.id} className="h-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{district.name_ar}</CardTitle>
                  {district.name_fr && (
                    <p className="text-sm text-muted-foreground">{district.name_fr}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => startEdit(district)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(district.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Badge variant={getStatusColor(district.status)}>
                  {getStatusText(district.status)}
                </Badge>
                <Badge variant={getPriorityColor(district.priority_level)}>
                  {getPriorityText(district.priority_level)}
                </Badge>
              </div>
              
              {district.coordinator_name && (
                <div className="text-sm">
                  <strong>المنسق:</strong> {district.coordinator_name}
                </div>
              )}
              
              <div className="text-sm">
                <strong>الأصوات المستهدفة:</strong> {district.target_votes.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDistrictsManager;