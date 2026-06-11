-- 1. Create the user_data table to store all highlights, notes, and bookmarks
create table public.user_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  book text not null,
  chapter integer not null,
  verse integer not null,
  type text not null, -- 'highlight', 'bookmark', 'note'
  color text, -- For highlights
  content text, -- For notes
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Turn on Row Level Security (RLS) so users can only see their own data
alter table public.user_data enable row level security;

-- 3. Create security policies
create policy "Users can view their own data" on public.user_data
  for select using (auth.uid() = user_id);

create policy "Users can insert their own data" on public.user_data
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own data" on public.user_data
  for update using (auth.uid() = user_id);

create policy "Users can delete their own data" on public.user_data
  for delete using (auth.uid() = user_id);
