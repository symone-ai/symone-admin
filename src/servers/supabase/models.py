from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any

# ============================================================================
# DATABASE QUERY MODELS
# ============================================================================

class SupabaseQuerySchema(BaseModel):
    """Schema for running a SQL query."""
    model_config = ConfigDict(extra='forbid')
    
    query: str = Field(..., description="SQL query to execute.")

class SupabaseTableListSchema(BaseModel):
    """Schema for listing tables."""
    model_config = ConfigDict(extra='forbid')
    
    schema_name: str = Field(default="public", description="Database schema (default: public).")

class SupabaseSelectSchema(BaseModel):
    """Schema for SELECT queries with filters."""
    model_config = ConfigDict(extra='forbid')
    
    table: str = Field(..., description="Table name.")
    columns: Optional[str] = Field(default="*", description="Columns to select (default: *).")
    filters: Optional[Dict[str, Any]] = Field(None, description="Filter conditions as key-value pairs.")
    limit: int = Field(default=10, ge=1, le=1000, description="Row limit.")

class SupabaseInsertSchema(BaseModel):
    """Schema for INSERT operations."""
    model_config = ConfigDict(extra='forbid')
    
    table: str = Field(..., description="Table name.")
    data: Dict[str, Any] = Field(..., description="Row data to insert.")

class SupabaseUpdateSchema(BaseModel):
    """Schema for UPDATE operations."""
    model_config = ConfigDict(extra='forbid')
    
    table: str = Field(..., description="Table name.")
    data: Dict[str, Any] = Field(..., description="Data to update.")
    filters: Dict[str, Any] = Field(..., description="Filter conditions for rows to update.")

class SupabaseDeleteSchema(BaseModel):
    """Schema for DELETE operations."""
    model_config = ConfigDict(extra='forbid')
    
    table: str = Field(..., description="Table name.")
    filters: Dict[str, Any] = Field(..., description="Filter conditions for rows to delete.")

# ============================================================================
# STORAGE MODELS
# ============================================================================

class SupabaseListBucketsSchema(BaseModel):
    """Schema for listing storage buckets."""
    model_config = ConfigDict(extra='forbid')
    
    pass  # No params needed

class SupabaseCreateBucketSchema(BaseModel):
    """Schema for creating a storage bucket."""
    model_config = ConfigDict(extra='forbid')
    
    name: str = Field(..., description="Bucket name.")
    public: bool = Field(default=False, description="Make bucket public.")

class SupabaseListFilesSchema(BaseModel):
    """Schema for listing files in a bucket."""
    model_config = ConfigDict(extra='forbid')
    
    bucket: str = Field(..., description="Bucket name.")
    path: str = Field(default="", description="Folder path (default: root).")

class SupabaseUploadFileSchema(BaseModel):
    """Schema for uploading a file."""
    model_config = ConfigDict(extra='forbid')
    
    bucket: str = Field(..., description="Bucket name.")
    path: str = Field(..., description="File path in bucket.")
    file_path: str = Field(..., description="Local file path to upload.")

class SupabaseDeleteFileSchema(BaseModel):
    """Schema for deleting a file."""
    model_config = ConfigDict(extra='forbid')
    
    bucket: str = Field(..., description="Bucket name.")
    path: str = Field(..., description="File path to delete.")

# ============================================================================
# AUTH MODELS
# ============================================================================

class SupabaseListUsersSchema(BaseModel):
    """Schema for listing users."""
    model_config = ConfigDict(extra='forbid')
    
    page: int = Field(default=1, ge=1, description="Page number.")
    per_page: int = Field(default=50, ge=1, le=1000, description="Users per page.")

class SupabaseGetUserSchema(BaseModel):
    """Schema for getting user by ID."""
    model_config = ConfigDict(extra='forbid')
    
    user_id: str = Field(..., description="User UUID.")

class SupabaseCreateUserSchema(BaseModel):
    """Schema for creating a user (admin)."""
    model_config = ConfigDict(extra='forbid')
    
    email: str = Field(..., description="User email.")
    password: str = Field(..., description="User password.")
    email_confirm: bool = Field(default=False, description="Auto-confirm email.")

# ============================================================================
# RLS (Row Level Security) MODELS
# ============================================================================

class SupabaseCreateRLSPolicySchema(BaseModel):
    """Schema for creating RLS policy."""
    model_config = ConfigDict(extra='forbid')
    
    table: str = Field(..., description="Table name.")
    policy_name: str = Field(..., description="Policy name.")
    command: str = Field(..., description="Command: SELECT, INSERT, UPDATE, DELETE, ALL.")
    definition: str = Field(..., description="SQL expression for the policy.")
    check: Optional[str] = Field(None, description="CHECK expression for INSERT/UPDATE.")

class SupabaseEnableRLSSchema(BaseModel):
    """Schema for enabling RLS on a table."""
    model_config = ConfigDict(extra='forbid')
    
    table: str = Field(..., description="Table name.")
    schema_name: str = Field(default="public", description="Schema name.")
