-- Add branding fields to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS description TEXT;

-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company_logos', 'company_logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for logos
CREATE POLICY "Public can view company logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company_logos');

CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company_logos');

CREATE POLICY "Users can update their own logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'company_logos');
