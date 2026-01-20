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
