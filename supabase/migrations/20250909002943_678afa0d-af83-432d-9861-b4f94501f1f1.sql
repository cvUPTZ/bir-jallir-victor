-- Create cities table if not exists
CREATE TABLE IF NOT EXISTS public.cities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar text NOT NULL,
  name_fr text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create buildings table for the batiment system
CREATE TABLE IF NOT EXISTS public.buildings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_number integer NOT NULL,
  city_id uuid REFERENCES public.cities(id),
  assigned_representative_id uuid REFERENCES public.profiles(id),
  address text,
  total_apartments integer DEFAULT 0,
  surveyed_apartments integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(city_id, building_number)
);

-- Add city reference to residential squares
ALTER TABLE public.residential_squares 
ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES public.cities(id),
ADD COLUMN IF NOT EXISTS building_id uuid REFERENCES public.buildings(id);

-- Create budget items table for admin editing
CREATE TABLE IF NOT EXISTS public.budget_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  allocated numeric NOT NULL DEFAULT 0,
  spent numeric NOT NULL DEFAULT 0,
  description text,
  priority text DEFAULT 'متوسطة',
  status text DEFAULT 'نشط',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create team members table for admin editing
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  responsibilities text[],
  status text DEFAULT 'نشط',
  team_type text DEFAULT 'متخصص', -- 'قيادة' or 'متخصص'
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create strategy items table for admin editing
CREATE TABLE IF NOT EXISTS public.strategy_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  priority text DEFAULT 'متوسطة',
  progress integer DEFAULT 0,
  status text DEFAULT 'تطوير',
  tactics jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cities (viewable by all authenticated users)
CREATE POLICY "Users can view cities" 
ON public.cities 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage cities" 
ON public.cities 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create RLS policies for buildings
CREATE POLICY "Users can view buildings" 
ON public.buildings 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage buildings" 
ON public.buildings 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Representatives can update their assigned buildings" 
ON public.buildings 
FOR UPDATE 
USING (assigned_representative_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create RLS policies for budget_items
CREATE POLICY "Users can view budget items" 
ON public.budget_items 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage budget items" 
ON public.budget_items 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create RLS policies for team_members
CREATE POLICY "Users can view team members" 
ON public.team_members 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage team members" 
ON public.team_members 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create RLS policies for strategy_items
CREATE POLICY "Users can view strategy items" 
ON public.strategy_items 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage strategy items" 
ON public.strategy_items 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Add update triggers for timestamp columns
CREATE TRIGGER update_cities_updated_at
BEFORE UPDATE ON public.cities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_buildings_updated_at
BEFORE UPDATE ON public.buildings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at
BEFORE UPDATE ON public.budget_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategy_items_updated_at
BEFORE UPDATE ON public.strategy_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial cities
INSERT INTO public.cities (name_ar, name_fr) VALUES
('الجزائر العاصمة', 'Alger'),
('وهران', 'Oran'),
('قسنطينة', 'Constantine'),
('عنابة', 'Annaba'),
('بسكرة', 'Biskra')
ON CONFLICT DO NOTHING;

-- Insert some initial budget items
INSERT INTO public.budget_items (category, allocated, spent, description, priority, status) VALUES
('الدعاية والإعلان', 150000, 95000, 'ملصقات، راديو، صحف', 'عالية', 'نشط'),
('اللوجستيات', 100000, 45000, 'نقل، وقود، مقرات', 'عالية', 'نشط'),
('الفعاليات', 80000, 30000, 'اجتماعات، ضيافة', 'متوسطة', 'نشط'),
('الرواتب والحوافز', 60000, 20000, 'منسقين، متطوعين', 'عالية', 'نشط'),
('طوارئ', 20000, 2000, 'أحداث غير متوقعة', 'منخفضة', 'احتياطي')
ON CONFLICT DO NOTHING;

-- Insert some initial team members
INSERT INTO public.team_members (name, role, responsibilities, status, team_type) VALUES
('مدير الحملة العام', 'القيادة المركزية', ARRAY['التخطيط الاستراتيجي', 'القرارات العليا'], 'نشط', 'قيادة'),
('نائب مدير الحملة', 'القيادة المركزية', ARRAY['الإشراف التشغيلي', 'المتابعة الميدانية'], 'نشط', 'قيادة'),
('فريق الإعلام والاتصال', 'مُنسق الإعلام', ARRAY['إدارة المحتوى', 'العلاقات الإعلامية', 'وسائل التواصل'], 'نشط', 'متخصص'),
('فريق اللوجستيات', 'مدير العمليات', ARRAY['النقل', 'التجهيزات', 'الإمدادات'], 'نشط', 'متخصص')
ON CONFLICT DO NOTHING;