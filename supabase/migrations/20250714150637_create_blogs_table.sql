create table
  public.blogs (
    id uuid not null default gen_random_uuid (),
    title text not null,
    platform text,
    url text not null,
    published_at timestamptz not null,
    updated_at timestamptz,
    author text,
    read_time integer,
    tags text[],
    constraint blogs_pkey primary key (id),
    constraint blogs_url_key unique (url)
  );
