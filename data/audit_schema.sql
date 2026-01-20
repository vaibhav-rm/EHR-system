CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor_id TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB
);

-- Secure the logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow Service Role (Backend) full access
CREATE POLICY "Enable access for service role only" ON public.audit_logs
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Deny public access (No anon policy)

COMMENT ON TABLE public.audit_logs IS 'HIPAA/ABDM compliant audit trail';
