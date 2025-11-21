# Supabase Storage Setup

## One-time Setup

Before uploading PDFs, you need to set up the Storage bucket and policies in Supabase.

### Steps

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run the SQL from `supabase-storage-setup.sql` (or copy-paste below):

```sql
-- Bucket
insert into storage.buckets (id, name, public) values ('uploads','uploads', false)
on conflict (id) do nothing;

-- Allow logged-in users to INSERT into uploads/<userId>/...
create policy "uploads_insert_user_prefix"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'uploads'
  and name like auth.uid()::text || '/%'
);

-- Allow owners to SELECT/UPDATE/DELETE their own objects
create policy "uploads_rw_own_files"
on storage.objects for all
to authenticated
using (
  bucket_id = 'uploads'
  and name like auth.uid()::text || '/%'
)
with check (
  bucket_id = 'uploads'
  and name like auth.uid()::text || '/%'
);
```

### What This Does

- Creates the `uploads` bucket (if it doesn't exist)
- Allows authenticated users to upload files to `uploads/<userId>/...`
- Allows users to read/update/delete only their own files
- Prevents users from accessing other users' files

### Verification

After running the SQL:

1. Go to **Storage** in Supabase dashboard
2. You should see the `uploads` bucket
3. Try uploading a PDF via `/debug/upload` page
4. Click "List my files" to verify the file appears

### Troubleshooting

If uploads fail with "Storage upload failed":

- Check that the bucket exists: `SELECT * FROM storage.buckets WHERE id = 'uploads'`
- Check policies: `SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'`
- Verify you're authenticated: Check browser console for auth errors
- Check RLS is enabled: `SELECT * FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects'`

