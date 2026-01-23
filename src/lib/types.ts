// Symone MCP Platform Types

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  createdAt?: string;
  plan?: string;
  team_id?: string;
  team_name?: string;
}

export type ExecutionMode = 'traditional' | 'code-execution' | 'dual-mode';
export type ServerProviderType = 'official' | 'partner' | 'community';

export interface MCPServer {
  id: string;
  name: string;
  type: 'database' | 'messaging' | 'storage' | 'api' | 'ai' | 'other';
  iconName: string;
  status: 'running' | 'stopped' | 'error' | 'deploying';
  uptime: number; // percentage
  requestCount: number;
  avgLatency: number; // ms
  region: string;
  version: string;
  lastDeployed: string;
  createdAt: string;
  config: Record<string, string>;

  // New fields for dual-mode support
  executionMode: ExecutionMode;
  providerType: ServerProviderType;
  coldStartTime?: number; // ms
  toolCount?: number;
  supportsToolSearch?: boolean;
  supportsPTC?: boolean; // Programmatic Tool Calling
}

export interface Secret {
  id: string;
  name: string;
  value: string;
  serverIds: string[];
  createdAt: string;
  lastUsed: string;
  expiresAt?: string;
  status: 'active' | 'expiring' | 'expired';
}

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  avatar: string;
  status: 'active' | 'pending' | 'inactive';
  lastActive: string;
  serverAccess: string[];
  invitedAt: string;
}

export interface ActivityEvent {
  id: string;
  type: 'request' | 'deploy' | 'error' | 'config' | 'auth' | 'team';
  serverId?: string;
  serverName?: string;
  message: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning' | 'info';
  details?: string;
  duration?: number;
  userId?: string;
}

export interface Workspace {
  id: string;
  name: string;
  plan: 'free' | 'starter' | 'team' | 'enterprise';
  ownerId: string;
  createdAt: string;
  settings: WorkspaceSettings;
  usage: WorkspaceUsage;
}

export interface WorkspaceSettings {
  defaultRegion: string;
  darkMode: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    slack: boolean;
    errors: boolean;
    deploys: boolean;
    usage: boolean;
  };
  twoFactorEnabled: boolean;
}

export interface WorkspaceUsage {
  servers: { used: number; limit: number };
  requests: { used: number; limit: number };
  storage: { used: number; limit: number };
  teamMembers: { used: number; limit: number };
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
