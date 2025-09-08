import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const RepresentativeDashboard = () => {
  const { profile } = useAuth();

  return (
    <div className="space-y-4 p-4 md:p-8 pt-6">
      <h1 className="text-3xl font-bold tracking-tight">لوحة تحكم المندوب</h1>
      <p className="text-muted-foreground">
        أهلاً بك، {profile?.full_name || 'المستخدم'}. هنا يمكنك متابعة مهامك.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <Card>
           <CardHeader>
             <CardTitle>مرحباً بك</CardTitle>
             <CardDescription>هذه هي لوحة التحكم الخاصة بك.</CardDescription>
           </CardHeader>
           <CardContent>
             <p>محتوى لوحة التحكم للمندوب سيكون هنا.</p>
           </CardContent>
         </Card>
      </div>
    </div>
  );
};

export default RepresentativeDashboard;
