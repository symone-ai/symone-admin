// Symone Data Service - handles all CRUD operations with localStorage persistence

import { storage } from './storage';
import {
  initialServers,
  initialSecrets,
  initialTeamMembers,
  initialWorkspace,
  currentUser,
  initialNotifications,
  generateActivity
} from './mockData';
import type {
  MCPServer,
  Secret,
  TeamMember,
  ActivityEvent,
  Workspace,
  User,
  Notification
} from './types';

// Initialize data if not exists
const initializeData = () => {
  if (!storage.get('initialized', false)) {
    storage.set('servers', initialServers);
    storage.set('secrets', initialSecrets);
    storage.set('teamMembers', initialTeamMembers);
    storage.set('workspace', initialWorkspace);
    storage.set('user', currentUser);
    storage.set('notifications', initialNotifications);
    storage.set('initialized', true);
  }
};

initializeData();

// Simulated delay for realistic feel
const delay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

// User
export const userService = {
  async get(): Promise<User> {
    await delay();
    // First check if there's a logged-in user from auth
    const loggedInUser = localStorage.getItem('symone_user');
    if (loggedInUser) {
      try {
        const parsed = JSON.parse(loggedInUser);
        // Map backend user format to frontend User type
        return {
          id: parsed.id || 'usr-1',
          firstName: parsed.name ? parsed.name.split(' ')[0] : 'User',
          lastName: parsed.name ? parsed.name.split(' ').slice(1).join(' ') || '' : '',
          email: parsed.email || 'user@example.com',
          avatar: parsed.avatar_url || parsed.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U',
          role: parsed.role || 'owner',
          plan: parsed.plan || 'pro',
          team_id: parsed.team_id,
          team_name: parsed.team_name,
        };
      } catch (e) {
        console.error('Failed to parse logged in user:', e);
      }
    }
    // Fall back to mock data
    return storage.get('user', currentUser);
  },

  async update(updates: Partial<User>): Promise<User> {
    await delay();
    const user = await this.get();
    const updated = { ...user, ...updates };
    storage.set('user', updated);
    // Also update symone_user if logged in
    const loggedInUser = localStorage.getItem('symone_user');
    if (loggedInUser) {
      try {
        const parsed = JSON.parse(loggedInUser);
        localStorage.setItem('symone_user', JSON.stringify({
          ...parsed,
          name: `${updates.firstName || user.firstName} ${updates.lastName || user.lastName}`.trim(),
          email: updates.email || user.email,
        }));
      } catch (e) {
        console.error('Failed to update logged in user:', e);
      }
    }
    return updated;
  }
};

// Servers
export const serverService = {
  async getAll(): Promise<MCPServer[]> {
    await delay();
    return storage.get('servers', initialServers);
  },

  async getById(id: string): Promise<MCPServer | undefined> {
    await delay();
    const servers = storage.get('servers', initialServers);
    return servers.find(s => s.id === id);
  },

  async create(server: Omit<MCPServer, 'id' | 'createdAt' | 'lastDeployed'>): Promise<MCPServer> {
    await delay(500);
    const servers = storage.get('servers', initialServers);
    const newServer: MCPServer = {
      ...server,
      id: `srv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastDeployed: new Date().toISOString(),
      status: 'deploying',
    };
    servers.push(newServer);
    storage.set('servers', servers);

    // Simulate deployment completion
    setTimeout(() => {
      const current = storage.get('servers', []) as MCPServer[];
      const idx = current.findIndex(s => s.id === newServer.id);
      if (idx !== -1) {
        current[idx].status = 'running';
        storage.set('servers', current);
      }
    }, 3000);

    return newServer;
  },

  async update(id: string, updates: Partial<MCPServer>): Promise<MCPServer> {
    await delay();
    const servers = storage.get('servers', initialServers);
    const idx = servers.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Server not found');
    servers[idx] = { ...servers[idx], ...updates };
    storage.set('servers', servers);
    return servers[idx];
  },

  async delete(id: string): Promise<void> {
    await delay();
    const servers = storage.get('servers', initialServers);
    storage.set('servers', servers.filter(s => s.id !== id));
  },

  async start(id: string): Promise<MCPServer> {
    return this.update(id, { status: 'running', uptime: 100 });
  },

  async stop(id: string): Promise<MCPServer> {
    return this.update(id, { status: 'stopped', uptime: 0 });
  },

  async restart(id: string): Promise<MCPServer> {
    await this.update(id, { status: 'deploying' });
    await delay(2000);
    return this.update(id, { status: 'running', lastDeployed: new Date().toISOString() });
  }
};

// Secrets
export const secretService = {
  async getAll(): Promise<Secret[]> {
    await delay();
    return storage.get('secrets', initialSecrets);
  },

  async create(secret: Omit<Secret, 'id' | 'createdAt' | 'lastUsed' | 'status'>): Promise<Secret> {
    await delay();
    const secrets = storage.get('secrets', initialSecrets);
    const newSecret: Secret = {
      ...secret,
      id: `sec-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      status: 'active',
    };
    secrets.push(newSecret);
    storage.set('secrets', secrets);
    return newSecret;
  },

  async update(id: string, updates: Partial<Secret>): Promise<Secret> {
    await delay();
    const secrets = storage.get('secrets', initialSecrets);
    const idx = secrets.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Secret not found');
    secrets[idx] = { ...secrets[idx], ...updates };
    storage.set('secrets', secrets);
    return secrets[idx];
  },

  async delete(id: string): Promise<void> {
    await delay();
    const secrets = storage.get('secrets', initialSecrets);
    storage.set('secrets', secrets.filter(s => s.id !== id));
  },

  async rotate(id: string, newValue: string): Promise<Secret> {
    return this.update(id, {
      value: newValue,
      lastUsed: new Date().toISOString(),
      status: 'active'
    });
  }
};

// Team
export const teamService = {
  async getAll(): Promise<TeamMember[]> {
    await delay();
    return storage.get('teamMembers', initialTeamMembers);
  },

  async invite(member: Omit<TeamMember, 'id' | 'userId' | 'status' | 'lastActive' | 'invitedAt'>): Promise<TeamMember> {
    await delay();
    const members = storage.get('teamMembers', initialTeamMembers);
    const newMember: TeamMember = {
      ...member,
      id: `tm-${Date.now()}`,
      userId: `user-${Date.now()}`,
      status: 'pending',
      lastActive: '',
      invitedAt: new Date().toISOString(),
    };
    members.push(newMember);
    storage.set('teamMembers', members);
    return newMember;
  },

  async updateRole(id: string, role: TeamMember['role']): Promise<TeamMember> {
    await delay();
    const members = storage.get('teamMembers', initialTeamMembers);
    const idx = members.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Member not found');
    members[idx].role = role;
    storage.set('teamMembers', members);
    return members[idx];
  },

  async remove(id: string): Promise<void> {
    await delay();
    const members = storage.get('teamMembers', initialTeamMembers);
    storage.set('teamMembers', members.filter(m => m.id !== id));
  },

  async resendInvite(id: string): Promise<void> {
    await delay(500);
    // Simulate resending invite
  }
};

// Activity
export const activityService = {
  async getAll(): Promise<ActivityEvent[]> {
    await delay();
    // Return empty array - real activity comes from backend API
    // This is only used by Session Replay which shows empty state
    return [];
  },

  async log(event: Omit<ActivityEvent, 'id' | 'timestamp'>): Promise<ActivityEvent> {
    const newEvent: ActivityEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    // In a real app, this would persist
    return newEvent;
  }
};

// Workspace
export const workspaceService = {
  async get(): Promise<Workspace> {
    await delay();
    return storage.get('workspace', initialWorkspace);
  },

  async updateSettings(settings: Partial<Workspace['settings']>): Promise<Workspace> {
    await delay();
    const workspace = storage.get('workspace', initialWorkspace);
    workspace.settings = { ...workspace.settings, ...settings };
    storage.set('workspace', workspace);
    return workspace;
  },

  async getUsage(): Promise<Workspace['usage']> {
    await delay();
    const workspace = storage.get('workspace', initialWorkspace);
    const servers = storage.get('servers', initialServers);
    const members = storage.get('teamMembers', initialTeamMembers);

    // Update usage based on actual data
    workspace.usage.servers.used = servers.length;
    workspace.usage.teamMembers.used = members.length;
    storage.set('workspace', workspace);

    return workspace.usage;
  }
};

// Notifications
export const notificationService = {
  async getAll(): Promise<Notification[]> {
    await delay();
    return storage.get('notifications', initialNotifications);
  },

  async markAsRead(id: string): Promise<void> {
    await delay();
    const notifications = storage.get('notifications', initialNotifications);
    const idx = notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      notifications[idx].read = true;
      storage.set('notifications', notifications);
    }
  },

  async markAllAsRead(): Promise<void> {
    await delay();
    const notifications = storage.get('notifications', initialNotifications);
    notifications.forEach(n => n.read = true);
    storage.set('notifications', notifications);
  },

  async dismiss(id: string): Promise<void> {
    await delay();
    const notifications = storage.get('notifications', initialNotifications);
    storage.set('notifications', notifications.filter(n => n.id !== id));
  }
};

// Stats helpers
export const statsService = {
  async getDashboardStats() {
    const servers = await serverService.getAll();
    const secrets = await secretService.getAll();
    const team = await teamService.getAll();

    const runningServers = servers.filter(s => s.status === 'running');
    const totalRequests = servers.reduce((sum, s) => sum + s.requestCount, 0);
    const avgLatency = runningServers.length > 0
      ? Math.round(runningServers.reduce((sum, s) => sum + s.avgLatency, 0) / runningServers.length)
      : 0;

    return {
      activeServers: runningServers.length,
      totalServers: servers.length,
      totalRequests,
      avgLatency,
      secretCount: secrets.length,
      expiringSecrets: secrets.filter(s => s.status === 'expiring').length,
      teamSize: team.length,
      healthScore: Math.round((runningServers.length / servers.length) * 100) || 0,
    };
  }
};
