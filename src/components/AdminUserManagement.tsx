import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Users, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles with their details
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, role, user_id');

      if (profilesError) throw profilesError;

      // Fetch email from auth metadata for each user
      const usersWithEmails = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: authData } = await supabase.auth.admin.getUserById(profile.user_id);
          return {
            id: profile.id,
            full_name: profile.full_name,
            email: authData?.user?.email || 'N/A',
            role: profile.role
          };
        })
      );

      setUsers(usersWithEmails);
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في تحميل المستخدمين";
      toast({ variant: "destructive", title: "خطأ", description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      toast({ title: "تم بنجاح", description: "تم تحديث دور المستخدم بنجاح." });
      fetchUsers(); // Refresh the list
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطأ في تحديث الدور";
      toast({ variant: "destructive", title: "خطأ", description: message });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Note: Deleting a user from auth.users is a protected operation
    // and should be handled with a server-side function with service_role key.
    // This is a placeholder for now.
    toast({ variant: "default", title: "قيد الإنشاء", description: "حذف المستخدم قيد الإنشاء" });
    console.log("Delete user:", userId);
  };

  if (loading) {
    return <div>جاري تحميل المستخدمين...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          إدارة المستخدمين
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم الكامل</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>الدور</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="اختر دورًا" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">مسؤول</SelectItem>
                      <SelectItem value="representative">مندوب</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminUserManagement;
