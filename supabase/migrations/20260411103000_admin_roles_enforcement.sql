-- Update existing profile roles for authorized admins
UPDATE public.profiles
SET role = 'admin'
FROM auth.users
WHERE public.profiles.user_id = auth.users.id
AND auth.users.email IN (
  'ansavali3231@gmail.com', 
  'devduocompany@gmail.com', 
  'tvsathwiksai@gmail.com'
);

-- Demote any unauthorized profiles that current act as 'admin' or 'founder'
UPDATE public.profiles
SET role = 'user'
FROM auth.users
WHERE public.profiles.user_id = auth.users.id
AND auth.users.email NOT IN (
  'ansavali3231@gmail.com', 
  'devduocompany@gmail.com', 
  'tvsathwiksai@gmail.com'
)
AND public.profiles.role IN ('admin', 'founder');

-- Create a function and trigger to automatically assign 'admin' to these specific emails going forward
CREATE OR REPLACE FUNCTION public.handle_user_role_assignment() 
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = NEW.user_id 
    AND email IN ('ansavali3231@gmail.com', 'devduocompany@gmail.com', 'tvsathwiksai@gmail.com')
  ) THEN
    NEW.role := 'admin';
  ELSIF NEW.role IN ('admin', 'founder') THEN
    NEW.role := 'user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_admin_role ON public.profiles;
CREATE TRIGGER enforce_admin_role
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_role_assignment();
