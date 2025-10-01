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
import { Target, Plus, Edit, Trash2, Zap } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface StrategyItem {
  id: string;
  title: string;
  priority: string;
  progress: number;
  status: string;
  tactics: Array<{
    name: string;
    target: string;
    timing: string;
    message: string;
    progress: number;
  }>;
}

const AdminStrategyManager = () => {
  const [strategies, setStrategies] = useState<StrategyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStrategy, setEditingStrategy] = useState<StrategyItem | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    priority: 'متوسطة',
    progress: '0',
    status: 'طور',
    tactics: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const { data, error } = await supabase
        .from('strategy_items')
        .select('*')
        .order('priority', { ascending: false })
        .order('title');

      if (error) throw error;
      
      // Transform the data to ensure tactics is properly typed
      const transformedData = (data || []).map(item => ({
        ...item,
        tactics: Array.isArray(item.tactics) ? item.tactics as Array<{
          name: string;
          target: string;
          timing: string;
          message: string;
          progress: number;
        }> : []
      }));
      
      setStrategies(transformedData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في تحميل الاستراتيجيات";
      toast({ variant: "destructive", title: "خطأ", description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الرجاء إدخال عنوان الاستراتيجية." });
      return;
    }

    let tactics: any[] = [];
    if (formData.tactics) {
      try {
        // Parse tactics from textarea (JSON format)
        tactics = JSON.parse(formData.tactics);
      } catch {
        // If not JSON, treat as simple list
        tactics = formData.tactics.split('\n')
          .map(line => line.trim())
          .filter(line => line)
          .map(line => ({
            name: line,
            target: '',
            timing: '',
            message: '',
            progress: 0
          }));
      }
    }

    try {
      const strategyData = {
        title: formData.title,
        priority: formData.priority,
        progress: parseInt(formData.progress) || 0,
        status: formData.status,
        tactics: tactics
      };

      if (editingStrategy) {
        const { error } = await supabase
          .from('strategy_items')
          .update(strategyData)
          .eq('id', editingStrategy.id);

        if (error) throw error;
        toast({ title: "تم بنجاح", description: "تم تحديث الاستراتيجية بنجاح." });
      } else {
        const { error } = await supabase
          .from('strategy_items')
          .insert(strategyData);

        if (error) throw error;
        toast({ title: "تم بنجاح", description: "تم إضافة الاستراتيجية بنجاح." });
      }

      resetForm();
      fetchStrategies();
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في الحفظ";
      toast({ variant: "destructive", title: "خطأ", description: message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('strategy_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "تم بنجاح", description: "تم حذف الاستراتيجية بنجاح." });
      fetchStrategies();
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في الحذف";
      toast({ variant: "destructive", title: "خطأ", description: message });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      priority: 'متوسطة',
      progress: '0',
      status: 'طور',
      tactics: ''
    });
    setEditingStrategy(null);
    setShowAddDialog(false);
  };

  const startEdit = (strategy: StrategyItem) => {
    setFormData({
      title: strategy.title,
      priority: strategy.priority,
      progress: strategy.progress.toString(),
      status: strategy.status,
      tactics: JSON.stringify(strategy.tactics, null, 2)
    });
    setEditingStrategy(strategy);
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
      case "مكتملة": return "default";
      case "قيد التنفيذ": return "secondary";
      case "طور": return "outline";
      default: return "secondary";
    }
  };

  if (loading) {
    return <div>جاري تحميل الاستراتيجيات...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">إدارة الاستراتيجية</h2>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => resetForm()}>
              <Plus className="w-4 h-4" />
              إضافة استراتيجية جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingStrategy ? 'تعديل الاستراتيجية' : 'إضافة استراتيجية جديدة'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>عنوان الاستراتيجية</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="مثل: استراتيجية التواصل المباشر"
                />
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مكتملة">مكتملة</SelectItem>
                    <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
                    <SelectItem value="طور">طور</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>نسبة التقدم (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData(prev => ({ ...prev, progress: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>التكتيكات (JSON أو قائمة بسيطة)</Label>
                <Textarea
                  value={formData.tactics}
                  onChange={(e) => setFormData(prev => ({ ...prev, tactics: e.target.value }))}
                  placeholder={`يمكنك إدخال قائمة بسيطة:
الزيارات المنزلية
الاجتماعات المجتمعية

أو استخدام JSON:
[
  {
    "name": "الزيارات المنزلية",
    "target": "10 بيوت/يوم/منسق",
    "timing": "المساء (6-9 مساءً)",
    "message": "حلول محلية",
    "progress": 80
  }
]`}
                  rows={8}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  {editingStrategy ? 'تحديث' : 'إضافة'}
                </Button>
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {strategies.map((strategy) => (
          <Card key={strategy.id} className="h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    {strategy.title}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => startEdit(strategy)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(strategy.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getPriorityColor(strategy.priority)}>
                  {strategy.priority}
                </Badge>
                <Badge variant={getStatusColor(strategy.status)}>
                  {strategy.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>التقدم العام</span>
                  <span className="font-semibold">{strategy.progress}%</span>
                </div>
                <Progress value={strategy.progress} className="h-2" />
              </div>

              {strategy.tactics && strategy.tactics.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">التكتيكات:</h4>
                  {strategy.tactics.map((tactic, tacticIndex) => (
                    <div key={tacticIndex} className="p-3 border rounded-lg space-y-2">
                      <div className="font-medium text-sm">{tactic.name}</div>
                      {tactic.target && (
                        <div className="text-xs text-muted-foreground">
                          <strong>الهدف:</strong> {tactic.target}
                        </div>
                      )}
                      {tactic.timing && (
                        <div className="text-xs text-muted-foreground">
                          <strong>التوقيت:</strong> {tactic.timing}
                        </div>
                      )}
                      {tactic.message && (
                        <div className="text-xs text-muted-foreground">
                          <strong>الرسالة:</strong> {tactic.message}
                        </div>
                      )}
                      {tactic.progress !== undefined && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>التقدم</span>
                            <span>{tactic.progress}%</span>
                          </div>
                          <Progress value={tactic.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminStrategyManager;