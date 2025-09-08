CREATE OR REPLACE FUNCTION get_campaign_overview()
RETURNS TABLE (
    total_target_votes BIGINT,
    total_potential_voters BIGINT,
    total_with_cards BIGINT,
    total_districts_count BIGINT,
    active_districts_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT SUM(d.target_votes) FROM public.districts d) AS total_target_votes,
        (SELECT SUM(vc.total_potential_voters) FROM public.voter_census vc) AS total_potential_voters,
        (SELECT SUM(vc.voters_with_cards) FROM public.voter_census vc) AS total_with_cards,
        (SELECT COUNT(*) FROM public.districts d) AS total_districts_count,
        (SELECT COUNT(*) FROM public.districts d WHERE d.status = 'active') AS active_districts_count;
END;
$$ LANGUAGE plpgsql;
