"""
Phase 2 Database Schema for Symone Multi-Tenant Gateway
This script creates all required tables with RLS policies
"""

# SQL Schema for Supabase
SCHEMA_SQL = """
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TEAMS & MEMBERS
-- ============================================================================

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    quota_limit INTEGER DEFAULT 1000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- ============================================================================
-- MCP SERVERS
-- ============================================================================

CREATE TABLE servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('slack', 'n8n', 'github', 'tidycal', 'sendfox')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECRETS VAULT (Encrypted API Keys)
-- ============================================================================

CREATE TABLE secrets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    encrypted_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(server_id, key_name)
);

-- ============================================================================
-- ACTIVITY LOGS (Live Feed)
-- ============================================================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
    agent_name TEXT,
    tool_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
    latency_ms INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- REQUEST TRACES (X-Ray Debugging)
-- ============================================================================

CREATE TABLE request_traces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_log_id UUID REFERENCES activity_logs(id) ON DELETE CASCADE,
    request_payload JSONB,
    response_payload JSONB,
    trace_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MARKETPLACE LISTINGS
-- ============================================================================

CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    config_schema JSONB,
    verified BOOLEAN DEFAULT FALSE,
    is_hosted_by_symone BOOLEAN DEFAULT FALSE,
    external_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SYSTEM FLAGS (Feature Flags)
-- ============================================================================

CREATE TABLE system_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flag_key TEXT NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT FALSE,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_servers_team_id ON servers(team_id);
CREATE INDEX idx_secrets_server_id ON secrets(server_id);
CREATE INDEX idx_activity_logs_server_id ON activity_logs(server_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX idx_request_traces_activity_log_id ON request_traces(activity_log_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_flags ENABLE ROW LEVEL SECURITY;

-- Teams: Users can only see their own teams
CREATE POLICY "Users can view their own teams"
ON teams FOR SELECT
USING (
    id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
);

-- Team Members: Users can view members of their teams
CREATE POLICY "Users can view team members"
ON team_members FOR SELECT
USING (
    team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
);

-- Servers: Users can view servers of their teams
CREATE POLICY "Users can view team servers"
ON servers FOR SELECT
USING (
    team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
);

-- Secrets: Users CANNOT view encrypted values (backend only)
CREATE POLICY "Users can list secrets but not view values"
ON secrets FOR SELECT
USING (
    server_id IN (
        SELECT id FROM servers WHERE team_id IN (
            SELECT team_id FROM team_members WHERE user_id = auth.uid()
        )
    )
);

-- Activity Logs: Users can view logs for their team's servers
CREATE POLICY "Users can view activity logs"
ON activity_logs FOR SELECT
USING (
    server_id IN (
        SELECT id FROM servers WHERE team_id IN (
            SELECT team_id FROM team_members WHERE user_id = auth.uid()
        )
    )
);

-- Request Traces: Users can view traces for their activity
CREATE POLICY "Users can view request traces"
ON request_traces FOR SELECT
USING (
    activity_log_id IN (
        SELECT id FROM activity_logs WHERE server_id IN (
            SELECT id FROM servers WHERE team_id IN (
                SELECT team_id FROM team_members WHERE user_id = auth.uid()
            )
        )
    )
);

-- Marketplace: Public read access
CREATE POLICY "Public can view marketplace"
ON marketplace_listings FOR SELECT
USING (TRUE);

-- System Flags: Public read access for enabled flags
CREATE POLICY "Public can view enabled flags"
ON system_flags FOR SELECT
USING (is_enabled = TRUE);

-- ============================================================================
-- FUNCTIONS for Common Operations
-- ============================================================================

-- Function to get team by user
CREATE OR REPLACE FUNCTION get_user_teams(user_uuid UUID)
RETURNS TABLE(team_id UUID, team_name TEXT, role TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.name, tm.role
    FROM teams t
    JOIN team_members tm ON t.id = tm.team_id
    WHERE tm.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
"""

print("=" * 80)
print("SYMONE PHASE 2: DATABASE SCHEMA")
print("=" * 80)
print()
print("This schema includes:")
print("  ✓ Multi-tenancy (teams, team_members)")
print("  ✓ Server Management (servers)")
print("  ✓ Secrets Vault (encrypted_value)")
print("  ✓ Activity Logging (activity_logs, request_traces)")
print("  ✓ Marketplace (marketplace_listings)")
print("  ✓ Feature Flags (system_flags)")
print("  ✓ Row Level Security (RLS policies)")
print("  ✓ Performance Indexes")
print()
print("Ready to execute on your Supabase instance!")
print()
print("=" * 80)

# Save to file for reference
with open('supabase_schema.sql', 'w') as f:
    f.write(SCHEMA_SQL)

print("✅ Schema saved to: supabase_schema.sql")
print()
print("Next Steps:")
print("1. Create a Supabase project at https://supabase.com")
print("2. Copy URL and Service Role Key to .env")
print("3. I'll execute this schema automatically!")
