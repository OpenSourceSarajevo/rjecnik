-- Application code (rjecnik-admin API routes) only checked the `Dictionary.ReadWrite`
-- permission at the app layer; the underlying RLS policies granted write access to
-- ANY authenticated user (`using (true)`/`with check (true)`), so any signed-in Google
-- account could bypass the app entirely and write/delete dictionary data directly via
-- the Supabase REST API using the public anon key. Replace `true` with an explicit
-- check against the `user_permission` JWT claim set by `custom_access_token_hook`.

-- ingestion_log
drop policy if exists "Enable insert for authenticated users only" on "public"."ingestion_log";
create policy "Enable insert for users with Dictionary.ReadWrite"
on "public"."ingestion_log"
for insert to authenticated
with check ((auth.jwt() ->> 'user_permission') = 'Dictionary.ReadWrite');

-- words_new
drop policy if exists "Enable insert for authenticated users only" on "public"."words_new";
create policy "Enable insert for users with Dictionary.ReadWrite"
on "public"."words_new"
as PERMISSIVE
for INSERT
to authenticated
with check ((auth.jwt() ->> 'user_permission') = 'Dictionary.ReadWrite');

drop policy if exists "Enable update for authenticated users only" on "public"."words_new";
create policy "Enable update for users with Dictionary.ReadWrite"
on "public"."words_new"
as PERMISSIVE
for UPDATE
to authenticated
using ((auth.jwt() ->> 'user_permission') = 'Dictionary.ReadWrite')
with check ((auth.jwt() ->> 'user_permission') = 'Dictionary.ReadWrite');

drop policy if exists "Enable delete for authenticated users only" on "public"."words_new";
create policy "Enable delete for users with Dictionary.ReadWrite"
on "public"."words_new"
as PERMISSIVE
for DELETE
to authenticated
using ((auth.jwt() ->> 'user_permission') = 'Dictionary.ReadWrite');

-- words_v2
drop policy if exists "Enable insert for authenticated users only" on "public"."words_v2";
create policy "Enable insert for users with Dictionary.ReadWrite"
on "public"."words_v2"
to authenticated
with check ((auth.jwt() ->> 'user_permission') = 'Dictionary.ReadWrite');

drop policy if exists "Enable update for authenticated users only" on "public"."words_v2";
create policy "Enable update for users with Dictionary.ReadWrite"
on "public"."words_v2"
as PERMISSIVE
for UPDATE
to authenticated
using ((auth.jwt() ->> 'user_permission') = 'Dictionary.ReadWrite')
with check ((auth.jwt() ->> 'user_permission') = 'Dictionary.ReadWrite');

-- words_ignore
drop policy if exists "Enable all for authenticated users only" on "public"."words_ignore";
create policy "Enable all for users with Dictionary.ReadWrite"
on "public"."words_ignore"
as PERMISSIVE
for ALL
to authenticated
using ((auth.jwt() ->> 'user_permission') = 'Dictionary.ReadWrite')
with check ((auth.jwt() ->> 'user_permission') = 'Dictionary.ReadWrite');
