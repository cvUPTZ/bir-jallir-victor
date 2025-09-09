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
import { Users, Plus, Edit, Trash2, Star } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  responsibilities: string[];
  status: string;
  team_type: string;
}

const AdminTeamManager = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    responsibilities: '',
    status: 'نشط',
    team_type: 'متخصص'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('team_type', { ascending: false })
        .order('name');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في تحميل أعضاء الفريق";
      toast({ variant: "destructive", title: "خطأ", description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.role) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الرجاء ملء جميع الحقول المطلوبة." });
      return;
    }

    const responsibilities = formData.responsibilities
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    try {
      if (editingMember) {
        const { error } = await supabase
          .from('team_members')
          .update({
            name: formData.name,
            role: formData.role,
            responsibilities,
            status: formData.status,
            team_type: formData.team_type
          })
          .eq('id', editingMember.id);

        if (error) throw error;
        toast({ title: "تم بنجاح", description: "تم تحديث عضو الفريق بنجاح." });
      } else {
        const { error } = await supabase
          .from('team_members')
          .insert({
            name: formData.name,
            role: formData.role,
            responsibilities,
            status: formData.status,
            team_type: formData.team_type
          });

        if (error) throw error;
        toast({ title: "تم بنجاح", description: "تم إضافة عضو الفريق بنجاح." });
      }

      resetForm();
      fetchTeamMembers();
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في الحفظ";
      toast({ variant: "destructive", title: "خطأ", description: message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "تم بنجاح", description: "تم حذف عضو الفريق بنجاح." });
      fetchTeamMembers();
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في الحذف";
      toast({ variant: "destructive", title: "خطأ", description: message });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      responsibilities: '',
      status: 'نشط',
      team_type: 'متخصص'
    });
    setEditingMember(null);
    setShowAddDialog(false);
  };

  const startEdit = (member: TeamMember) => {
    setFormData({
      name: member.name,
      role: member.role,
      responsibilities: member.responsibilities.join('\n'),
      status: member.status,
      team_type: member.team_type
    });
    setEditingMember(member);
    setShowAddDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "نشط": return "default";
      case "غير نشط": return "secondary";
      default: return "outline";
    }
  };

  const getTeamTypeColor = (type: string) => {
    switch (type) {
      case "قيادة": return "destructive";
      case "متخصص": return "secondary";
      default: return "outline";
    }
  };

  if (loading) {
    return <div>جاري تحميل أعضاء الفريق...</div>;
  }

  const leadershipTeam = teamMembers.filter(member => member.team_type === 'قيادة');
  const specializedTeams = teamMembers.filter(member => member.team_type === 'متخصص');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">إدارة الفريق</h2>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => resetForm()}>
              <Plus className="w-4 h-4" />
              إضافة عضو جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? 'تعديل عضو الفريق' : 'إضافة عضو جديد'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>الاسم</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="اسم العضو"
                />
              </div>
              <div className="space-y-2">
                <Label>الدور</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="دور العضو"
                />
              </div>
              <div className="space-y-2">
                <Label>المسؤوليات</Label>
                <Textarea
                  value={formData.responsibilities}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
                  placeholder="مسؤولية واحدة في كل سطر"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>نوع الفريق</Label>
                <Select value={formData.team_type} onValueChange={(value) => setFormData(prev => ({ ...prev, team_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="قيادة">القيادة المركزية</SelectItem>
                    <SelectItem value="متخصص">فريق متخصص</SelectItem>
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
                    <SelectItem value="غير نشط">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  {editingMember ? 'تحديث' : 'إضافة'}
                </Button>
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* القيادة المركزية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            القيادة المركزية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leadershipTeam.map((member) => (
              <div key={member.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEdit(member)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(member.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <Badge variant={getStatusColor(member.status)}>{member.status}</Badge>
                  <Badge variant={getTeamTypeColor(member.team_type)}>{member.team_type}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <strong>المسؤوليات:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {member.responsibilities.map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* الفرق المتخصصة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            الفرق المتخصصة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specializedTeams.map((member) => (
              <div key={member.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEdit(member)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(member.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <Badge variant={getStatusColor(member.status)}>{member.status}</Badge>
                  <Badge variant={getTeamTypeColor(member.team_type)}>{member.team_type}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <strong>المسؤوليات:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {member.responsibilities.map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTeamManager;