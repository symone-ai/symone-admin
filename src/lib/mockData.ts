// Initial mock data for Symone

import type { MCPServer, Secret, TeamMember, ActivityEvent, Workspace, User, Notification } from './types';

export const currentUser: User = {
  id: 'user-1',
  email: 'john@symone.io',
  firstName: 'John',
  lastName: 'Doe',
  avatar: 'JD',
  role: 'owner',
  createdAt: '2024-01-01T00:00:00Z',
};

export const initialServers: MCPServer[] = [
  { id: 'srv-1', name: 'postgres-prod', type: 'database', iconName: 'Database', status: 'running', uptime: 99.99, requestCount: 12400, avgLatency: 8, region: 'us-east-1', version: 'v2.3.1', lastDeployed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), createdAt: '2024-01-15T00:00:00Z', config: {}, executionMode: 'dual-mode', providerType: 'official', coldStartTime: 500, toolCount: 12, supportsToolSearch: true, supportsPTC: true },
  { id: 'srv-2', name: 'slack-integration', type: 'messaging', iconName: 'MessageSquare', status: 'running', uptime: 99.95, requestCount: 3200, avgLatency: 42, region: 'us-west-2', version: 'v1.8.0', lastDeployed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), createdAt: '2024-01-10T00:00:00Z', config: {}, executionMode: 'dual-mode', providerType: 'official', coldStartTime: 600, toolCount: 11, supportsToolSearch: true, supportsPTC: true },
  { id: 'srv-3', name: 'github-repos', type: 'api', iconName: 'Github', status: 'running', uptime: 100, requestCount: 847, avgLatency: 156, region: 'eu-west-1', version: 'v3.1.0', lastDeployed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), createdAt: '2024-01-05T00:00:00Z', config: {}, executionMode: 'dual-mode', providerType: 'official', coldStartTime: 600, toolCount: 35, supportsToolSearch: true, supportsPTC: true },
  { id: 'srv-4', name: 'gcp-storage', type: 'storage', iconName: 'Cloud', status: 'stopped', uptime: 0, requestCount: 0, avgLatency: 0, region: 'us-central1', version: 'v1.2.0', lastDeployed: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), createdAt: '2023-12-20T00:00:00Z', config: {}, executionMode: 'traditional', providerType: 'official', coldStartTime: 500, toolCount: 8 },
  { id: 'srv-5', name: 'notion-docs', type: 'api', iconName: 'FileText', status: 'running', uptime: 99.87, requestCount: 2100, avgLatency: 89, region: 'us-east-1', version: 'v2.0.0', lastDeployed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), createdAt: '2024-01-08T00:00:00Z', config: {}, executionMode: 'dual-mode', providerType: 'official', coldStartTime: 700, toolCount: 15, supportsToolSearch: true, supportsPTC: true },
  { id: 'srv-6', name: 'sendgrid-email', type: 'messaging', iconName: 'Mail', status: 'error', uptime: 95.2, requestCount: 156, avgLatency: 234, region: 'us-west-2', version: 'v1.4.2', lastDeployed: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), createdAt: '2023-12-15T00:00:00Z', config: {}, executionMode: 'traditional', providerType: 'official', coldStartTime: 600, toolCount: 5 },
  { id: 'srv-7', name: 'openai-assistant', type: 'ai', iconName: 'Brain', status: 'running', uptime: 99.9, requestCount: 5600, avgLatency: 320, region: 'us-east-1', version: 'v1.0.0', lastDeployed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), createdAt: '2024-01-12T00:00:00Z', config: {}, executionMode: 'code-execution', providerType: 'official', coldStartTime: 800, toolCount: 28, supportsToolSearch: true, supportsPTC: true },
];

export const initialSecrets: Secret[] = [
  { id: 'sec-1', name: 'DATABASE_URL', value: 'postgresql://user:pass@host:5432/db', serverIds: ['srv-1'], createdAt: '2024-01-15', lastUsed: new Date(Date.now() - 2 * 60 * 1000).toISOString(), status: 'active' },
  { id: 'sec-2', name: 'SLACK_BOT_TOKEN', value: 'xoxb-1234567890-abcdefghij', serverIds: ['srv-2'], createdAt: '2024-01-10', lastUsed: new Date(Date.now() - 12 * 60 * 1000).toISOString(), status: 'active' },
  { id: 'sec-3', name: 'GITHUB_PAT', value: 'ghp_xxxxxxxxxxxxxxxxxxxx', serverIds: ['srv-3'], createdAt: '2024-01-05', lastUsed: new Date(Date.now() - 25 * 60 * 1000).toISOString(), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'expiring' },
  { id: 'sec-4', name: 'GCP_SERVICE_KEY', value: '{"type":"service_account"...}', serverIds: ['srv-4'], createdAt: '2023-12-20', lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
  { id: 'sec-5', name: 'SENDGRID_API_KEY', value: 'SG.xxxxxxxxxxxxxxxxxxxxxxxx', serverIds: ['srv-6'], createdAt: '2023-12-15', lastUsed: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'expired' },
  { id: 'sec-6', name: 'NOTION_API_KEY', value: 'secret_xxxxxxxxxxxxxxxxxxxxxxxx', serverIds: ['srv-5'], createdAt: '2024-01-08', lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
  { id: 'sec-7', name: 'OPENAI_API_KEY', value: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx', serverIds: ['srv-7'], createdAt: '2024-01-12', lastUsed: new Date(Date.now() - 5 * 60 * 1000).toISOString(), status: 'active' },
];

export const initialTeamMembers: TeamMember[] = [
  { id: 'tm-1', userId: 'user-1', name: 'John Doe', email: 'john@symone.io', role: 'owner', avatar: 'JD', status: 'active', lastActive: new Date().toISOString(), serverAccess: ['srv-1', 'srv-2', 'srv-3', 'srv-4', 'srv-5', 'srv-6', 'srv-7'], invitedAt: '2024-01-01' },
  { id: 'tm-2', userId: 'user-2', name: 'Sarah Chen', email: 'sarah@symone.io', role: 'admin', avatar: 'SC', status: 'active', lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(), serverAccess: ['srv-1', 'srv-2', 'srv-3', 'srv-5', 'srv-7'], invitedAt: '2024-01-05' },
  { id: 'tm-3', userId: 'user-3', name: 'Mike Johnson', email: 'mike@symone.io', role: 'member', avatar: 'MJ', status: 'active', lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), serverAccess: ['srv-1', 'srv-2', 'srv-5'], invitedAt: '2024-01-08' },
  { id: 'tm-4', userId: 'user-4', name: 'Emily Davis', email: 'emily@symone.io', role: 'member', avatar: 'ED', status: 'pending', lastActive: '', serverAccess: [], invitedAt: '2024-01-18' },
  { id: 'tm-5', userId: 'user-5', name: 'Alex Kim', email: 'alex@symone.io', role: 'viewer', avatar: 'AK', status: 'active', lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), serverAccess: ['srv-1', 'srv-3'], invitedAt: '2024-01-10' },
];

export const initialWorkspace: Workspace = {
  id: 'ws-1',
  name: 'Symone Team',
  plan: 'team',
  ownerId: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  settings: {
    defaultRegion: 'us-east-1',
    darkMode: true,
    notifications: {
      email: true,
      push: true,
      slack: false,
      errors: true,
      deploys: true,
      usage: false,
    },
    twoFactorEnabled: true,
  },
  usage: {
    servers: { used: 7, limit: 15 },
    requests: { used: 68000, limit: 150000 },
    storage: { used: 2.4, limit: 10 },
    teamMembers: { used: 5, limit: 10 },
  },
};

export const generateActivity = (servers: MCPServer[]): ActivityEvent[] => {
  const events: ActivityEvent[] = [];
  const now = Date.now();
  
  const eventTemplates = [
    { type: 'request', status: 'success', message: 'Query executed successfully' },
    { type: 'request', status: 'success', message: 'API call completed' },
    { type: 'request', status: 'success', message: 'Data fetched successfully' },
    { type: 'deploy', status: 'success', message: 'Deployment completed' },
    { type: 'deploy', status: 'info', message: 'Deployment started' },
    { type: 'config', status: 'info', message: 'Configuration updated' },
    { type: 'auth', status: 'success', message: 'Token refreshed' },
    { type: 'error', status: 'error', message: 'Connection timeout' },
  ];

  const runningServers = servers.filter(s => s.status === 'running');
  
  for (let i = 0; i < 20; i++) {
    const server = runningServers[Math.floor(Math.random() * runningServers.length)] || servers[0];
    const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
    
    events.push({
      id: `evt-${i}`,
      type: template.type as ActivityEvent['type'],
      serverId: server.id,
      serverName: server.name,
      message: template.message,
      timestamp: new Date(now - i * 5 * 60 * 1000).toISOString(),
      status: template.status as ActivityEvent['status'],
      duration: template.type === 'request' ? Math.floor(Math.random() * 200) + 5 : undefined,
    });
  }

  return events;
};

export const initialNotifications: Notification[] = [
  { id: 'notif-1', type: 'warning', title: 'Secret Expiring', message: 'GITHUB_PAT expires in 7 days', read: false, createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), actionUrl: '/dashboard/secrets' },
  { id: 'notif-2', type: 'error', title: 'Server Error', message: 'sendgrid-email is experiencing issues', read: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), actionUrl: '/dashboard/servers' },
  { id: 'notif-3', type: 'success', title: 'Deployment Complete', message: 'openai-assistant deployed successfully', read: true, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: 'notif-4', type: 'info', title: 'New Team Member', message: 'Emily Davis was invited to the team', read: true, createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
];
