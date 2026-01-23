from mcp.server.fastmcp import FastMCP
from dotenv import load_dotenv
import json
import sys
import os
from supabase import create_client, Client

# Handle both script and module execution
if __name__ == "__main__":
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))
    from src.servers.supabase.models import (
        SupabaseQuerySchema, SupabaseTableListSchema, SupabaseSelectSchema,
        SupabaseInsertSchema, SupabaseUpdateSchema, SupabaseDeleteSchema,
        SupabaseListBucketsSchema, SupabaseCreateBucketSchema, SupabaseListFilesSchema,
        SupabaseUploadFileSchema, SupabaseDeleteFileSchema, SupabaseListUsersSchema,
        SupabaseGetUserSchema, SupabaseCreateUserSchema, SupabaseCreateRLSPolicySchema,
        SupabaseEnableRLSSchema
    )
else:
    from .models import (
        SupabaseQuerySchema, SupabaseTableListSchema, SupabaseSelectSchema,
        SupabaseInsertSchema, SupabaseUpdateSchema, SupabaseDeleteSchema,
        SupabaseListBucketsSchema, SupabaseCreateBucketSchema, SupabaseListFilesSchema,
        SupabaseUploadFileSchema, SupabaseDeleteFileSchema, SupabaseListUsersSchema,
        SupabaseGetUserSchema, SupabaseCreateUserSchema, SupabaseCreateRLSPolicySchema,
        SupabaseEnableRLSSchema
    )

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL not found in .env")
if not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY not found in .env")

# Initialize Supabase Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Initialize MCP Server
mcp = FastMCP("Symone Supabase Server - Meta-Tooling Edition")

# ============================================================================
# DATABASE QUERY TOOLS
# ============================================================================

@mcp.tool(
    name="supabase_run_query",
    description="Execute a raw SQL query (USE CAREFULLY - has full database access)",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": True,
        "idempotentHint": False,
        "openWorldHint": True,
    }
)
def run_query(params: SupabaseQuerySchema) -> str:
    """Executes a raw SQL query."""
    try:
        result = supabase.rpc('exec_sql', {'query': params.query}).execute()
        return json.dumps({"success": True, "data": result.data})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@mcp.tool(
    name="supabase_list_tables",
    description="List all tables in the database schema",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def list_tables(params: SupabaseTableListSchema) -> str:
    """Lists database tables."""
    try:
        query = f"""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = '{params.schema_name}'
        ORDER BY table_name;
        """
        result = supabase.rpc('exec_sql', {'query': query}).execute()
        return json.dumps({"success": True, "tables": result.data})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@mcp.tool(
    name="supabase_select",
    description="Query data from a table with filters",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def select_data(params: SupabaseSelectSchema) -> str:
    """Selects data from a table."""
    try:
        query = supabase.table(params.table).select(params.columns)
        
        if params.filters:
            for key, value in params.filters.items():
                query = query.eq(key, value)
        
        result = query.limit(params.limit).execute()
        return json.dumps({"success": True, "data": result.data, "count": len(result.data)})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@mcp.tool(
    name="supabase_insert",
    description="Insert a row into a table",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    }
)
def insert_data(params: SupabaseInsertSchema) -> str:
    """Inserts data into a table."""
    try:
        result = supabase.table(params.table).insert(params.data).execute()
        return json.dumps({"success": True, "data": result.data})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@mcp.tool(
    name="supabase_update",
    description="Update rows in a table",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    }
)
def update_data(params: SupabaseUpdateSchema) -> str:
    """Updates data in a table."""
    try:
        query = supabase.table(params.table).update(params.data)
        
        for key, value in params.filters.items():
            query = query.eq(key, value)
        
        result = query.execute()
        return json.dumps({"success": True, "data": result.data})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@mcp.tool(
    name="supabase_delete",
    description="Delete rows from a table",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": True,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def delete_data(params: SupabaseDeleteSchema) -> str:
    """Deletes data from a table."""
    try:
        query = supabase.table(params.table).delete()
        
        for key, value in params.filters.items():
            query = query.eq(key, value)
        
        result = query.execute()
        return json.dumps({"success": True, "deleted_count": len(result.data)})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

# ============================================================================
# STORAGE TOOLS
# ============================================================================

@mcp.tool(
    name="supabase_list_buckets",
    description="List all storage buckets",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def list_buckets(params: SupabaseListBucketsSchema) -> str:
    """Lists storage buckets."""
    try:
        result = supabase.storage.list_buckets()
        return json.dumps({"success": True, "buckets": result})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@mcp.tool(
    name="supabase_create_bucket",
    description="Create a new storage bucket",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def create_bucket(params: SupabaseCreateBucketSchema) -> str:
    """Creates a storage bucket."""
    try:
        result = supabase.storage.create_bucket(params.name, {"public": params.public})
        return json.dumps({"success": True, "bucket": result})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@mcp.tool(
    name="supabase_list_files",
    description="List files in a storage bucket",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def list_files(params: SupabaseListFilesSchema) -> str:
    """Lists files in a bucket."""
    try:
        result = supabase.storage.from_(params.bucket).list(params.path)
        return json.dumps({"success": True, "files": result})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@mcp.tool(
    name="supabase_upload_file",
    description="Upload a file to storage",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    }
)
def upload_file(params: SupabaseUploadFileSchema) -> str:
    """Uploads a file to storage."""
    try:
        with open(params.file_path, 'rb') as f:
            result = supabase.storage.from_(params.bucket).upload(params.path, f)
        return json.dumps({"success": True, "path": result.path})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@mcp.tool(
    name="supabase_delete_file",
    description="Delete a file from storage",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": True,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def delete_file(params: SupabaseDeleteFileSchema) -> str:
    """Deletes a file from storage."""
    try:
        result = supabase.storage.from_(params.bucket).remove([params.path])
        return json.dumps({"success": True, "deleted": result})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

# ============================================================================
# AUTH TOOLS
# ============================================================================

@mcp.tool(
    name="supabase_list_users",
    description="List all users (admin only)",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def list_users(params: SupabaseListUsersSchema) -> str:
    """Lists users."""
    try:
        result = supabase.auth.admin.list_users(page=params.page, per_page=params.per_page)
        return json.dumps({"success": True, "users": [{"id": u.id, "email": u.email, "created_at": str(u.created_at)} for u in result]})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@mcp.tool(
    name="supabase_get_user",
    description="Get user details by ID",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def get_user(params: SupabaseGetUserSchema) -> str:
    """Gets user by ID."""
    try:
        result = supabase.auth.admin.get_user_by_id(params.user_id)
        return json.dumps({"success": True, "user": {"id": result.user.id, "email": result.user.email}})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@mcp.tool(
    name="supabase_create_user",
    description="Create a new user (admin only)",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    }
)
def create_user(params: SupabaseCreateUserSchema) -> str:
    """Creates a user."""
    try:
        result = supabase.auth.admin.create_user({
            "email": params.email,
            "password": params.password,
            "email_confirm": params.email_confirm
        })
        return json.dumps({"success": True, "user_id": result.user.id})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

# ============================================================================
# RLS (Row Level Security) TOOLS
# ============================================================================

@mcp.tool(
    name="supabase_enable_rls",
    description="Enable Row Level Security on a table",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def enable_rls(params: SupabaseEnableRLSSchema) -> str:
    """Enables RLS on a table."""
    try:
        query = f"ALTER TABLE {params.schema_name}.{params.table} ENABLE ROW LEVEL SECURITY;"
        result = supabase.rpc('exec_sql', {'query': query}).execute()
        return json.dumps({"success": True})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@mcp.tool(
    name="supabase_create_rls_policy",
    description="Create a Row Level Security policy",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    }
)
def create_rls_policy(params: SupabaseCreateRLSPolicySchema) -> str:
    """Creates an RLS policy."""
    try:
        check_clause = f"WITH CHECK ({params.check})" if params.check else ""
        query = f"""
        CREATE POLICY {params.policy_name}
        ON {params.table}
        FOR {params.command}
        USING ({params.definition})
        {check_clause};
        """
        result = supabase.rpc('exec_sql', {'query': query}).execute()
        return json.dumps({"success": True, "policy": params.policy_name})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

if __name__ == "__main__":
    mcp.run()
