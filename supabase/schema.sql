-- SmartMenu MVP 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- 식당 테이블
create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  name_en text,
  slug text unique not null,
  description_ko text,
  description_en text,
  email text not null,
  phone text,
  address text,
  notification_email text, -- 주문 알림 받을 이메일 (기본: 가입 이메일)
  created_at timestamptz default now()
);

-- 메뉴 카테고리
create table if not exists menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  name_ko text not null,
  name_en text not null default '',
  sort_order int default 0
);

-- 메뉴 아이템
create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  category_id uuid references menu_categories(id) on delete set null,
  name_ko text not null,
  name_en text not null default '',
  description_ko text default '',
  description_en text default '',
  price int not null, -- 단위: 원(KRW)
  image_url text,
  is_available boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 주문 테이블
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  table_number text,
  items jsonb not null, -- [{id, name_ko, name_en, quantity, price}]
  total_price int not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'ready', 'completed')),
  tourist_language text default 'en',
  special_requests text default '',
  created_at timestamptz default now()
);

-- RLS (Row Level Security) 활성화
alter table restaurants enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;

-- RLS 정책: 기존 정책 삭제 후 재생성
drop policy if exists "restaurants: anyone can read" on restaurants;
drop policy if exists "restaurants: owner can insert" on restaurants;
drop policy if exists "restaurants: owner can update" on restaurants;
drop policy if exists "restaurants: owner can delete" on restaurants;

drop policy if exists "categories: anyone can read" on menu_categories;
drop policy if exists "categories: owner can insert" on menu_categories;
drop policy if exists "categories: owner can update" on menu_categories;
drop policy if exists "categories: owner can delete" on menu_categories;

drop policy if exists "items: anyone can read" on menu_items;
drop policy if exists "items: owner can insert" on menu_items;
drop policy if exists "items: owner can update" on menu_items;
drop policy if exists "items: owner can delete" on menu_items;

drop policy if exists "orders: anyone can insert" on orders;
drop policy if exists "orders: owner can read" on orders;
drop policy if exists "orders: owner can update" on orders;

-- RLS 정책: 식당 — 본인 것만 수정 가능, 누구나 읽기 가능
create policy "restaurants: anyone can read" on restaurants for select using (true);
create policy "restaurants: owner can insert" on restaurants for insert with check (auth.uid() = owner_id);
create policy "restaurants: owner can update" on restaurants for update using (auth.uid() = owner_id);
create policy "restaurants: owner can delete" on restaurants for delete using (auth.uid() = owner_id);

-- RLS 정책: 메뉴 카테고리 — 누구나 읽기, 식당 주인만 수정
create policy "categories: anyone can read" on menu_categories for select using (true);
create policy "categories: owner can insert" on menu_categories for insert
  with check (exists (select 1 from restaurants where id = restaurant_id and owner_id = auth.uid()));
create policy "categories: owner can update" on menu_categories for update
  using (exists (select 1 from restaurants where id = restaurant_id and owner_id = auth.uid()));
create policy "categories: owner can delete" on menu_categories for delete
  using (exists (select 1 from restaurants where id = restaurant_id and owner_id = auth.uid()));

-- RLS 정책: 메뉴 아이템 — 누구나 읽기, 식당 주인만 수정
create policy "items: anyone can read" on menu_items for select using (true);
create policy "items: owner can insert" on menu_items for insert
  with check (exists (select 1 from restaurants where id = restaurant_id and owner_id = auth.uid()));
create policy "items: owner can update" on menu_items for update
  using (exists (select 1 from restaurants where id = restaurant_id and owner_id = auth.uid()));
create policy "items: owner can delete" on menu_items for delete
  using (exists (select 1 from restaurants where id = restaurant_id and owner_id = auth.uid()));

-- RLS 정책: 주문 — 누구나 삽입 가능(관광객), 식당 주인만 읽기/업데이트
create policy "orders: anyone can insert" on orders for insert with check (true);
create policy "orders: owner can read" on orders for select
  using (exists (select 1 from restaurants where id = restaurant_id and owner_id = auth.uid()));
create policy "orders: owner can update" on orders for update
  using (exists (select 1 from restaurants where id = restaurant_id and owner_id = auth.uid()));
