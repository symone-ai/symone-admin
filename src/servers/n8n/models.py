from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any

# ============================================================================
# WORKFLOW MODELS
# ============================================================================

class N8nListWorkflowsSchema(BaseModel):
    """Schema for listing workflows."""
    model_config = ConfigDict(extra='forbid')
    
    limit: int = Field(default=20, ge=1, le=100, description="Number of workflows to return.")

class N8nGetWorkflowSchema(BaseModel):
    """Schema for getting a specific workflow."""
    model_config = ConfigDict(extra='forbid')
    
    workflow_id: str = Field(..., description="Workflow ID.")

class N8nCreateWorkflowSchema(BaseModel):
    """Schema for creating a workflow."""
    model_config = ConfigDict(extra='forbid')
    
    name: str = Field(..., description="Workflow name.")
    nodes: List[Dict[str, Any]] = Field(..., description="Workflow nodes configuration.")
    connections: Dict[str, Any] = Field(..., description="Node connections.")
    settings: Optional[Dict[str, Any]] = Field(default=None, description="Workflow settings.")

class N8nUpdateWorkflowSchema(BaseModel):
    """Schema for updating a workflow."""
    model_config = ConfigDict(extra='forbid')
    
    workflow_id: str = Field(..., description="Workflow ID.")
    name: Optional[str] = Field(None, description="New workflow name.")
    nodes: Optional[List[Dict(str, Any]]] = Field(None, description="Updated nodes.")
    connections: Optional[Dict[str, Any]] = Field(None, description="Updated connections.")

class N8nDeleteWorkflowSchema(BaseModel):
    """Schema for deleting a workflow."""
    model_config = ConfigDict(extra='forbid')
    
    workflow_id: str = Field(..., description="Workflow ID to delete.")

class N8nActivateWorkflowSchema(BaseModel):
    """Schema for activating/deactivating a workflow."""
    model_config = ConfigDict(extra='forbid')
    
    workflow_id: str = Field(..., description="Workflow ID.")
    activate: bool = Field(..., description="True to activate, False to deactivate.")

# ============================================================================
# EXECUTION MODELS
# ============================================================================

class N8nListExecutionsSchema(BaseModel):
    """Schema for listing workflow executions."""
    model_config = ConfigDict(extra='forbid')
    
    workflow_id: Optional[str] = Field(None, description="Filter by workflow ID.")
    limit: int = Field(default=20, ge=1, le=100, description="Number of executions to return.")
    status: Optional[str] = Field(None, description="Filter by status: success, error, waiting.")

class N8nGetExecutionSchema(BaseModel):
    """Schema for getting execution details."""
    model_config = ConfigDict(extra='forbid')
    
    execution_id: str = Field(..., description="Execution ID.")

class N8nDeleteExecutionSchema(BaseModel):
    """Schema for deleting an execution."""
    model_config = ConfigDict(extra='forbid')
    
    execution_id: str = Field(..., description="Execution ID to delete.")

class N8nRetryExecutionSchema(BaseModel):
    """Schema for retrying a failed execution."""
    model_config = ConfigDict(extra='forbid')
    
    execution_id: str = Field(..., description="Execution ID to retry.")

class N8nExecuteWorkflowSchema(BaseModel):
    """Schema for manually executing a workflow."""
    model_config = ConfigDict(extra='forbid')
    
    workflow_id: str = Field(..., description="Workflow ID to execute.")
    data: Optional[Dict[str, Any]] = Field(None, description="Input data for the workflow.")

# ============================================================================
# TAG MODELS
# ============================================================================

class N8nListTagsSchema(BaseModel):
    """Schema for listing tags."""
    model_config = ConfigDict(extra='forbid')
    
    # No params needed
    pass

class N8nCreateTagSchema(BaseModel):
    """Schema for creating a tag."""
    model_config = ConfigDict(extra='forbid')
    
    name: str = Field(..., description="Tag name.")

class N8nUpdateWorkflowTagsSchema(BaseModel):
    """Schema for updating workflow tags."""
    model_config = ConfigDict(extra='forbid')
    
    workflow_id: str = Field(..., description="Workflow ID.")
    tag_ids: List[str] = Field(..., description="List of tag IDs to assign.")

# ============================================================================
# CREDENTIAL MODELS
# ============================================================================

class N8nListCredentialsSchema(BaseModel):
    """Schema for listing credentials."""
    model_config = ConfigDict(extra='forbid')
    
    # No params needed
    pass

class N8nGetCredentialSchema(BaseModel):
    """Schema for getting a credential."""
    model_config = ConfigDict(extra='forbid')
    
    credential_id: str = Field(..., description="Credential ID.")
