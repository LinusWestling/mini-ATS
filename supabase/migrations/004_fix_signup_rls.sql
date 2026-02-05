-- Fix RLS for Self-Service Signup
-- Allow authenticated users to create a company if they are the creator
DROP POLICY IF EXISTS "Users can create their own company" ON companies;
CREATE POLICY "Users can create their own company"
ON companies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Allow authenticated users to create their own profile
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Update viewing policy for companies to be more robust
DROP POLICY IF EXISTS "Customers can view their own company" ON companies;
CREATE POLICY "Customers can view their own company"
  ON companies FOR SELECT
  TO authenticated
  USING (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR created_by = auth.uid());
