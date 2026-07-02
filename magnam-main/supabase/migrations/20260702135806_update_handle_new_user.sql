/*
# Update handle_new_user to apply invite role

1. Modified Functions
- `handle_new_user` — now checks raw_user_meta_data for 'invite_role' and sets the profile role accordingly.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_role text;
BEGIN
  invite_role := NEW.raw_user_meta_data->>'invite_role';
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(invite_role, 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = CASE WHEN EXCLUDED.role IS NOT NULL THEN EXCLUDED.role ELSE public.profiles.role END;
  RETURN NEW;
END;
$$;
