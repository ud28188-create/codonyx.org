-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Approved users can view other approved profiles" ON public.profiles;

-- Create a security definer function to check if user is approved (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_user_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND approval_status = 'approved'
  )
$$;

-- Recreate the policy using the security definer function
CREATE POLICY "Approved users can view other approved profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (approval_status = 'approved' AND public.is_user_approved(auth.uid()))
);