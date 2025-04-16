
-- Create a storage bucket for AI designs
INSERT INTO storage.buckets (id, name, public, owner)
VALUES ('ai_designs', 'AI Designs', true, NULL);

-- Create policy to allow authenticated users to upload AI designs
CREATE POLICY "Authenticated users can upload AI designs"
ON storage.objects FOR INSERT
TO authenticated
USING (bucket_id = 'ai_designs');

-- Create policy to allow public to view AI designs
CREATE POLICY "Public can view AI designs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ai_designs');

-- Create policy to allow users to update their own uploads
CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ai_designs' AND owner = auth.uid());

-- Create policy to allow users to delete their own uploads
CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ai_designs' AND owner = auth.uid());
