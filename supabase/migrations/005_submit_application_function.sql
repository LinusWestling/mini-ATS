-- Function to handle public application submission safely
CREATE OR REPLACE FUNCTION public.submit_application(
  p_job_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_linkedin_url TEXT,
  p_cv_url TEXT,
  p_company_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_candidate_id UUID;
BEGIN
  -- Insert the candidate
  INSERT INTO public.candidates (name, email, phone, linkedin_url, cv_url, company_id)
  VALUES (p_name, p_email, p_phone, p_linkedin_url, p_cv_url, p_company_id)
  RETURNING id INTO v_candidate_id;

  -- Insert the application
  INSERT INTO public.applications (job_id, candidate_id, status)
  VALUES (p_job_id, v_candidate_id, 'new');

  RETURN v_candidate_id;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.submit_application TO anon;
GRANT EXECUTE ON FUNCTION public.submit_application TO authenticated;
