
create policy "Enable update for authenticated users only"
on "public"."words_new"
as PERMISSIVE
for UPDATE
to authenticated
using (true)
with check (true);

create policy "Enable delete for authenticated users only"
on "public"."words_new"
as PERMISSIVE
for DELETE
to authenticated
using (true);

create policy "Enable update for authenticated users only"
on "public"."words_v2"
as PERMISSIVE
for UPDATE
to authenticated
using (true)
with check (true);

alter table "public"."words_ignore"
enable row level security;

create policy "Enable all for authenticated users only"
on "public"."words_ignore"
as PERMISSIVE
for ALL
to authenticated
using (true)
with check (true);
