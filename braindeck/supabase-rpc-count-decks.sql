-- Optional RPC helper for Job Inspector
-- Run this in Supabase SQL Editor to enable deck counting

create or replace function public.count_decks_for_upload(upload_id uuid)
returns int language sql stable as $$
  select count(*)::int from decks d
  join uploads u on u.user_id = d.user_id
  where u.id = upload_id and d.created_at > u.created_at - interval '5 minutes';
$$;

