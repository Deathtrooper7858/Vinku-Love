-- ============================================================
-- VINKU-LOVE — SQL COMPLETO PARA SUPABASE
-- Copia TODO este texto y pégalo en:
-- app.supabase.com → tu proyecto → SQL Editor → New query → Run
-- Es seguro correrlo varias veces (usa IF NOT EXISTS en todas partes).
-- ============================================================


-- ============================================================
-- TABLAS
-- ============================================================

-- Perfiles de usuario (uno por cuenta)
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null default 'Sin nombre',
  created_at    timestamptz not null default now()
);

-- Parejas
create table if not exists public.couples (
  id                  uuid primary key default gen_random_uuid(),
  invite_code         text not null unique,
  pet_xp              integer not null default 0,
  equipped_accessory  text,
  created_at          timestamptz not null default now()
);

-- Miembros de la pareja (máximo 2 por fila de couples)
create table if not exists public.couple_members (
  couple_id   uuid not null references public.couples(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  joined_at   timestamptz not null default now(),
  primary key (couple_id, profile_id)
);

-- Estados de ánimo (historial; la app usa el más reciente por persona)
create table if not exists public.moods (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references public.couples(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  emoji       text not null,
  created_at  timestamptz not null default now()
);

-- Toques de "Te extraño" con patrón háptico
create table if not exists public.missyou_taps (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references public.couples(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  pattern     text not null default 'soft',
  created_at  timestamptz not null default now()
);

-- Notas entre la pareja
create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references public.couples(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  text        text not null,
  created_at  timestamptz not null default now()
);

-- Respuestas a la Pregunta del Día (una por persona por fecha)
create table if not exists public.daily_answers (
  id           uuid primary key default gen_random_uuid(),
  couple_id    uuid not null references public.couples(id) on delete cascade,
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  prompt_date  date not null,
  answer       text not null,
  created_at   timestamptz not null default now(),
  unique (couple_id, profile_id, prompt_date)
);

-- Cápsula del tiempo (texto + foto, bloqueada hasta unlock_at)
create table if not exists public.capsule_entries (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references public.couples(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  text        text,
  photo_path  text,
  unlock_at   timestamptz not null,
  created_at  timestamptz not null default now()
);

-- Lista de citas pendientes / bucket list
create table if not exists public.bucket_list_items (
  id              uuid primary key default gen_random_uuid(),
  couple_id       uuid not null references public.couples(id) on delete cascade,
  created_by      uuid not null references public.profiles(id) on delete cascade,
  title           text not null,
  done            boolean not null default false,
  done_photo_path text,
  created_at      timestamptz not null default now()
);

-- Calendario de eventos importantes
create table if not exists public.calendar_events (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references public.couples(id) on delete cascade,
  created_by  uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  event_date  date not null,
  created_at  timestamptz not null default now()
);

-- Gastos compartidos
create table if not exists public.expenses (
  id           uuid primary key default gen_random_uuid(),
  couple_id    uuid not null references public.couples(id) on delete cascade,
  paid_by      uuid not null references public.profiles(id) on delete cascade,
  description  text not null,
  amount       numeric not null,
  created_at   timestamptz not null default now()
);

-- Estado contextual (batería + estado manual); una fila por persona
create table if not exists public.member_status (
  couple_id      uuid not null references public.couples(id) on delete cascade,
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  battery_level  integer,
  manual_status  text,
  updated_at     timestamptz not null default now(),
  primary key (couple_id, profile_id)
);

-- Accesorios de mascota desbloqueados por la pareja
create table if not exists public.pet_accessories_owned (
  couple_id      uuid not null references public.couples(id) on delete cascade,
  accessory_key  text not null,
  primary key (couple_id, accessory_key)
);

-- Push tokens de Expo (uno por perfil, para notificaciones)
create table if not exists public.push_tokens (
  profile_id  uuid primary key references public.profiles(id) on delete cascade,
  token       text not null,
  updated_at  timestamptz not null default now()
);


-- ============================================================
-- FUNCIONES
-- ============================================================

-- Suma XP a la mascota de forma atómica (evita condiciones de carrera)
create or replace function public.increment_pet_xp(p_couple_id uuid, p_amount integer)
returns void
language plpgsql
security definer
as $$
begin
  update public.couples
  set pet_xp = greatest(0, pet_xp + p_amount)
  where id = p_couple_id;
end;
$$;


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles            enable row level security;
alter table public.couples             enable row level security;
alter table public.couple_members      enable row level security;
alter table public.moods               enable row level security;
alter table public.missyou_taps        enable row level security;
alter table public.notes               enable row level security;
alter table public.daily_answers       enable row level security;
alter table public.capsule_entries     enable row level security;
alter table public.bucket_list_items   enable row level security;
alter table public.calendar_events     enable row level security;
alter table public.expenses            enable row level security;
alter table public.member_status       enable row level security;
alter table public.pet_accessories_owned enable row level security;
alter table public.push_tokens         enable row level security;

-- profiles
drop policy if exists "profiles: select own" on public.profiles;
create policy "profiles: select own"
  on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own"
  on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own"
  on public.profiles for update using (auth.uid() = id);

-- couple_members
drop policy if exists "couple_members: select" on public.couple_members;
create policy "couple_members: select"
  on public.couple_members for select using (
    profile_id = auth.uid()
    or couple_id in (
      select couple_id from public.couple_members where profile_id = auth.uid()
    )
  );
drop policy if exists "couple_members: insert own" on public.couple_members;
create policy "couple_members: insert own"
  on public.couple_members for insert with check (profile_id = auth.uid());

-- couples
drop policy if exists "couples: select if member" on public.couples;
create policy "couples: select if member"
  on public.couples for select using (
    id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );
drop policy if exists "couples: insert authenticated" on public.couples;
create policy "couples: insert authenticated"
  on public.couples for insert with check (auth.uid() is not null);
drop policy if exists "couples: update if member" on public.couples;
create policy "couples: update if member"
  on public.couples for update using (
    id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );

-- moods
drop policy if exists "moods: select if member" on public.moods;
create policy "moods: select if member"
  on public.moods for select using (
    couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );
drop policy if exists "moods: insert if member" on public.moods;
create policy "moods: insert if member"
  on public.moods for insert with check (
    profile_id = auth.uid()
    and couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );

-- missyou_taps
drop policy if exists "missyou: select if member" on public.missyou_taps;
create policy "missyou: select if member"
  on public.missyou_taps for select using (
    couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );
drop policy if exists "missyou: insert if member" on public.missyou_taps;
create policy "missyou: insert if member"
  on public.missyou_taps for insert with check (
    profile_id = auth.uid()
    and couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );

-- notes
drop policy if exists "notes: select if member" on public.notes;
create policy "notes: select if member"
  on public.notes for select using (
    couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );
drop policy if exists "notes: insert if member" on public.notes;
create policy "notes: insert if member"
  on public.notes for insert with check (
    profile_id = auth.uid()
    and couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );

-- daily_answers
drop policy if exists "daily_answers: select if member" on public.daily_answers;
create policy "daily_answers: select if member"
  on public.daily_answers for select using (
    couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );
drop policy if exists "daily_answers: insert if member" on public.daily_answers;
create policy "daily_answers: insert if member"
  on public.daily_answers for insert with check (
    profile_id = auth.uid()
    and couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );

-- capsule_entries
drop policy if exists "capsule: select if member" on public.capsule_entries;
create policy "capsule: select if member"
  on public.capsule_entries for select using (
    couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );
drop policy if exists "capsule: insert if member" on public.capsule_entries;
create policy "capsule: insert if member"
  on public.capsule_entries for insert with check (
    profile_id = auth.uid()
    and couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );

-- bucket_list_items
drop policy if exists "bucket_list: select if member" on public.bucket_list_items;
create policy "bucket_list: select if member"
  on public.bucket_list_items for select using (
    couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );
drop policy if exists "bucket_list: insert if member" on public.bucket_list_items;
create policy "bucket_list: insert if member"
  on public.bucket_list_items for insert with check (
    couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );
drop policy if exists "bucket_list: update if member" on public.bucket_list_items;
create policy "bucket_list: update if member"
  on public.bucket_list_items for update using (
    couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );

-- calendar_events
drop policy if exists "calendar: select if member" on public.calendar_events;
create policy "calendar: select if member"
  on public.calendar_events for select using (
    couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );
drop policy if exists "calendar: insert if member" on public.calendar_events;
create policy "calendar: insert if member"
  on public.calendar_events for insert with check (
    couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );
drop policy if exists "calendar: delete if member" on public.calendar_events;
create policy "calendar: delete if member"
  on public.calendar_events for delete using (
    couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );

-- expenses
drop policy if exists "expenses: select if member" on public.expenses;
create policy "expenses: select if member"
  on public.expenses for select using (
    couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );
drop policy if exists "expenses: insert if member" on public.expenses;
create policy "expenses: insert if member"
  on public.expenses for insert with check (
    couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );

-- member_status
drop policy if exists "status: select if member" on public.member_status;
create policy "status: select if member"
  on public.member_status for select using (
    couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );
drop policy if exists "status: insert own" on public.member_status;
create policy "status: insert own"
  on public.member_status for insert with check (profile_id = auth.uid());
drop policy if exists "status: update own" on public.member_status;
create policy "status: update own"
  on public.member_status for update using (profile_id = auth.uid());

-- pet_accessories_owned
drop policy if exists "accessories: select if member" on public.pet_accessories_owned;
create policy "accessories: select if member"
  on public.pet_accessories_owned for select using (
    couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );
drop policy if exists "accessories: insert if member" on public.pet_accessories_owned;
create policy "accessories: insert if member"
  on public.pet_accessories_owned for insert with check (
    couple_id in (select couple_id from public.couple_members where profile_id = auth.uid())
  );

-- push_tokens
drop policy if exists "push_tokens: select own or partner" on public.push_tokens;
create policy "push_tokens: select own or partner"
  on public.push_tokens for select using (
    profile_id = auth.uid()
    or profile_id in (
      select cm2.profile_id
      from public.couple_members cm1
      join public.couple_members cm2
        on cm1.couple_id = cm2.couple_id and cm2.profile_id != auth.uid()
      where cm1.profile_id = auth.uid()
    )
  );
drop policy if exists "push_tokens: insert own" on public.push_tokens;
create policy "push_tokens: insert own"
  on public.push_tokens for insert with check (profile_id = auth.uid());
drop policy if exists "push_tokens: update own" on public.push_tokens;
create policy "push_tokens: update own"
  on public.push_tokens for update using (profile_id = auth.uid());


-- ============================================================
-- REALTIME
-- Las tablas listadas aquí se sincronizan en vivo entre los dos celulares.
-- ============================================================

do $$
declare
  t text;
  tables text[] := array[
    'moods', 'missyou_taps', 'notes', 'couples',
    'daily_answers', 'capsule_entries', 'bucket_list_items',
    'calendar_events', 'expenses', 'member_status'
  ];
begin
  foreach t in array tables loop
    begin
      execute format(
        'alter publication supabase_realtime add table public.%I', t
      );
    exception when others then
      null; -- si la tabla ya estaba en la publicación, se ignora
    end;
  end loop;
end $$;


-- ============================================================
-- STORAGE
-- Bucket para fotos de la cápsula del tiempo y del bucket list.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('vinku-love-media', 'vinku-love-media', false)
on conflict (id) do nothing;

do $$
begin
  -- Política de subida segura: solo pueden subir a la carpeta de su propia pareja
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and policyname = 'media: members can upload'
  ) then
    create policy "media: members can upload"
      on storage.objects for insert
      with check (
        bucket_id = 'vinku-love-media' 
        and auth.uid() is not null
        and (string_to_array(name, '/'))[1] in (select couple_id::text from public.couple_members where profile_id = auth.uid())
      );
  end if;

  -- Eliminar la política insegura anterior si existe
  if exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and policyname = 'media: authenticated users can upload'
  ) then
    drop policy "media: authenticated users can upload" on storage.objects;
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and policyname = 'media: anyone can view'
  ) then
    drop policy "media: anyone can view" on storage.objects;
  end if;

  -- Política de lectura segura: solo pueden leer archivos de su propia pareja
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and policyname = 'media: members can view'
  ) then
    create policy "media: members can view"
      on storage.objects for select
      using (
        bucket_id = 'vinku-love-media' 
        and (string_to_array(name, '/'))[1] in (select couple_id::text from public.couple_members where profile_id = auth.uid())
      );
  end if;
end $$;
