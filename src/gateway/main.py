from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from dotenv import load_dotenv
import os
import json
import asyncio
from datetime import datetime
from supabase import create_client, Client

load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="Symone Gateway API",
    description="Multi-tenant MCP Gateway with Activity Logging",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# ============================================================================
# MODELS
# ============================================================================

class ToolRequest(BaseModel):
    tool_name: str
    parameters: Dict[str, Any]
    team_id: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    database: str
    servers_active: int

# ============================================================================
# AUTHENTICATION MIDDLEWARE
# ============================================================================

async def verify_api_key(x_symone_key: str = Header(...)) -> str:
    """Verify API key and return team_id"""
    # TODO: Implement proper API key validation
    # For now, return a test team_id
    return "test-team-id"

# ============================================================================
# ACTIVITY LOGGING
# ============================================================================

async def log_activity(
    server_id: str,
    agent_name: str,
    tool_name: str,
    status: str,
    latency_ms: int,
    request_payload: Optional[Dict] = None,
    response_payload: Optional[Dict] = None
):
    """Log tool execution to activity_logs and request_traces"""
    try:
        # Insert activity log
        log_result = supabase.table('activity_logs').insert({
            "server_id": server_id,
            "agent_name": agent_name,
            "tool_name": tool_name,
            "status": status,
            "latency_ms": latency_ms
        }).execute()
        
        activity_log_id = log_result.data[0]['id']
        
        # Insert request trace
        if request_payload or response_payload:
            supabase.table('request_traces').insert({
                "activity_log_id": activity_log_id,
                "request_payload": request_payload,
                "response_payload": response_payload,
                "trace_id": f"trace_{datetime.utcnow().timestamp()}"
            }).execute()
    except Exception as e:
        print(f"Activity logging error: {e}")

# ============================================================================
# CORE ENDPOINTS
# ============================================================================

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "service": "Symone Gateway API",
        "version": "1.0.0",
        "status": "operational",
        "documentation": "/docs"
    }

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Check database connection
        result = supabase.table('servers').select("id", count='exact').execute()
        db_status = "healthy"
        servers_count = result.count
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
        servers_count = 0
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "database": db_status,
        "servers_active": servers_count
    }

@app.get("/metrics", tags=["Metrics"])
async def metrics():
    """Metrics endpoint for dashboard"""
    try:
        # Get activity stats
        total_logs = supabase.table('activity_logs').select("id", count='exact').execute()
        
        # Get success rate
        success_logs = supabase.table('activity_logs')\
            .select("id", count='exact')\
            .eq('status', 'success')\
            .execute()
        
        success_rate = (success_logs.count / total_logs.count * 100) if total_logs.count > 0 else 0
        
        # Get teams count
        teams = supabase.table('teams').select("id", count='exact').execute()
        
        # Get servers count
        servers = supabase.table('servers').select("id", count='exact').execute()
        
        return {
            "total_requests": total_logs.count,
            "success_rate": round(success_rate, 2),
            "total_teams": teams.count,
            "total_servers": servers.count,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# MCP TOOL EXECUTION
# ============================================================================

@app.post("/tools/slack/{tool_name}", tags=["Slack MCP"])
async def execute_slack_tool(
    tool_name: str,
    request: ToolRequest,
    x_symone_key: str = Header(...)
):
    """Execute a Slack MCP tool"""
    start_time = datetime.utcnow()
    
    try:
        # Verify authentication
        team_id = await verify_api_key(x_symone_key)
        
        # Get Slack server for this team
        server_result = supabase.table('servers')\
            .select("*")\
            .eq('team_id', team_id)\
            .eq('type', 'slack')\
            .single()\
            .execute()
        
        if not server_result.data:
            raise HTTPException(status_code=404, detail="Slack server not configured for team")
        
        server_id = server_result.data['id']
        
        # TODO: Dynamically load and execute the Slack MCP tool
        # For now, return a mock response
        response = {
            "success": True,
            "tool": tool_name,
            "message": f"Tool {tool_name} executed successfully",
            "data": request.parameters
        }
        
        # Calculate latency
        latency = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        # Log activity
        await log_activity(
            server_id=server_id,
            agent_name="api_client",
            tool_name=tool_name,
            status="success",
            latency_ms=latency,
            request_payload=request.parameters,
            response_payload=response
        )
        
        return response
        
    except Exception as e:
        latency = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        # Log error
        await log_activity(
            server_id="unknown",
            agent_name="api_client",
            tool_name=tool_name,
            status="error",
            latency_ms=latency,
            request_payload=request.parameters,
            response_payload={"error": str(e)}
        )
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tools/n8n/{tool_name}", tags=["n8n MCP"])
async def execute_n8n_tool(
    tool_name: str,
    request: ToolRequest,
    x_symone_key: str = Header(...)
):
    """Execute an n8n MCP tool"""
    start_time = datetime.utcnow()
    
    try:
        team_id = await verify_api_key(x_symone_key)
        
        server_result = supabase.table('servers')\
            .select("*")\
            .eq('team_id', team_id)\
            .eq('type', 'n8n')\
            .single()\
            .execute()
        
        if not server_result.data:
            raise HTTPException(status_code=404, detail="n8n server not configured for team")
        
        server_id = server_result.data['id']
        
        response = {
            "success": True,
            "tool": tool_name,
            "message": f"Tool {tool_name} executed successfully"
        }
        
        latency = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        await log_activity(
            server_id=server_id,
            agent_name="api_client",
            tool_name=tool_name,
            status="success",
            latency_ms=latency
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ACTIVITY FEED ENDPOINT (SSE)
# ============================================================================

@app.get("/activity/stream", tags=["Activity"])
async def activity_stream(x_symone_key: str = Header(...)):
    """Server-Sent Events stream for live activity feed"""
    
    async def event_generator():
        team_id = await verify_api_key(x_symone_key)
        
        while True:
            # Fetch recent activity logs
            logs = supabase.table('activity_logs')\
                .select("*, servers(team_id, name)")\
                .limit(10)\
                .order('timestamp', desc=True)\
                .execute()
            
            # Filter by team
            team_logs = [log for log in logs.data if log['servers']['team_id'] == team_id]
            
            yield f"data: {json.dumps(team_logs)}\n\n"
            await asyncio.sleep(2)  # Update every 2 seconds
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
