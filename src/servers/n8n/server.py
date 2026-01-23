from mcp.server.fastmcp import FastMCP
from dotenv import load_dotenv
import json
import sys
import os
import requests
from typing import Dict, Any

# Handle both script and module execution
if __name__ == "__main__":
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))
    from src.servers.n8n.models import (
        N8nListWorkflowsSchema, N8nGetWorkflowSchema, N8nCreateWorkflowSchema,
        N8nUpdateWorkflowSchema, N8nDeleteWorkflowSchema, N8nActivateWorkflowSchema,
        N8nListExecutionsSchema, N8nGetExecutionSchema, N8nDeleteExecutionSchema,
        N8nRetryExecutionSchema, N8nExecuteWorkflowSchema, N8nListTagsSchema,
        N8nCreateTagSchema, N8nUpdateWorkflowTagsSchema, N8nListCredentialsSchema,
        N8nGetCredentialSchema
    )
else:
    from .models import (
        N8nListWorkflowsSchema, N8nGetWorkflowSchema, N8nCreateWorkflowSchema,
        N8nUpdateWorkflowSchema, N8nDeleteWorkflowSchema, N8nActivateWorkflowSchema,
        N8nListExecutionsSchema, N8nGetExecutionSchema, N8nDeleteExecutionSchema,
        N8nRetryExecutionSchema, N8nExecuteWorkflowSchema, N8nListTagsSchema,
        N8nCreateTagSchema, N8nUpdateWorkflowTagsSchema, N8nListCredentialsSchema,
        N8nGetCredentialSchema
    )

# Load environment variables
load_dotenv()

# n8n Configuration
N8N_API_URL = os.getenv("N8N_API_URL")  # e.g., "http://localhost:5678" or "https://your-n8n-instance.com"
N8N_API_KEY = os.getenv("N8N_API_KEY")

if not N8N_API_URL:
    raise ValueError("N8N_API_URL not found in .env")
if not N8N_API_KEY:
    raise ValueError("N8N_API_KEY not found in .env")

# Initialize MCP Server
mcp = FastMCP("Symone n8n Server - Comprehensive Edition")

class N8nClient:
    """n8n REST API Client"""
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip('/')
        self.headers = {
            "X-N8N-API-KEY": api_key,
            "Content-Type": "application/json"
        }
    
    def request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make HTTP request to n8n API."""
        url = f"{self.base_url}/api/v1/{endpoint.lstrip('/')}"
        try:
            response = requests.request(method, url, headers=self.headers, **kwargs)
            response.raise_for_status()
            return {"success": True, "data": response.json() if response.content else None}
        except requests.RequestException as e:
            return {"success": False, "error": str(e)}

n8n_client = N8nClient(N8N_API_URL, N8N_API_KEY)

# ============================================================================
# WORKFLOW TOOLS
# ============================================================================

@mcp.tool(
    name="n8n_list_workflows",
    description="List all workflows in the n8n instance",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def list_workflows(params: N8nListWorkflowsSchema) -> str:
    """Lists workflows."""
    result = n8n_client.request("GET", f"workflows?limit={params.limit}")
    return json.dumps(result)

@mcp.tool(
    name="n8n_get_workflow",
    description="Get details of a specific workflow",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def get_workflow(params: N8nGetWorkflowSchema) -> str:
    """Gets workflow details."""
    result = n8n_client.request("GET", f"workflows/{params.workflow_id}")
    return json.dumps(result)

@mcp.tool(
    name="n8n_create_workflow",
    description="Create a new workflow",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    }
)
def create_workflow(params: N8nCreateWorkflowSchema) -> str:
    """Creates a new workflow."""
    payload = {
        "name": params.name,
        "nodes": params.nodes,
        "connections": params.connections,
        "settings": params.settings or {}
    }
    result = n8n_client.request("POST", "workflows", json=payload)
    return json.dumps(result)

@mcp.tool(
    name="n8n_update_workflow",
    description="Update an existing workflow",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def update_workflow(params: N8nUpdateWorkflowSchema) -> str:
    """Updates a workflow."""
    payload = {}
    if params.name:
        payload["name"] = params.name
    if params.nodes:
        payload["nodes"] = params.nodes
    if params.connections:
        payload["connections"] = params.connections
    
    result = n8n_client.request("PATCH", f"workflows/{params.workflow_id}", json=payload)
    return json.dumps(result)

@mcp.tool(
    name="n8n_delete_workflow",
    description="Delete a workflow",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": True,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def delete_workflow(params: N8nDeleteWorkflowSchema) -> str:
    """Deletes a workflow."""
    result = n8n_client.request("DELETE", f"workflows/{params.workflow_id}")
    return json.dumps(result)

@mcp.tool(
    name="n8n_activate_workflow",
    description="Activate or deactivate a workflow",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def activate_workflow(params: N8nActivateWorkflowSchema) -> str:
    """Activates or deactivates a workflow."""
    endpoint = f"workflows/{params.workflow_id}/{'activate' if params.activate else 'deactivate'}"
    result = n8n_client.request("POST", endpoint)
    return json.dumps(result)

# ============================================================================
# EXECUTION TOOLS
# ============================================================================

@mcp.tool(
    name="n8n_list_executions",
    description="List workflow executions with optional filters",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def list_executions(params: N8nListExecutionsSchema) -> str:
    """Lists executions."""
    query_params = [f"limit={params.limit}"]
    if params.workflow_id:
        query_params.append(f"workflowId={params.workflow_id}")
    if params.status:
        query_params.append(f"status={params.status}")
    
    endpoint = f"executions?{'&'.join(query_params)}"
    result = n8n_client.request("GET", endpoint)
    return json.dumps(result)

@mcp.tool(
    name="n8n_get_execution",
    description="Get details of a specific execution",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def get_execution(params: N8nGetExecutionSchema) -> str:
    """Gets execution details."""
    result = n8n_client.request("GET", f"executions/{params.execution_id}")
    return json.dumps(result)

@mcp.tool(
    name="n8n_delete_execution",
    description="Delete an execution record",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": True,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def delete_execution(params: N8nDeleteExecutionSchema) -> str:
    """Deletes an execution."""
    result = n8n_client.request("DELETE", f"executions/{params.execution_id}")
    return json.dumps(result)

@mcp.tool(
    name="n8n_retry_execution",
    description="Retry a failed execution",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    }
)
def retry_execution(params: N8nRetryExecutionSchema) -> str:
    """Retries an execution."""
    result = n8n_client.request("POST", f"executions/{params.execution_id}/retry")
    return json.dumps(result)

@mcp.tool(
    name="n8n_execute_workflow",
    description="Manually execute a workflow with optional data",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    }
)
def execute_workflow(params: N8nExecuteWorkflowSchema) -> str:
    """Executes a workflow."""
    payload = {"data": params.data} if params.data else {}
    result = n8n_client.request("POST", f"workflows/{params.workflow_id}/execute", json=payload)
    return json.dumps(result)

# ============================================================================
# TAG TOOLS
# ============================================================================

@mcp.tool(
    name="n8n_list_tags",
    description="List all tags",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def list_tags(params: N8nListTagsSchema) -> str:
    """Lists tags."""
    result = n8n_client.request("GET", "tags")
    return json.dumps(result)

@mcp.tool(
    name="n8n_create_tag",
    description="Create a new tag",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    }
)
def create_tag(params: N8nCreateTagSchema) -> str:
    """Creates a tag."""
    result = n8n_client.request("POST", "tags", json={"name": params.name})
    return json.dumps(result)

@mcp.tool(
    name="n8n_update_workflow_tags",
    description="Update tags for a workflow",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def update_workflow_tags(params: N8nUpdateWorkflowTagsSchema) -> str:
    """Updates workflow tags."""
    result = n8n_client.request(
        "PUT",
        f"workflows/{params.workflow_id}/tags",
        json={"tags": params.tag_ids}
    )
    return json.dumps(result)

# ============================================================================
# CREDENTIAL TOOLS
# ============================================================================

@mcp.tool(
    name="n8n_list_credentials",
    description="List all credentials (sensitive data masked)",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def list_credentials(params: N8nListCredentialsSchema) -> str:
    """Lists credentials."""
    result = n8n_client.request("GET", "credentials")
    return json.dumps(result)

@mcp.tool(
    name="n8n_get_credential",
    description="Get details of a specific credential",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def get_credential(params: N8nGetCredentialSchema) -> str:
    """Gets credential details."""
    result = n8n_client.request("GET", f"credentials/{params.credential_id}")
    return json.dumps(result)

if __name__ == "__main__":
    mcp.run()
