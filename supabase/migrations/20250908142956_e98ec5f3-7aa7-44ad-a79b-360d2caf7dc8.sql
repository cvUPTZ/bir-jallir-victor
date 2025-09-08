-- Create user profiles table for campaign representatives
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'representative',
  phone TEXT,
  assigned_district TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create districts table
CREATE TABLE public.districts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_fr TEXT,
  coordinator_name TEXT,
  target_votes INTEGER DEFAULT 0,
  priority_level TEXT CHECK (priority_level IN ('high', 'medium', 'low')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('active', 'completed', 'pending')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create residential squares table
CREATE TABLE public.residential_squares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE,
  square_number INTEGER NOT NULL,
  building_codes TEXT[] DEFAULT '{}',
  assigned_representative_id UUID REFERENCES public.profiles(id),
  total_buildings INTEGER DEFAULT 0,
  surveyed_buildings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(district_id, square_number)
);

-- Create voter census table
CREATE TABLE public.voter_census (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  residential_square_id UUID NOT NULL REFERENCES public.residential_squares(id) ON DELETE CASCADE,
  building_code TEXT NOT NULL,
  apartment_number TEXT,
  head_of_household TEXT NOT NULL,
  phone_number TEXT,
  voters_with_cards INTEGER DEFAULT 0,
  voters_without_cards INTEGER DEFAULT 0,
  total_potential_voters INTEGER DEFAULT 0,
  survey_status TEXT CHECK (survey_status IN ('pending', 'completed', 'verified')) DEFAULT 'pending',
  notes TEXT,
  surveyed_by UUID REFERENCES public.profiles(id),
  surveyed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residential_squares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voter_census ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for districts
CREATE POLICY "Authenticated users can view districts" 
ON public.districts 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Only authenticated users can manage districts" 
ON public.districts 
FOR ALL 
TO authenticated
USING (true);

-- Create RLS policies for residential squares
CREATE POLICY "Users can view residential squares" 
ON public.residential_squares 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Representatives can update their assigned squares" 
ON public.residential_squares 
FOR UPDATE 
TO authenticated
USING (assigned_representative_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

-- Create RLS policies for voter census
CREATE POLICY "Users can view census data from their squares" 
ON public.voter_census 
FOR SELECT 
TO authenticated
USING (
  residential_square_id IN (
    SELECT id FROM public.residential_squares 
    WHERE assigned_representative_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can insert census data for their squares" 
ON public.voter_census 
FOR INSERT 
TO authenticated
WITH CHECK (
  residential_square_id IN (
    SELECT id FROM public.residential_squares 
    WHERE assigned_representative_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  ) AND surveyed_by IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update census data they created" 
ON public.voter_census 
FOR UPDATE 
TO authenticated
USING (surveyed_by IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_districts_updated_at
BEFORE UPDATE ON public.districts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_residential_squares_updated_at
BEFORE UPDATE ON public.residential_squares
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_voter_census_updated_at
BEFORE UPDATE ON public.voter_census
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'representative')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial districts data
INSERT INTO public.districts (name_ar, name_fr, coordinator_name, target_votes, priority_level) VALUES
('حي الونشريس', 'Hai El Wancharis', 'هشام', 500, 'high'),
('حي السلام', 'Hai Es Salem', 'منير غزالي', 150, 'medium'),
('الحي العسكري', 'Hai El Askari', 'منير أزرارق', 70, 'medium'),
('حي عائلة عيسات', 'Hai Aaila Issat', 'موسى', 50, 'medium'),
('حي بن رحال', 'Hai Ben Rahal', 'حمزة', 0, 'low'),
('حي محمد مختاري', 'Hai Mohamed Mokhtari', 'زاكي', 150, 'high'),
('حي عدل قريشي', 'Hai Adl Qureshi', 'مُنسق الإعلام', 150, 'high'),
('حي ألبيبي مصطفى', 'Hai Albibi Mostafa', NULL, 40, 'low'),
('حي ألبيبي الأخير', 'Hai Albibi El Akhir', NULL, 50, 'low'),
('حي ألاسبي', 'Hai Alasbi', NULL, 60, 'low'),
('حي فعوصي', 'Hai Faossi', NULL, 70, 'medium'),
('حي ألبيبي المحطة', 'Hai Albibi El Mahatta', NULL, 50, 'low'),
('حي جعفري سيد علي', 'Hai Jaafari Sid Ali', NULL, 100, 'medium'),
('حي جعفري قادري', 'Hai Jaafari Qadri', NULL, 50, 'medium'),
('حي الباي محمد بلدية', 'Hai El Bey Mohamed Baladiya', NULL, 50, 'medium'),
('حي الباي بوعلواش', 'Hai El Bey Boualwash', NULL, 50, 'medium'),
('حي شبشب', 'Hai Shabshab', NULL, 100, 'medium'),
('حي علي خوجة', 'Hai Ali Khoja', NULL, 60, 'medium'),
('حي حفرات', 'Hai Hafrat', NULL, 60, 'medium'),
('حي الشط', 'Hai Ech Chat', NULL, 40, 'low'),
('حوش عوماري', 'Houch Omari', NULL, 0, 'low'),
('حوش بورحلة', 'Houch Bourahla', NULL, 60, 'medium'),
('حوش مرزوق', 'Houch Marzouk', NULL, 40, 'low'),
('حوش عميروش', 'Houch Amirouch', NULL, 30, 'low'),
('حي وسط المدينة', 'Hai Wast El Madina', NULL, 50, 'medium'),
('حي عسات مصطفى', 'Hai Assat Mostafa', NULL, 0, 'low'),
('حي ليزيريس', 'Hai Laziris', NULL, 0, 'low'),
('حي المحطة', 'Hai El Mahatta', NULL, 0, 'low'),
('حي الأساتذة', 'Hai El Asatida', NULL, 0, 'low');

-- Insert residential squares for the first district (example)
DO $$
DECLARE
    district_uuid UUID;
    square_codes TEXT[][];
BEGIN
    -- Get the UUID of the first district
    SELECT id INTO district_uuid FROM public.districts WHERE name_ar = 'حي الونشريس' LIMIT 1;
    
    -- Define building codes for each square
    square_codes := ARRAY[
        ARRAY['A6', 'A12', 'D3', 'A3', 'D5', 'B8', 'C3', 'A17', 'C7', 'A32', 'E5', 'D9'],
        ARRAY['A7', 'A11', 'A13', 'A2', 'D6', 'C6', 'D4', 'A18', 'A31', 'A33', 'E6', 'B17'],
        ARRAY['B6', 'A10', 'B5', 'A1', 'A25', 'A24', 'A15', 'A19', 'B13', 'A34', 'D7', 'A35'],
        ARRAY['B7', 'A9', 'C2', 'B1', 'B10', 'B9', 'C4', 'A20', 'A29', 'A36', 'D8', 'A39'],
        ARRAY['B4', 'A8', 'A14', 'B2', 'E3', 'B11', 'A16', 'A21', 'A28', 'A37', 'A40', 'A30'],
        ARRAY['D2', 'C1', 'A5', 'E1', 'E4', 'B12', 'C5', 'A22', 'B15', 'A38', 'C8'],
        ARRAY['B3', 'D1', 'A4', 'E2', 'A27', 'Casnos', 'A23', 'B16']
    ];
    
    -- Insert residential squares
    FOR i IN 1..7 LOOP
        INSERT INTO public.residential_squares (district_id, square_number, building_codes, total_buildings)
        VALUES (district_uuid, i, square_codes[i], array_length(square_codes[i], 1));
    END LOOP;
END $$;