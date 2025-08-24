create policy "Enable read access for all users"
on "public"."ingestion_log"
for select using (true);

create policy "Enable insert for authenticated users only"
on "public"."ingestion_log"
for insert to authenticated
with check (true);

alter table "public"."ingestion_log"
enable row level security;

create policy "Enable read access for all users"
on "public"."words_new"
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."words_new"
as PERMISSIVE
for INSERT
to authenticated
with check (true);

alter table "public"."words_new"
enable row level security;

create policy "Enable read access for all users"
on "public"."words_v2"
to public
using (true);

create policy "Enable insert for authenticated users only"
on "public"."words_v2"
to authenticated
with check (true);

alter table "public"."words_v2"
enable row level security;

alter table "public"."user_permissions"
enable row level security;

