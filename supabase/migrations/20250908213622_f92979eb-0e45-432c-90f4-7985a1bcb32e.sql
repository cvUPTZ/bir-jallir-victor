-- Create missing database views and functions

-- Create pipeline stages view for voter tracking
CREATE OR REPLACE VIEW pipeline_stages_view AS
SELECT 
  'محتمل' as stage,
  COUNT(*) as count,
  'blue' as color,
  25 as probability
FROM voter_census
WHERE survey_status = 'pending'
UNION ALL
SELECT 
  'تم التواصل' as stage,
  COUNT(*) as count,
  'orange' as color,
  50 as probability
FROM voter_census
WHERE survey_status = 'contacted'
UNION ALL
SELECT 
  'مؤيد' as stage,
  COUNT(*) as count,
  'green' as color,
  75 as probability
FROM voter_census
WHERE survey_status = 'accepted'
UNION ALL
SELECT 
  'مؤكد' as stage,
  COUNT(*) as count,
  'campaign-success' as color,
  90 as probability
FROM voter_census
WHERE survey_status = 'confirmed';

-- Create voter database view for residential squares
CREATE OR REPLACE VIEW voter_database_view AS
SELECT 
  rs.square_number,
  rs.building_codes,
  COALESCE(SUM(vc.total_potential_voters), 0) as potential,
  COALESCE(SUM(vc.voters_with_cards), 0) as with_cards,
  COALESCE(SUM(vc.voters_without_cards), 0) as without_cards,
  COUNT(CASE WHEN vc.survey_status = 'contacted' THEN 1 END) as contacted,
  COUNT(CASE WHEN vc.survey_status = 'accepted' THEN 1 END) as accepted,
  p.full_name as manager,
  p.phone as manager_phone
FROM residential_squares rs
LEFT JOIN voter_census vc ON rs.id = vc.residential_square_id
LEFT JOIN profiles p ON rs.assigned_representative_id = p.id
GROUP BY rs.square_number, rs.building_codes, p.full_name, p.phone
ORDER BY rs.square_number;

-- Create coordinator progress view
CREATE OR REPLACE VIEW coordinator_progress_view AS
SELECT 
  p.full_name as name,
  p.assigned_district as area,
  COUNT(DISTINCT rs.id) * 100 as target,
  COUNT(CASE WHEN vc.survey_status = 'contacted' THEN 1 END) as contacted,
  COUNT(CASE WHEN vc.survey_status = 'accepted' THEN 1 END) as accepted,
  COUNT(CASE WHEN vc.survey_status = 'rejected' THEN 1 END) as rejected,
  CASE 
    WHEN COUNT(DISTINCT rs.id) > 0 THEN 
      ROUND((COUNT(vc.id)::float / (COUNT(DISTINCT rs.id) * 100)) * 100)
    ELSE 0 
  END as progress
FROM profiles p
LEFT JOIN residential_squares rs ON rs.assigned_representative_id = p.id
LEFT JOIN voter_census vc ON vc.residential_square_id = rs.id
WHERE p.role = 'representative'
GROUP BY p.full_name, p.assigned_district;

-- Create campaign overview function
CREATE OR REPLACE FUNCTION get_campaign_overview()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_districts', (SELECT COUNT(*) FROM districts),
    'total_squares', (SELECT COUNT(*) FROM residential_squares),
    'total_representatives', (SELECT COUNT(*) FROM profiles WHERE role = 'representative'),
    'total_potential_voters', (SELECT COALESCE(SUM(total_potential_voters), 0) FROM voter_census),
    'total_with_cards', (SELECT COALESCE(SUM(voters_with_cards), 0) FROM voter_census),
    'total_without_cards', (SELECT COALESCE(SUM(voters_without_cards), 0) FROM voter_census),
    'completion_rate', (
      SELECT CASE 
        WHEN COUNT(*) > 0 THEN ROUND((COUNT(CASE WHEN survey_status != 'pending' THEN 1 END)::float / COUNT(*)) * 100)
        ELSE 0 
      END
      FROM voter_census
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Insert initial residential squares data
INSERT INTO residential_squares (square_number, district_id, building_codes, total_buildings)
SELECT 
  generate_series(1, 12) as square_number,
  d.id as district_id,
  ARRAY['A', 'B', 'C', 'D'] as building_codes,
  4 as total_buildings
FROM districts d
WHERE d.name_ar = 'المنطقة الأولى'
ON CONFLICT DO NOTHING;