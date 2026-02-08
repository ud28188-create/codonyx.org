
-- Create publications table
CREATE TABLE public.publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  publication_type TEXT NOT NULL DEFAULT 'paper',
  file_url TEXT,
  external_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

-- Users can view publications of approved profiles (public visibility)
CREATE POLICY "Anyone authenticated can view publications of approved profiles"
ON public.publications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = publications.profile_id
    AND profiles.approval_status = 'approved'
  )
);

-- Users can manage their own publications
CREATE POLICY "Users can insert own publications"
ON public.publications
FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own publications"
ON public.publications
FOR UPDATE
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own publications"
ON public.publications
FOR DELETE
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_publications_updated_at
BEFORE UPDATE ON public.publications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for publication files
INSERT INTO storage.buckets (id, name, public) VALUES ('publications', 'publications', true);

-- Storage policies for publications bucket
CREATE POLICY "Anyone can view publication files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'publications');

CREATE POLICY "Authenticated users can upload publication files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'publications' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own publication files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'publications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own publication files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'publications' AND auth.uid()::text = (storage.foldername(name))[1]);
