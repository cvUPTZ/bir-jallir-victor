import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const CampaignBudget = () => {
  const budgetItems = [
    {
      category: "الدعاية والإعلان",
      allocated: 150000,
      spent: 95000,
      percentage: 35,
      description: "ملصقات، راديو، صحف",
      priority: "عالية",
      status: "نشط"
    },
    {
      category: "اللوجستيات",
      allocated: 100000,
      spent: 45000,
      percentage: 25,
      description: "نقل، وقود، مقرات",
      priority: "عالية", 
      status: "نشط"
    },
    {
      category: "الفعاليات",
      allocated: 80000,
      spent: 30000,
      percentage: 20,
      description: "اجتماعات، ضيافة",
      priority: "متوسطة",
      status: "نشط"
    },
    {
      category: "الرواتب والحوافز",
      allocated: 60000,
      spent: 20000,
      percentage: 15,
      description: "منسقين، متطوعين",
      priority: "عالية",
      status: "نشط"
    },
    {
      category: "طوارئ",
      allocated: 20000,
      spent: 2000,
      percentage: 5,
      description: "أحداث غير متوقعة",
      priority: "منخفضة",
      status: "احتياطي"
    }
  ];

  const totalBudget = 410000;
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const remainingBudget = totalBudget - totalSpent;
  const spentPercentage = (totalSpent / totalBudget) * 100;

  const monthlyDistribution = [
    { month: "الشهر الأول", percentage: 40, amount: 164000, description: "بناء البنية التحتية" },
    { month: "الشهر الثاني", percentage: 45, amount: 184500, description: "الحملة المكثفة" },
    { month: "الشهر الثالث", percentage: 15, amount: 61500, description: "الحسم النهائي" }
  ];

  const expenses = [
    { item: "طباعة الملصقات", amount: 25000, date: "2024-01-15", category: "دعاية", status: "مدفوع" },
    { item: "إعلانات راديو", amount: 30000, date: "2024-01-10", category: "إعلان", status: "مدفوع" },
    { item: "وقود السيارات", amount: 15000, date: "2024-01-12", category: "نقل", status: "مدفوع" },
    { item: "ضيافة اجتماعات", amount: 8000, date: "2024-01-14", category: "فعاليات", status: "مدفوع" },
    { item: "حوافز المنسقين", amount: 20000, date: "2024-01-01", category: "رواتب", status: "مدفوع" }
  ];

  const getSpentPercentage = (spent: number, allocated: number) => {
    return Math.round((spent / allocated) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "نشط": return "campaign-success";
      case "احتياطي": return "campaign-progress";
      case "مكتمل": return "primary";
      default: return "muted";
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "عالية": return "destructive";
      case "متوسطة": return "secondary";
      case "منخفضة": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
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
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-campaign-success">{remainingBudget.toLocaleString()} دج</div>
            <p className="text-xs text-muted-foreground">
              {(100 - spentPercentage).toFixed(1)}% متاح للإنفاق
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            توزيع الميزانية بالفئات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {budgetItems.map((item, index) => {
              const spentPercentage = getSpentPercentage(item.spent, item.allocated);
              const isOverBudget = spentPercentage > 90;
              
              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{item.category}</h3>
                      <Badge variant={getPriorityVariant(item.priority)}>
                        {item.priority}
                      </Badge>
                      <Badge variant={item.status === "نشط" ? "default" : "secondary"}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium">{item.percentage}%</span>
                      <div className="text-xs text-muted-foreground">من الإجمالي</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  
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
                        <span className={`font-semibold ${isOverBudget ? 'text-danger' : 'text-campaign-progress'}`}>
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
                        {isOverBudget && <AlertTriangle className="h-3 w-3 text-danger" />}
                        {spentPercentage}%
                      </span>
                    </div>
                    <Progress 
                      value={spentPercentage} 
                      className={`h-2 ${isOverBudget ? 'bg-danger/20' : ''}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            التوزيع الزمني للإنفاق
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {monthlyDistribution.map((period, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="text-center mb-3">
                  <h3 className="font-semibold text-lg">{period.month}</h3>
                  <p className="text-sm text-muted-foreground">{period.description}</p>
                </div>
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{period.percentage}%</div>
                    <div className="text-sm font-medium">{period.amount.toLocaleString()} دج</div>
                  </div>
                  <Progress value={period.percentage} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            المصروفات الأخيرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenses.map((expense, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-campaign-success" />
                  <div>
                    <div className="font-medium">{expense.item}</div>
                    <div className="text-sm text-muted-foreground">{expense.date}</div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-semibold">{expense.amount.toLocaleString()} دج</div>
                  <Badge variant="outline" className="text-xs">
                    {expense.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignBudget;