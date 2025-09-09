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
import { Progress } from '@/components/ui/progress';
import { DollarSign, Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface BudgetItem {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  description: string | null;
  priority: string;
  status: string;
}

const AdminBudgetManager = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    allocated: '',
    spent: '',
    description: '',
    priority: 'متوسطة',
    status: 'نشط'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBudgetItems();
  }, []);

  const fetchBudgetItems = async () => {
    try {
      const { data, error } = await supabase
        .from('budget_items')
        .select('*')
        .order('allocated', { ascending: false });

      if (error) throw error;
      setBudgetItems(data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في تحميل بنود الميزانية";
      toast({ variant: "destructive", title: "خطأ", description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.category || !formData.allocated) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الرجاء ملء جميع الحقول المطلوبة." });
      return;
    }

    try {
      const itemData = {
        category: formData.category,
        allocated: parseFloat(formData.allocated),
        spent: parseFloat(formData.spent) || 0,
        description: formData.description || null,
        priority: formData.priority,
        status: formData.status
      };

      if (editingItem) {
        const { error } = await supabase
          .from('budget_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast({ title: "تم بنجاح", description: "تم تحديث بند الميزانية بنجاح." });
      } else {
        const { error } = await supabase
          .from('budget_items')
          .insert(itemData);

        if (error) throw error;
        toast({ title: "تم بنجاح", description: "تم إضافة بند الميزانية بنجاح." });
      }

      resetForm();
      fetchBudgetItems();
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في الحفظ";
      toast({ variant: "destructive", title: "خطأ", description: message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budget_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "تم بنجاح", description: "تم حذف بند الميزانية بنجاح." });
      fetchBudgetItems();
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في الحذف";
      toast({ variant: "destructive", title: "خطأ", description: message });
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      allocated: '',
      spent: '',
      description: '',
      priority: 'متوسطة',
      status: 'نشط'
    });
    setEditingItem(null);
    setShowAddDialog(false);
  };

  const startEdit = (item: BudgetItem) => {
    setFormData({
      category: item.category,
      allocated: item.allocated.toString(),
      spent: item.spent.toString(),
      description: item.description || '',
      priority: item.priority,
      status: item.status
    });
    setEditingItem(item);
    setShowAddDialog(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "عالية": return "destructive";
      case "متوسطة": return "secondary";
      case "منخفضة": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "نشط": return "default";
      case "احتياطي": return "secondary";
      case "مكتمل": return "outline";
      default: return "outline";
    }
  };

  const getSpentPercentage = (spent: number, allocated: number) => {
    return allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
  };

  const totalBudget = budgetItems.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const remainingBudget = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  if (loading) {
    return <div>جاري تحميل بنود الميزانية...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">إدارة الميزانية</h2>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => resetForm()}>
              <Plus className="w-4 h-4" />
              إضافة بند جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'تعديل بند الميزانية' : 'إضافة بند جديد'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>الفئة</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="مثل: الدعاية والإعلان"
                />
              </div>
              <div className="space-y-2">
                <Label>المبلغ المخصص</Label>
                <Input
                  type="number"
                  value={formData.allocated}
                  onChange={(e) => setFormData(prev => ({ ...prev, allocated: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>المبلغ المنفق</Label>
                <Input
                  type="number"
                  value={formData.spent}
                  onChange={(e) => setFormData(prev => ({ ...prev, spent: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف البند وتفاصيله"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>الأولوية</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="عالية">عالية</SelectItem>
                    <SelectItem value="متوسطة">متوسطة</SelectItem>
                    <SelectItem value="منخفضة">منخفضة</SelectItem>
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
                    <SelectItem value="نشط">نشط</SelectItem>
                    <SelectItem value="احتياطي">احتياطي</SelectItem>
                    <SelectItem value="مكتمل">مكتمل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  {editingItem ? 'تحديث' : 'إضافة'}
                </Button>
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الميزانية الإجمالية</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBudget.toLocaleString()} دج</div>
            <p className="text-xs text-muted-foreground">
              للحملة الانتخابية الكاملة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المبلغ المنفق</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-campaign-progress">{totalSpent.toLocaleString()} دج</div>
            <p className="text-xs text-muted-foreground">
              {spentPercentage.toFixed(1)}% من الميزانية
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المبلغ المتبقي</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-campaign-success">{remainingBudget.toLocaleString()} دج</div>
            <p className="text-xs text-muted-foreground">
              {(100 - spentPercentage).toFixed(1)}% متاح للإنفاق
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Items */}
      <Card>
        <CardHeader>
          <CardTitle>بنود الميزانية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {budgetItems.map((item) => {
              const spentPercentage = getSpentPercentage(item.spent, item.allocated);
              const isOverBudget = spentPercentage > 90;
              
              return (
                <div key={item.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{item.category}</h3>
                      <Badge variant={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                      <Badge variant={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => startEdit(item)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>المخصص</span>
                        <span className="font-semibold">{item.allocated.toLocaleString()} دج</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>المنفق</span>
                        <span className={`font-semibold ${isOverBudget ? 'text-destructive' : 'text-campaign-progress'}`}>
                          {item.spent.toLocaleString()} دج
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>المتبقي</span>
                        <span className="font-semibold text-campaign-success">
                          {(item.allocated - item.spent).toLocaleString()} دج
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>نسبة الإنفاق</span>
                      <span className="flex items-center gap-1">
                        {spentPercentage}%
                      </span>
                    </div>
                    <Progress 
                      value={spentPercentage} 
                      className={`h-2 ${isOverBudget ? 'bg-destructive/20' : ''}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBudgetManager;