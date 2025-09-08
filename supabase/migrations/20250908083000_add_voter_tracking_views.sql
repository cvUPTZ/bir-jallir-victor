-- Step 1: Add new columns to the voter_census table to store detailed tracking data.
ALTER TABLE public.voter_census
ADD COLUMN contacted INTEGER DEFAULT 0,
ADD COLUMN accepted INTEGER DEFAULT 0,
ADD COLUMN rejected INTEGER DEFAULT 0;

-- Step 2: Create a view for aggregated data per residential square.
-- This view will power the "Residential Squares Database" section of the UI.
CREATE OR REPLACE VIEW public.voter_database_view AS
SELECT
  rs.id AS residential_square_id,
  rs.square_number,
  d.name_ar AS district_name,
  p.full_name AS manager,
  p.phone AS manager_phone,
  rs.building_codes,
  COALESCE(SUM(vc.total_potential_voters), 0) AS potential,
  COALESCE(SUM(vc.voters_with_cards), 0) AS with_cards,
  COALESCE(SUM(vc.voters_without_cards), 0) AS without_cards,
  COALESCE(SUM(vc.contacted), 0) AS contacted,
  COALESCE(SUM(vc.accepted), 0) AS accepted,
  COALESCE(SUM(vc.rejected), 0) AS rejected
FROM
  public.residential_squares rs
  LEFT JOIN public.voter_census vc ON rs.id = vc.residential_square_id
  LEFT JOIN public.profiles p ON rs.assigned_representative_id = p.id
  LEFT JOIN public.districts d ON rs.district_id = d.id
GROUP BY
  rs.id, d.name_ar, p.full_name, p.phone;

-- Step 3: Create a view for coordinator performance.
-- This view will power the "Coordinator Performance" section of the UI.
CREATE OR REPLACE VIEW public.coordinator_progress_view AS
SELECT
    d.coordinator_name AS name,
    d.name_ar AS area,
    d.target_votes AS target,
    COALESCE(sum.contacted, 0) as contacted,
    COALESCE(sum.accepted, 0) as accepted,
    COALESCE(sum.rejected, 0) as rejected,
    CASE
        WHEN d.target_votes > 0 THEN (COALESCE(sum.contacted, 0) * 100.0 / d.target_votes)
        ELSE 0
    END AS progress
FROM
    public.districts d
LEFT JOIN (
    SELECT
        rs.district_id,
        SUM(vdb.contacted) as contacted,
        SUM(vdb.accepted) as accepted,
        SUM(vdb.rejected) as rejected
    FROM
        public.residential_squares rs
    JOIN
        public.voter_database_view vdb ON rs.id = vdb.residential_square_id
    GROUP BY
        rs.district_id
) sum ON d.id = sum.district_id
WHERE
    d.coordinator_name IS NOT NULL;

-- Step 4: Create a view for the overall voter pipeline.
-- This view will power the "Voter Conversion Funnel" section of the UI.
CREATE OR REPLACE VIEW public.pipeline_stages_view AS
SELECT
  'لم يتم التواصل معه' AS stage,
  10 AS probability,
  (SELECT SUM(potential) FROM public.voter_database_view) - (SELECT SUM(contacted) FROM public.voter_database_view) AS count,
  'muted' AS color
UNION ALL
SELECT
  'تم التواصل' AS stage,
  50 AS probability,
  (SELECT SUM(contacted) FROM public.voter_database_view) AS count,
  'campaign-progress' AS color
UNION ALL
SELECT
  'قبول' AS stage,
  100 AS probability,
  (SELECT SUM(accepted) FROM public.voter_database_view) AS count,
  'campaign-success' AS color
UNION ALL
SELECT
  'رفض' AS stage,
  0 AS probability,
  (SELECT SUM(rejected) FROM public.voter_database_view) AS count,
  'danger' AS color;
