create table users (
  id uuid not null default gen_random_uuid (),
  username text null,
  address text null,
  password text null,
  email text null,
  permission integer null,
  is_verified boolean null,
  google_id text null,
  facebook_id text null,
  birthday date null,
  created_at timestamp without time zone null,
  updated_at timestamp without time zone null,
  constraint users_pkey primary key (id)
) TABLESPACE pg_default;

create table categories (
  id uuid not null default gen_random_uuid (),
  parent_category_id uuid null,
  name text null,
  slug text null,
  created_at timestamp without time zone null,
  constraint categories_pkey primary key (id),
  constraint categories_parent_category_id_fkey foreign KEY (parent_category_id) references categories (id)
) TABLESPACE pg_default;

create table auctions (
  id uuid not null default gen_random_uuid (),
  seller_id uuid null,
  category_id uuid null,
  name text null,
  description text null,
  start_price integer null,
  current_price integer null,
  buy_now_price integer null,
  bid_step integer null,
  start_at timestamp without time zone null,
  end_at timestamp without time zone null,
  created_at timestamp without time zone null,
  updated_at timestamp without time zone null default now(),
  fts tsvector GENERATED ALWAYS as (
    to_tsvector('english'::regconfig, remove_accents (name))
  ) STORED null,
  auto_renew boolean not null default false,
  is_informed boolean null default false,
  constraint auctions_pkey primary key (id),
  constraint auctions_category_id_fkey foreign KEY (category_id) references categories (id),
  constraint auctions_seller_id_fkey foreign KEY (seller_id) references users (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists auctions_fts on public.auctions using gin (fts) TABLESPACE pg_default;

create table bids (
  id uuid not null default gen_random_uuid (),
  auction_id uuid null,
  bidder_id uuid null,
  amount bigint null,
  created_at timestamp without time zone null,
  max_price bigint not null,
  constraint bibs_pkey primary key (id),
  constraint bibs_auction_id_fkey foreign KEY (auction_id) references auctions (id) on delete CASCADE,
  constraint bids_bidder_id_fkey foreign KEY (bidder_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table auction_block (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  user_id uuid null default null,
  auction_id uuid null,
  constraint auction_block_pkey primary key (id),
  constraint auction_block_auction_id_fkey foreign KEY (auction_id) references auctions (id) on delete CASCADE,
  constraint auction_block_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table auction_images (
  id uuid not null default gen_random_uuid (),
  auction_id uuid null,
  url text null,
  is_main boolean null,
  index integer null,
  created_at timestamp without time zone null,
  constraint auction_images_pkey primary key (id),
  constraint auction_images_auction_id_fkey foreign KEY (auction_id) references auctions (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.messages (
  id uuid not null default gen_random_uuid (),
  created_at timestamp without time zone not null,
  auction_id uuid null default gen_random_uuid (),
  sender_id uuid null,
  receiver_id uuid null,
  content text null,
  reply_id uuid null,
  constraint messages_pkey primary key (id),
  constraint messages_auction_id_fkey foreign KEY (auction_id) references auctions (id) on delete CASCADE,
  constraint messages_receiver_id_fkey foreign KEY (receiver_id) references users (id) on delete CASCADE,
  constraint messages_reply_id_fkey foreign KEY (reply_id) references messages (id) on delete CASCADE,
  constraint messages_sender_id_fkey foreign KEY (sender_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table orders (
  id serial not null,
  auction_id uuid not null,
  seller_id uuid not null,
  buyer_id uuid not null,
  final_price numeric(15, 2) not null,
  status character varying(50) not null default 'pending_payment'::character varying,
  payment_proof character varying(500) null,
  completed_at timestamp without time zone null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  cancelled_at timestamp without time zone null,
  constraint orders_pkey primary key (id),
  constraint orders_auction_id_key unique (auction_id),
  constraint orders_auction_id_fkey foreign KEY (auction_id) references auctions (id),
  constraint orders_buyer_id_fkey foreign KEY (buyer_id) references users (id) on delete CASCADE,
  constraint orders_seller_id_fkey foreign KEY (seller_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_orders_auction_id on public.orders using btree (auction_id) TABLESPACE pg_default;

create index IF not exists idx_orders_seller_id on public.orders using btree (seller_id) TABLESPACE pg_default;

create index IF not exists idx_orders_buyer_id on public.orders using btree (buyer_id) TABLESPACE pg_default;

create index IF not exists idx_orders_status on public.orders using btree (status) TABLESPACE pg_default;

create trigger trigger_update_orders_updated_at BEFORE
update on orders for EACH row
execute FUNCTION update_orders_updated_at ();

create table order_messages (
  id uuid not null default gen_random_uuid (),
  order_id integer not null,
  sender_id uuid not null,
  content text not null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint order_messages_pkey primary key (id),
  constraint order_messages_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint order_messages_sender_id_fkey foreign KEY (sender_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_order_messages_order_id on public.order_messages using btree (order_id) TABLESPACE pg_default;

create index IF not exists idx_order_messages_created_at on public.order_messages using btree (created_at) TABLESPACE pg_default;

create table pending_users (
  id uuid not null default gen_random_uuid (),
  email text null,
  otp integer null,
  user_id uuid null,
  message text null,
  redirect_to text null,
  created_at timestamp without time zone null,
  expired_at timestamp without time zone null,
  constraint pending_users_pkey primary key (id),
  constraint pending_users_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table sessions (
  sid character varying(255) not null,
  sess json not null,
  expired timestamp with time zone not null,
  constraint sessions_pkey primary key (sid)
) TABLESPACE pg_default;

create index IF not exists sessions_expired_index on public.sessions using btree (expired) TABLESPACE pg_default;

create table user_ratings (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  rater_id uuid null,
  rated_id uuid null,
  rating bigint null,
  auction_id uuid null,
  content text null,
  constraint user_ratings_pkey primary key (id),
  constraint user_ratings_auction_id_fkey foreign KEY (auction_id) references auctions (id) on delete set null,
  constraint user_ratings_rated_id_fkey foreign KEY (rated_id) references users (id) on delete CASCADE,
  constraint user_ratings_rater_id_fkey foreign KEY (rater_id) references users (id) on delete set null
) TABLESPACE pg_default;

create table watchlists (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  auction_id uuid null,
  created_at timestamp without time zone null,
  constraint watchlists_pkey primary key (id),
  constraint watchlists_auction_id_fkey foreign KEY (auction_id) references auctions (id) on delete CASCADE,
  constraint watchlists_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;