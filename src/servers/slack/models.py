from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

class SlackMessageSchema(BaseModel):
    """Schema for posting a message to Slack."""
    model_config = ConfigDict(extra='forbid')
    
    channel_id: str = Field(..., description="The ID of the channel to post to (e.g., C12345678).")
    text: str = Field(..., description="The message text to post.")
    thread_ts: Optional[str] = Field(None, description="Thread timestamp to reply to.")

class SlackListChannelsSchema(BaseModel):
    """Schema for listing public channels."""
    model_config = ConfigDict(extra='forbid')
    
    limit: int = Field(default=20, ge=1, le=100, description="Maximum number of channels to return.")

class SlackAddReactionSchema(BaseModel):
    """Schema for adding a reaction to a message."""
    model_config = ConfigDict(extra='forbid')
    
    channel_id: str = Field(..., description="Channel containing the message.")
    timestamp: str = Field(..., description="Timestamp of the message.")
    reaction: str = Field(..., description="Emoji name (without colons, e.g., 'thumbsup').")

class SlackUploadFileSchema(BaseModel):
    """Schema for uploading a file."""
    model_config = ConfigDict(extra='forbid')
    
    channel_id: str = Field(..., description="Channel to upload to.")
    file_path: str = Field(..., description="Absolute path to the file.")
    title: Optional[str] = Field(None, description="File title.")
    initial_comment: Optional[str] = Field(None, description="Comment to add with the upload.")

class SlackGetUserSchema(BaseModel):
    """Schema for getting user info."""
    model_config = ConfigDict(extra='forbid')
    
    user_id: str = Field(..., description="User ID (e.g., U12345678).")

class SlackSearchMessagesSchema(BaseModel):
    """Schema for searching messages."""
    model_config = ConfigDict(extra='forbid')
    
    query: str = Field(..., description="Search query.")
    count: int = Field(default=20, ge=1, le=100, description="Number of results to return.")

class SlackUpdateMessageSchema(BaseModel):
    """Schema for updating a message."""
    model_config = ConfigDict(extra='forbid')
    
    channel_id: str = Field(..., description="Channel containing the message.")
    timestamp: str = Field(..., description="Timestamp of the message to update.")
    text: str = Field(..., description="New message text.")

class SlackDeleteMessageSchema(BaseModel):
    """Schema for deleting a message."""
    model_config = ConfigDict(extra='forbid')
    
    channel_id: str = Field(..., description="Channel containing the message.")
    timestamp: str = Field(..., description="Timestamp of the message to delete.")

class SlackCreateChannelSchema(BaseModel):
    """Schema for creating a channel."""
    model_config = ConfigDict(extra='forbid')
    
    name: str = Field(..., description="Channel name (lowercase, no spaces).")
    is_private: bool = Field(default=False, description="Create as private channel.")

class SlackInviteToChannelSchema(BaseModel):
    """Schema for inviting users to a channel."""
    model_config = ConfigDict(extra='forbid')
    
    channel_id: str = Field(..., description="Channel ID.")
    user_ids: List[str] = Field(..., description="List of user IDs to invite.")

class SlackGetChannelHistorySchema(BaseModel):
    """Schema for getting channel message history."""
    model_config = ConfigDict(extra='forbid')
    
    channel_id: str = Field(..., description="Channel ID.")
    limit: int = Field(default=10, ge=1, le=100, description="Number of messages.")

class SlackSetChannelTopicSchema(BaseModel):
    """Schema for setting channel topic."""
    model_config = ConfigDict(extra='forbid')
    
    channel_id: str = Field(..., description="Channel ID.")
    topic: str = Field(..., description="New topic text.")

class SlackGetThreadRepliesSchema(BaseModel):
    """Schema for getting thread replies."""
    model_config = ConfigDict(extra='forbid')
    
    channel_id: str = Field(..., description="Channel ID.")
    thread_ts: str = Field(..., description="Thread parent message timestamp.")

# ============================================================================
# ADMIN USER TOOLS (Require User Token + Admin)
# ============================================================================

class SlackListWorkspaceUsersSchema(BaseModel):
    """Schema for listing all workspace users (admin)."""
    model_config = ConfigDict(extra='forbid')
    
    limit: int = Field(default=100, ge=1, le=200, description="Number of users to return.")

class SlackSetUserAdminSchema(BaseModel):
    """Schema for promoting/demoting workspace admins."""
    model_config = ConfigDict(extra='forbid')
    
    user_id: str = Field(..., description="User ID to modify.")
    is_admin: bool = Field(..., description="Set as admin (True) or regular user (False).")

class SlackDeactivateUserSchema(BaseModel):
    """Schema for deactivating a user (admin)."""
    model_config = ConfigDict(extra='forbid')
    
    user_id: str = Field(..., description="User ID to deactivate.")

class SlackArchiveChannelSchema(BaseModel):
    """Schema for archiving a channel (admin)."""
    model_config = ConfigDict(extra='forbid')
    
    channel_id: str = Field(..., description="Channel ID to archive.")

class SlackGetWorkspaceInfoSchema(BaseModel):
    """Schema for getting workspace info."""
    model_config = ConfigDict(extra='forbid')
    
    # No params needed, returns info about current workspace
    pass
