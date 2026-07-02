/*
# Fix infinite recursion in profiles RLS policies

## Problem
`profiles_select_own_or_admin` and `profiles_admin_update` (from the
initial profiles migration) check admin status with a subquery that
selects from `public.profiles` itself. Because RLS applies to that inner
subquery too, Postgres detects infinite recursion ("infinite recursion
detected in policy for relation profiles") and the query fails for
EVERY user, not just admins. This makes the app unable to load any
profile after login, including super_admin, so the account "never logs
in" even though authentication itself succeeds.

## Fix
Replace the self-referencing subqueries with the existing SECURITY
DEFINER helper function `public.is_admin()`, which bypasses RLS
internally and breaks the recursive loop.
*/

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
