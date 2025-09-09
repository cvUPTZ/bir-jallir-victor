import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Users, DollarSign, MapPin, Target, Building, UserCog } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminTeamManager from '@/components/AdminTeamManager';
import AdminBudgetManager from '@/components/AdminBudgetManager';
import AdminDistrictsManager from '@/components/AdminDistrictsManager';
import AdminStrategyManager from '@/components/AdminStrategyManager';
import AdminAssignmentManager from '@/components/AdminAssignmentManager';
import AdminUserManagement from '@/components/AdminUserManagement';

const Admin = () => {
  return (
    <div className="space-y-6" dir="rtl">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-primary">
            <Shield className="w-6 h-6" />
            لوحة تحكم المسؤول
          </CardTitle>
          <CardDescription>إدارة الحملة الانتخابية وتعيين المهام.</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="assignments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserCog className="w-4 h-4" />
            المستخدمين
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            التعيينات
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            الفريق
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            الميزانية
          </TabsTrigger>
          <TabsTrigger value="districts" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            المناطق
          </TabsTrigger>
          <TabsTrigger value="strategy" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            الاستراتيجية
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <AdminUserManagement />
        </TabsContent>

        <TabsContent value="assignments">
          <AdminAssignmentManager />
        </TabsContent>

        <TabsContent value="team">
          <AdminTeamManager />
        </TabsContent>

        <TabsContent value="budget">
          <AdminBudgetManager />
        </TabsContent>

        <TabsContent value="districts">
          <AdminDistrictsManager />
        </TabsContent>

        <TabsContent value="strategy">
          <AdminStrategyManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;