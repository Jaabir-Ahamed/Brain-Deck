-- One-time setup: Verify bucket + policies in Supabase SQL
-- Run this in your Supabase SQL Editor if you haven't set up Storage policies yet

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

