-- DATABASE STATUS CHECK
-- Run this to see what's already set up

-- Check if verification columns exist in users table
SELECT 
  'users table columns' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'phone_verified'
  ) THEN '✅ EXIST' ELSE '❌ MISSING' END as phone_columns,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'photo_verified'
  ) THEN '✅ EXIST' ELSE '❌ MISSING' END as photo_columns,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'identity_verified'
  ) THEN '✅ EXIST' ELSE '❌ MISSING' END as identity_columns;

-- Check if verification tables exist
SELECT 
  'verification tables' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'phone_verifications'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as phone_verifications_table,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_verifications'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as user_verifications_table;

-- Check storage buckets
SELECT 
  'storage buckets' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM storage.buckets 
    WHERE id = 'verification-photos'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as verification_photos_bucket,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM storage.buckets 
    WHERE id = 'identity-documents'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as identity_documents_bucket;

-- List all columns in users table that contain 'verified' or 'verification'
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users' 
AND (column_name LIKE '%verif%' OR column_name LIKE '%phone%')
ORDER BY column_name;