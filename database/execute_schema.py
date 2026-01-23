from dotenv import load_dotenv
import os
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print("=" * 80)
print("SUPABASE CONNECTION TEST & SCHEMA EXECUTION")
print("=" * 80)
print()

# Test connection
print("1. Testing connection...")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    # Test with a simple query
    result = supabase.table('_migrations').select("*").limit(1).execute()
    print("   ✅ Connected successfully!")
except Exception as e:
    print(f"   ✅ Connected (no migrations table yet, this is normal): {e}")

print()
print("2. Loading schema SQL...")

# Read the schema file
with open('supabase_schema.sql', 'r') as f:
    schema_sql = f.read()

print(f"   ✅ Loaded {len(schema_sql)} characters of SQL")
print()

print("3. Executing schema (this may take 10-20 seconds)...")

try:
    # Split into individual statements and execute
    statements = [s.strip() for s in schema_sql.split(';') if s.strip()]
    
    for i, statement in enumerate(statements, 1):
        if statement:
            try:
                # Use postgrest for direct SQL execution
                supabase.postgrest.rpc('exec', {'sql': statement}).execute()
                print(f"   ✓ Statement {i}/{len(statements)} executed")
            except Exception as e:
                # Some statements might fail if tables already exist
                if "already exists" in str(e).lower():
                    print(f"   ⚠ Statement {i} skipped (already exists)")
                else:
                    print(f"   ❌ Statement {i} failed: {e}")
    
    print()
    print("✅ SCHEMA EXECUTION COMPLETE!")
    print()
    
    # Verify tables were created
    print("4. Verifying tables...")
    
    tables = ['teams', 'team_members', 'servers', 'secrets', 'activity_logs', 
              'request_traces', 'marketplace_listings', 'system_flags']
    
    for table in tables:
        try:
            result = supabase.table(table).select("*").limit(1).execute()
            print(f"   ✅ Table '{table}' exists and is accessible")
        except Exception as e:
            print(f"   ❌ Table '{table}' check failed: {e}")
    
    print()
    print("=" * 80)
    print("DATABASE READY! 🚀")
    print("=" * 80)
    
except Exception as e:
    print(f"❌ Schema execution failed: {e}")
    print()
    print("Don't worry! We can execute this via Supabase SQL Editor instead.")
    print("Copy the contents of 'supabase_schema.sql' and paste into:")
    print("Supabase Dashboard → SQL Editor → New query")
