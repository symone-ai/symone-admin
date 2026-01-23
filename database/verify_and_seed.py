from dotenv import load_dotenv
import os
from supabase import create_client, Client
import json

load_dotenv()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

print("=" * 80)
print("SYMONE DATABASE VERIFICATION")
print("=" * 80)
print()

tables = ['teams', 'team_members', 'servers', 'secrets', 'activity_logs', 
          'request_traces', 'marketplace_listings', 'system_flags']

for table in tables:
    try:
        result = supabase.table(table).select("count", count='exact').execute()
        print(f"✅ {table:25} - {result.count} rows")
    except Exception as e:
        print(f"❌ {table:25} - Error: {str(e)[:50]}")

print()
print("=" * 80)
print("Next: Seeding test data...")
print("=" * 80)

# Create test team
print("\n1. Creating test team...")
try:
    team_result = supabase.table('teams').insert({
        "name": "Test Team",
        "plan": "pro",
        "quota_limit": 10000
    }).execute()
    team_id = team_result.data[0]['id']
    print(f"   ✅ Created team: {team_id}")
    
    # Create test server
    print("\n2. Creating test Slack server...")
    server_result = supabase.table('servers').insert({
        "team_id": team_id,
        "name": "Slack - Internet Mogul",
        "type": "slack",
        "status": "active",
        "config": json.dumps({"workspace": "internetmogul"})
    }).execute()
    server_id = server_result.data[0]['id']
    print(f"   ✅ Created server: {server_id}")
    
    # Create test activity log
    print("\n3. Creating sample activity log...")
    log_result = supabase.table('activity_logs').insert({
        "server_id": server_id,
        "agent_name": "claude",
        "tool_name": "slack_post_message",
        "status": "success",
        "latency_ms": 245
    }).execute()
    print(f"   ✅ Created activity log: {log_result.data[0]['id']}")
    
    # Create marketplace listing
    print("\n4. Adding marketplace listing...")
    listing_result = supabase.table('marketplace_listings').insert({
        "name": "Slack Integration",
        "category": "communication",
        "description": "Full Slack workspace automation with 20 tools",
        "verified": True,
        "is_hosted_by_symone": True
    }).execute()
    print(f"   ✅ Created listing: {listing_result.data[0]['id']}")
    
    print("\n" + "=" * 80)
    print("✅ TEST DATA SEEDED SUCCESSFULLY!")
    print("=" * 80)
    print()
    print("Your Symone database is ready for Phase 2 Gateway development!")
    
except Exception as e:
    print(f"❌ Error seeding data: {e}")
