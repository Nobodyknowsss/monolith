-- Run this once in the Supabase SQL Editor.
-- These policies let authenticated users read/write/delete ONLY files inside
-- a folder that matches their own auth.uid(). Our path scheme is:
--   <userId>/<notebookId>/<documentId>-<filename>
-- so `storage.foldername(name)[1]` is the user-id segment.

-- Allow uploading files into your own folder.
CREATE POLICY "documents_insert_own" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow reading files from your own folder.
CREATE POLICY "documents_select_own" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow deleting files from your own folder.
CREATE POLICY "documents_delete_own" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
