grant usage on schema xforge to authenticated;
grant select on table xforge.notification_inbox to authenticated;
grant update (seen_at, read_at, archived_at, updated_at)
on table xforge.notification_inbox
to authenticated;

alter table xforge.notification_inbox enable row level security;

create policy "authenticated users can read own notification inbox rows"
on xforge.notification_inbox
for select
to authenticated
using (((select auth.uid())::text) = user_id);

create policy "authenticated users can update own notification inbox state"
on xforge.notification_inbox
for update
to authenticated
using (((select auth.uid())::text) = user_id)
with check (((select auth.uid())::text) = user_id);

create policy "authenticated users can receive own private notification broadcasts"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension in ('broadcast')
  and (
    select realtime.topic()
  ) ~ (
    '^xforge:notifications:tenant:[^:]+(:company:[^:]+)?:user:'
    || replace(((select auth.uid())::text), '-', '\-')
    || '$'
  )
);
