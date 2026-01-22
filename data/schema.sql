-- Create a table to store FHIR resources as JSONB
create table if not exists fhir_resources (
  id uuid primary key,
  resource_type text not null,
  resource jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create an index on specific fields within the JSONB column for faster searching
-- Index for resourceType (though we have a column, having it in JSON is redundant but standard FHIR)
create index if not exists idx_fhir_resource_type on fhir_resources(resource_type);

-- GIN index for faster full JSON searching
create index if not exists idx_fhir_resource_gin on fhir_resources using gin (resource);

-- Create doctors table to store application-specific profile data (syncs with FHIR Practitioner)
create table if not exists doctors (
  id uuid primary key references auth.users(id),
  name text,
  email text,
  specialization text,
  qualification text,
  hospital text,
  phone text,
  fee numeric,
  years_of_experience integer,
  profile_image_url text,
  header_role text default 'doctor',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table doctors enable row level security;

-- Policies
create policy "Doctors can view their own profile"
  on doctors for select
  using ( auth.uid() = id );

create policy "Doctors can update their own profile"
  on doctors for update
  using ( auth.uid() = id );

create policy "Doctors can insert their own profile"
  on doctors for insert
  with check ( auth.uid() = id );

-- Allow public read access (for booking page if we switched to reading from here, or for generic directory)
create policy "Public can view doctors"
  on doctors for select
  using ( true );

