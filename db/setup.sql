-- ============================================================
-- Pitch Picks · Initial schema
-- Run with Supabase CLI:  supabase db push
-- Or paste db/setup.sql into the Supabase SQL editor.
-- ============================================================

create extension if not exists "pgcrypto";

-- Enums --------------------------------------------------------
create type public.app_role as enum ('admin', 'member');
create type public.match_stage as enum ('group', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final');
create type public.match_status as enum ('scheduled', 'live', 'finished', 'postponed', 'cancelled');
create type public.bonus_kind as enum ('top_scorer', 'mvp', 'best_goalkeeper', 'most_assists', 'champion', 'runner_up');

-- Profiles -----------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Profiles readable by authenticated" on public.profiles
  for select to authenticated using (true);
create policy "Users insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end;$$;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Leagues ------------------------------------------------------
create table public.leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  max_members int not null default 20 check (max_members between 2 and 200),
  points_perfect int not null default 3,
  points_outcome int not null default 1,
  points_wrong int not null default 0,
  points_bonus int not null default 5,
  bonus_lock_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);
alter table public.leagues enable row level security;

create table public.league_members (
  league_id uuid not null references public.leagues(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  role      public.app_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (league_id, user_id)
);
alter table public.league_members enable row level security;

-- Security-definer helpers (avoid recursive RLS)
create or replace function public.is_league_member(_league uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.league_members where league_id = _league and user_id = _user)
$$;
create or replace function public.has_league_role(_league uuid, _user uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.league_members where league_id = _league and user_id = _user and role = _role)
$$;

create policy "Members read leagues" on public.leagues
  for select to authenticated using (public.is_league_member(id, auth.uid()));
create policy "Authenticated create leagues" on public.leagues
  for insert to authenticated with check (auth.uid() = created_by);
create policy "Admins update league" on public.leagues
  for update to authenticated using (public.has_league_role(id, auth.uid(), 'admin'));
create policy "Admins delete league" on public.leagues
  for delete to authenticated using (public.has_league_role(id, auth.uid(), 'admin'));

create policy "Members read membership" on public.league_members
  for select to authenticated using (public.is_league_member(league_id, auth.uid()));
create policy "Users join self" on public.league_members
  for insert to authenticated with check (user_id = auth.uid());
create policy "Admins update membership" on public.league_members
  for update to authenticated using (public.has_league_role(league_id, auth.uid(), 'admin'));
create policy "User leaves or admin removes" on public.league_members
  for delete to authenticated using (user_id = auth.uid() or public.has_league_role(league_id, auth.uid(), 'admin'));

create or replace function public.handle_new_league()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.league_members (league_id, user_id, role)
  values (new.id, new.created_by, 'admin');
  return new;
end;$$;
create trigger on_league_created
  after insert on public.leagues for each row execute function public.handle_new_league();

create or replace function public.enforce_league_capacity()
returns trigger language plpgsql security definer set search_path = public as $$
declare cap int; current_count int;
begin
  select max_members into cap from public.leagues where id = new.league_id;
  select count(*) into current_count from public.league_members where league_id = new.league_id;
  if current_count >= cap then raise exception 'League is full (max % members)', cap; end if;
  return new;
end;$$;
create trigger before_member_insert
  before insert on public.league_members for each row execute function public.enforce_league_capacity();

-- Matches ------------------------------------------------------
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  stage public.match_stage not null,
  group_label text,
  matchday int,
  kickoff_at timestamptz not null,
  status public.match_status not null default 'scheduled',
  home_team text not null,
  away_team text not null,
  home_flag text,
  away_flag text,
  home_score int,
  away_score int,
  updated_at timestamptz not null default now()
);
alter table public.matches enable row level security;
create index matches_kickoff_idx on public.matches (kickoff_at);
create policy "Read matches" on public.matches for select to authenticated using (true);

-- Predictions --------------------------------------------------
create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  match_id  uuid not null references public.matches(id) on delete cascade,
  home_score int not null check (home_score between 0 and 30),
  away_score int not null check (away_score between 0 and 30),
  points_awarded int,
  is_perfect boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (league_id, user_id, match_id)
);
alter table public.predictions enable row level security;
create index predictions_user_idx on public.predictions (user_id, league_id);
create index predictions_match_idx on public.predictions (match_id);

create or replace function public.guard_prediction_lock()
returns trigger language plpgsql security definer set search_path = public as $$
declare ko timestamptz;
begin
  select kickoff_at into ko from public.matches where id = new.match_id;
  if ko is null then raise exception 'Match not found'; end if;
  if now() >= ko then raise exception 'Predictions are locked for this match'; end if;
  if not public.is_league_member(new.league_id, new.user_id) then
    raise exception 'User is not a member of this league';
  end if;
  new.updated_at = now();
  return new;
end;$$;
create trigger before_prediction_write
  before insert or update on public.predictions
  for each row execute function public.guard_prediction_lock();

create policy "Members read predictions" on public.predictions
  for select to authenticated using (public.is_league_member(league_id, auth.uid()));
create policy "Users insert own predictions" on public.predictions
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_league_member(league_id, auth.uid()));
create policy "Users update own predictions" on public.predictions
  for update to authenticated using (user_id = auth.uid());
create policy "Users delete own predictions" on public.predictions
  for delete to authenticated using (user_id = auth.uid());

-- Bonus bets ---------------------------------------------------
create table public.bonus_bets (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  kind      public.bonus_kind not null,
  pick      text not null,
  points_awarded int,
  created_at timestamptz not null default now(),
  unique (league_id, user_id, kind)
);
alter table public.bonus_bets enable row level security;

create or replace function public.guard_bonus_lock()
returns trigger language plpgsql security definer set search_path = public as $$
declare lock_at timestamptz;
begin
  select bonus_lock_at into lock_at from public.leagues where id = new.league_id;
  if lock_at is not null and now() >= lock_at then
    raise exception 'Bonus bets are locked for this league';
  end if;
  if not public.is_league_member(new.league_id, new.user_id) then
    raise exception 'User is not a member of this league';
  end if;
  return new;
end;$$;
create trigger before_bonus_write
  before insert or update on public.bonus_bets
  for each row execute function public.guard_bonus_lock();

create policy "Members read bonus" on public.bonus_bets
  for select to authenticated using (public.is_league_member(league_id, auth.uid()));
create policy "Users write own bonus" on public.bonus_bets
  for insert to authenticated with check (user_id = auth.uid());
create policy "Users update own bonus" on public.bonus_bets
  for update to authenticated using (user_id = auth.uid());
create policy "Users delete own bonus" on public.bonus_bets
  for delete to authenticated using (user_id = auth.uid());

create table public.bonus_results (
  kind public.bonus_kind primary key,
  correct_pick text not null,
  resolved_at timestamptz not null default now()
);
alter table public.bonus_results enable row level security;
create policy "Read bonus results" on public.bonus_results
  for select to authenticated using (true);

-- Leaderboard view --------------------------------------------
create or replace view public.leaderboard as
select
  lm.league_id, lm.user_id, p.display_name, p.avatar_url,
  coalesce(sum(pr.points_awarded), 0)
    + coalesce((select sum(bb.points_awarded) from public.bonus_bets bb
                where bb.league_id = lm.league_id and bb.user_id = lm.user_id), 0) as total_points,
  coalesce(sum(case when pr.is_perfect then 1 else 0 end), 0) as perfects,
  count(pr.id) as predictions_made
from public.league_members lm
join public.profiles p on p.id = lm.user_id
left join public.predictions pr on pr.league_id = lm.league_id and pr.user_id = lm.user_id
group by lm.league_id, lm.user_id, p.display_name, p.avatar_url;
grant select on public.leaderboard to authenticated;

-- RPC: join by code -------------------------------------------
create or replace function public.join_league_by_code(_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare l_id uuid;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select id into l_id from public.leagues where invite_code = _code;
  if l_id is null then raise exception 'Invalid invite code'; end if;
  insert into public.league_members (league_id, user_id, role) values (l_id, auth.uid(), 'member')
    on conflict (league_id, user_id) do nothing;
  return l_id;
end;$$;
grant execute on function public.join_league_by_code(text) to authenticated;

-- Scoring ------------------------------------------------------
create or replace function public.score_match(_match_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare m record; l record; pr record; pts int; perfect boolean;
        pred_outcome int; actual_outcome int;
begin
  select * into m from public.matches where id = _match_id;
  if m.status <> 'finished' or m.home_score is null or m.away_score is null then return; end if;
  actual_outcome := sign(m.home_score - m.away_score);
  for pr in select * from public.predictions where match_id = _match_id loop
    select * into l from public.leagues where id = pr.league_id;
    perfect := (pr.home_score = m.home_score and pr.away_score = m.away_score);
    pred_outcome := sign(pr.home_score - pr.away_score);
    if perfect then pts := l.points_perfect;
    elsif pred_outcome = actual_outcome then pts := l.points_outcome;
    else pts := l.points_wrong; end if;
    update public.predictions
      set points_awarded = pts, is_perfect = perfect, updated_at = now()
      where id = pr.id;
  end loop;
end;$$;

create or replace function public.score_bonus(_kind public.bonus_kind)
returns void language plpgsql security definer set search_path = public as $$
declare correct text;
begin
  select correct_pick into correct from public.bonus_results where kind = _kind;
  if correct is null then return; end if;
  update public.bonus_bets bb set points_awarded = case
    when lower(bb.pick) = lower(correct) then (select points_bonus from public.leagues l where l.id = bb.league_id)
    else 0 end
  where bb.kind = _kind;
end;$$;