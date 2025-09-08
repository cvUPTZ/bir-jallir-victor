-- Fix security issues by creating regular views without SECURITY DEFINER

-- Drop and recreate views without SECURITY DEFINER
DROP VIEW IF EXISTS pipeline_stages_view;
DROP VIEW IF EXISTS voter_database_view;
DROP VIEW IF EXISTS coordinator_progress_view;

-- Recreate views as regular views (without SECURITY DEFINER)
CREATE VIEW pipeline_stages_view AS
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

CREATE VIEW voter_database_view AS
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

CREATE VIEW coordinator_progress_view AS
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

-- Fix the function to have proper search path
DROP FUNCTION IF EXISTS get_campaign_overview();
CREATE OR REPLACE FUNCTION get_campaign_overview()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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