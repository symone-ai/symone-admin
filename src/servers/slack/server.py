from mcp.server.fastmcp import FastMCP
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from dotenv import load_dotenv
import json
import sys
import os

# Handle both script and module execution
if __name__ == "__main__":
    # Add parent directory to path for script execution
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))
    from src.servers.slack.models import (
        SlackMessageSchema, SlackListChannelsSchema, SlackAddReactionSchema,
        SlackUploadFileSchema, SlackGetUserSchema, SlackSearchMessagesSchema,
        SlackUpdateMessageSchema, SlackDeleteMessageSchema, SlackCreateChannelSchema,
        SlackInviteToChannelSchema, SlackGetChannelHistorySchema, SlackSetChannelTopicSchema,
        SlackGetThreadRepliesSchema, SlackListWorkspaceUsersSchema, SlackSetUserAdminSchema,
        SlackDeactivateUserSchema, SlackArchiveChannelSchema, SlackGetWorkspaceInfoSchema
    )
else:
    from .models import (
        SlackMessageSchema, SlackListChannelsSchema, SlackAddReactionSchema,
        SlackUploadFileSchema, SlackGetUserSchema, SlackSearchMessagesSchema,
        SlackUpdateMessageSchema, SlackDeleteMessageSchema, SlackCreateChannelSchema,
        SlackInviteToChannelSchema, SlackGetChannelHistorySchema, SlackSetChannelTopicSchema,
        SlackGetThreadRepliesSchema, SlackListWorkspaceUsersSchema, SlackSetUserAdminSchema,
        SlackDeactivateUserSchema, SlackArchiveChannelSchema, SlackGetWorkspaceInfoSchema
    )

# Load environment variables
load_dotenv()

# Initialize Slack Client
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")
SLACK_USER_TOKEN = os.getenv("SLACK_USER_TOKEN")

if not SLACK_BOT_TOKEN:
    raise ValueError("SLACK_BOT_TOKEN not found in .env")

slack_client = WebClient(token=SLACK_BOT_TOKEN)

# User token client (for admin operations)
user_client = None
if SLACK_USER_TOKEN:
    user_client = WebClient(token=SLACK_USER_TOKEN)

# Initialize MCP Server
mcp = FastMCP("Symone Slack Server - Comprehensive Edition")

# ============================================================================
# MESSAGING TOOLS
# ============================================================================

@mcp.tool(
    name="slack_post_message",
    description="Post a message to a Slack channel or thread",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    }
)
def post_message(params: SlackMessageSchema) -> str:
    """Posts a message to the specified Slack channel."""
    try:
        response = slack_client.chat_postMessage(
            channel=params.channel_id,
            text=params.text,
            thread_ts=params.thread_ts
        )
        return json.dumps({"success": True, "ts": response['ts'], "channel": response['channel']})
    except SlackApiError as e:
        return json.dumps({"success": False, "error": e.response['error']})

@mcp.tool(
    name="slack_update_message",
    description="Update an existing Slack message",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def update_message(params: SlackUpdateMessageSchema) -> str:
    """Updates an existing message."""
    try:
        response = slack_client.chat_update(
            channel=params.channel_id,
            ts=params.timestamp,
            text=params.text
        )
        return json.dumps({"success": True, "ts": response['ts']})
    except SlackApiError as e:
        return json.dumps({"success": False, "error": e.response['error']})

@mcp.tool(
    name="slack_delete_message",
    description="Delete a Slack message",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": True,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def delete_message(params: SlackDeleteMessageSchema) -> str:
    """Deletes a message."""
    try:
        slack_client.chat_delete(
            channel=params.channel_id,
            ts=params.timestamp
        )
        return json.dumps({"success": True})
    except SlackApiError as e:
        return json.dumps({"success": False, "error": e.response['error']})

# ============================================================================
# CHANNEL TOOLS
# ============================================================================

@mcp.tool(
    name="slack_list_channels",
    description="List public channels in the workspace",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def list_channels(params: SlackListChannelsSchema) -> str:
    """Lists public channels in the workspace."""
    try:
        response = slack_client.conversations_list(
            limit=params.limit,
            types="public_channel"
        )
        channels = [{"id": c['id'], "name": c['name'], "topic": c.get('topic', {}).get('value', '')} 
                   for c in response["channels"]]
        return json.dumps({"success": True, "channels": channels})
    except SlackApiError as e:
        return json.dumps({"success": False, "error": e.response['error']})

@mcp.tool(
    name="slack_create_channel",
    description="Create a new Slack channel (public or private)",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    }
)
def create_channel(params: SlackCreateChannelSchema) -> str:
    """Creates a new channel."""
    try:
        response = slack_client.conversations_create(
            name=params.name,
            is_private=params.is_private
        )
        return json.dumps({"success": True, "channel_id": response['channel']['id']})
    except SlackApiError as e:
        return json.dumps({"success": False, "error": e.response['error']})

@mcp.tool(
    name="slack_invite_to_channel",
    description="Invite users to a Slack channel",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def invite_to_channel(params: SlackInviteToChannelSchema) -> str:
    """Invites users to a channel."""
    try:
        response = slack_client.conversations_invite(
            channel=params.channel_id,
            users=",".join(params.user_ids)
        )
        return json.dumps({"success": True})
    except SlackApiError as e:
        return json.dumps({"success": False, "error": e.response['error']})

@mcp.tool(
    name="slack_get_channel_history",
    description="Get message history from a channel",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def get_channel_history(params: SlackGetChannelHistorySchema) -> str:
    """Gets channel message history."""
    try:
        response = slack_client.conversations_history(
            channel=params.channel_id,
            limit=params.limit
        )
        messages = [{"user": m.get('user'), "text": m.get('text'), "ts": m['ts']} 
                   for m in response['messages']]
        return json.dumps({"success": True, "messages": messages})
    except SlackApiError as e:
        return json.dumps({"success": False, "error": e.response['error']})

@mcp.tool(
    name="slack_set_channel_topic",
    description="Set or update a channel's topic",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def set_channel_topic(params: SlackSetChannelTopicSchema) -> str:
    """Sets channel topic."""
    try:
        response = slack_client.conversations_setTopic(
            channel=params.channel_id,
            topic=params.topic
        )
        return json.dumps({"success": True})
    except SlackApiError as e:
        return json.dumps({"success": False, "error": e.response['error']})

# ============================================================================
# REACTION TOOLS
# ============================================================================

@mcp.tool(
    name="slack_add_reaction",
    description="Add an emoji reaction to a message",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def add_reaction(params: SlackAddReactionSchema) -> str:
    """Adds a reaction to a message."""
    try:
        slack_client.reactions_add(
            channel=params.channel_id,
            timestamp=params.timestamp,
            name=params.reaction
        )
        return json.dumps({"success": True})
    except SlackApiError as e:
        return json.dumps({"success": False, "error": e.response['error']})

# ============================================================================
# FILE TOOLS
# ============================================================================

@mcp.tool(
    name="slack_upload_file",
    description="Upload a file to a Slack channel",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    }
)
def upload_file(params: SlackUploadFileSchema) -> str:
    """Uploads a file to Slack."""
    try:
        response = slack_client.files_upload_v2(
            channel=params.channel_id,
            file=params.file_path,
            title=params.title,
            initial_comment=params.initial_comment
        )
        return json.dumps({"success": True, "file_id": response['file']['id']})
    except SlackApiError as e:
        return json.dumps({"success": False, "error": e.response['error']})

# ============================================================================
# USER TOOLS
# ============================================================================

@mcp.tool(
    name="slack_get_user",
    description="Get information about a Slack user",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def get_user(params: SlackGetUserSchema) -> str:
    """Gets user information."""
    try:
        response = slack_client.users_info(user=params.user_id)
        user = response['user']
        return json.dumps({
            "success": True,
            "user": {
                "id": user['id'],
                "name": user['name'],
                "real_name": user.get('real_name'),
                "email": user.get('profile', {}).get('email'),
                "is_admin": user.get('is_admin', False)
            }
        })
    except SlackApiError as e:
        return json.dumps({"success": False, "error": e.response['error']})

# ============================================================================
# SEARCH TOOLS
# ============================================================================

@mcp.tool(
    name="slack_search_messages",
    description="Search for messages across the workspace",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def search_messages(params: SlackSearchMessagesSchema) -> str:
    """Searches messages."""
    try:
        response = slack_client.search_messages(
            query=params.query,
            count=params.count
        )
        matches = [{"text": m['text'], "user": m.get('user'), "ts": m['ts']} 
                  for m in response['messages']['matches']]
        return json.dumps({"success": True, "matches": matches})
    except SlackApiError as e:
        return json.dumps({"success": False, "error": e.response['error']})

# ============================================================================
# THREAD TOOLS
# ============================================================================

@mcp.tool(
    name="slack_get_thread_replies",
    description="Get all replies in a thread",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def get_thread_replies(params: SlackGetThreadRepliesSchema) -> str:
    """Gets thread replies."""
    try:
        response = slack_client.conversations_replies(
            channel=params.channel_id,
            ts=params.thread_ts
        )
        replies = [{"user": m.get('user'), "text": m.get('text'), "ts": m['ts']} 
                  for m in response['messages']]
        return json.dumps({"success": True, "replies": replies})
    except SlackApiError as e:
        return json.dumps({"success": False, "error": e.response['error']})

# ============================================================================
# ADMIN TOOLS (User Token Required)
# ============================================================================

@mcp.tool(
    name="slack_list_workspace_users",
    description="List all users in the workspace (admin only)",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def list_workspace_users(params: SlackListWorkspaceUsersSchema) -> str:
    """Lists all workspace users (requires user token + admin)."""
    if not user_client:
        return json.dumps({"success": False, "error": "SLACK_USER_TOKEN not configured"})
    try:
        response = user_client.users_list(limit=params.limit)
        users = [{"id": u['id'], "name": u['name'], "real_name": u.get('real_name'), 
                 "is_admin": u.get('is_admin', False), "is_bot": u.get('is_bot', False)} 
                for u in response['members']]
        return json.dumps({"success": True, "users": users})
    except SlackApiError as e:
        return json.dumps({"success": False, "error": e.response['error']})

@mcp.tool(
    name="slack_set_user_admin",
    description="Promote or demote a user to/from workspace admin (admin only)",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": True,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def set_user_admin(params: SlackSetUserAdminSchema) -> str:
    """Sets user admin status (requires user token + admin)."""
    if not user_client:
        return json.dumps({"success": False, "error": "SLACK_USER_TOKEN not configured"})
    try:
        if params.is_admin:
            response = user_client.admin_users_setAdmin(
                team_id=user_client.auth_test()['team_id'],
                user_id=params.user_id
            )
        else:
            response = user_client.admin_users_setRegular(
                team_id=user_client.auth_test()['team_id'],
                user_id=params.user_id
            )
        return json.dumps({"success": True})
    except SlackApiError as e:
        return json.dumps({"success": False, "error": e.response['error']})

@mcp.tool(
    name="slack_deactivate_user",
    description="Deactivate a workspace user (admin only)",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": True,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def deactivate_user(params: SlackDeactivateUserSchema) -> str:
    """Deactivates a user (requires user token + admin)."""
    if not user_client:
        return json.dumps({"success": False, "error": "SLACK_USER_TOKEN not configured"})
    try:
        team_id = user_client.auth_test()['team_id']
        response = user_client.admin_users_remove(
            team_id=team_id,
            user_id=params.user_id
        )
        return json.dumps({"success": True})
    except SlackApiError as e:
        return json.dumps({"success": False, "error": e.response['error']})

@mcp.tool(
    name="slack_archive_channel",
    description="Archive a channel (admin only)",
    annotations={
        "readOnlyHint": False,
        "destructiveHint": True,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def archive_channel(params: SlackArchiveChannelSchema) -> str:
    """Archives a channel (requires user token + admin)."""
    if not user_client:
        return json.dumps({"success": False, "error": "SLACK_USER_TOKEN not configured"})
    try:
        response = user_client.admin_conversations_archive(
            channel_id=params.channel_id
        )
        return json.dumps({"success": True})
    except SlackApiError as e:
        return json.dumps({"success": False, "error": e.response['error']})

@mcp.tool(
    name="slack_get_workspace_info",
    description="Get information about the current workspace",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
def get_workspace_info(params: SlackGetWorkspaceInfoSchema) -> str:
    """Gets workspace info."""
    if not user_client:
        return json.dumps({"success": False, "error": "SLACK_USER_TOKEN not configured"})
    try:
        response = user_client.team_info()
        team = response['team']
        return json.dumps({
            "success": True,
            "workspace": {
                "id": team['id'],
                "name": team['name'],
                "domain": team['domain'],
                "email_domain": team.get('email_domain'),
            }
        })
    except SlackApiError as e:
        return json.dumps({"success": False, "error": e.response['error']})

if __name__ == "__main__":
    mcp.run()
