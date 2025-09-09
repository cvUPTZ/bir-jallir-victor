-- Fix buildings table to include district_id column
ALTER TABLE buildings 
ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES districts(id);

-- Update existing buildings to have district relationship through residential_squares
UPDATE buildings 
SET district_id = (
  SELECT rs.district_id 
  FROM residential_squares rs 
  WHERE rs.building_id = buildings.id 
  LIMIT 1
)
WHERE district_id IS NULL;