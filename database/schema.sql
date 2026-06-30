-- Create users_profile table
create table public.users_profile (
    id uuid references auth.users on delete cascade primary key,
    name text,
    email text,
    goals text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create chat_history table
create table public.chat_history (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    user_message text not null,
    ai_response text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create daily_checkin table
create table public.daily_checkin (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    mood text not null,
    ai_note text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create wellness_score table
create table public.wellness_score (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    sleep integer not null,
    water integer not null,
    exercise integer not null,
    mood integer not null,
    total_score integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create journal table
create table public.journal (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    content text not null,
    ai_summary text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create habits table
create table public.habits (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    habit_name text not null,
    completed boolean default false not null,
    streak integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on all tables
alter table public.users_profile enable row level security;
alter table public.chat_history enable row level security;
alter table public.daily_checkin enable row level security;
alter table public.wellness_score enable row level security;
alter table public.journal enable row level security;
alter table public.habits enable row level security;

-- Create RLS Policies
create policy "Users can view own profile" on public.users_profile for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users_profile for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users_profile for insert with check (auth.uid() = id);

create policy "Users can view own chat history" on public.chat_history for select using (auth.uid() = user_id);
create policy "Users can insert own chat history" on public.chat_history for insert with check (auth.uid() = user_id);

create policy "Users can view own daily checkin" on public.daily_checkin for select using (auth.uid() = user_id);
create policy "Users can insert own daily checkin" on public.daily_checkin for insert with check (auth.uid() = user_id);

create policy "Users can view own wellness score" on public.wellness_score for select using (auth.uid() = user_id);
create policy "Users can insert own wellness score" on public.wellness_score for insert with check (auth.uid() = user_id);

create policy "Users can view own journal" on public.journal for select using (auth.uid() = user_id);
create policy "Users can insert own journal" on public.journal for insert with check (auth.uid() = user_id);

create policy "Users can view own habits" on public.habits for select using (auth.uid() = user_id);
create policy "Users can insert own habits" on public.habits for insert with check (auth.uid() = user_id);
create policy "Users can update own habits" on public.habits for update using (auth.uid() = user_id);
create policy "Users can delete own habits" on public.habits for delete using (auth.uid() = user_id);

-- Create profile trigger on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users_profile (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'User'), new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
