CREATE OR REPLACE FUNCTION public.get_users_with_email()
RETURNS TABLE(id uuid, full_name text, email text, role text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    p.id,
    p.full_name,
    u.email,
    p.role
  FROM
    public.profiles p
  JOIN
    auth.users u ON p.id = u.id;
$$;
