/**
 * Symone API Client
 *
 * Handles all API communication with the backend gateway.
 * Configure VITE_API_URL in .env for production.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://symone-gateway-196867632933.us-central1.run.app';

// Storage keys
const ADMIN_TOKEN_KEY = 'symone_admin_token';
const ADMIN_USER_KEY = 'symone_admin_user';

// ============================================================================
// Types
// ============================================================================

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'support' | 'analyst';
  active: boolean;
  created_at?: string;
  last_login_at?: string;
}

export interface AdminSession {
  session_id: string;
  token: string;
  expires_at: string;
}

export interface Team {
  id: string;
  name: string;
  plan?: 'free' | 'starter' | 'pro' | 'enterprise';
  quota_limit?: number;
  usage_count?: number;
  usage_reset_at?: string;
  active?: boolean;
  config?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  member_count?: number;
}

export interface SystemOverview {
  teams: {
    total: number;
    active: number;
    inactive: number;
  };
  users: {
    total: number;
  };
  servers: {
    total: number;
    active: number;
    inactive: number;
  };
  usage: {
    total_calls: number;
    calls_24h: number;
    success_rate_24h: number;
  };
  timestamp: string;
}

export interface UsageTrend {
  date: string;
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
}

export interface ServerPerformance {
  server_type: string;
  total_calls: number;
  avg_latency_ms: number;
  success_rate: number;
  last_activity: string;
}

export interface ActivityLog {
  id: string;
  server_id?: string;
  agent_name?: string;
  tool_name: string;
  status: 'success' | 'error' | 'pending';
  latency_ms?: number;
  timestamp: string;
}

// ============================================================================
// Storage Helpers
// ============================================================================

export const storage = {
  getAdminToken: (): string | null => localStorage.getItem(ADMIN_TOKEN_KEY),
  setAdminToken: (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token),
  clearAdminToken: () => localStorage.removeItem(ADMIN_TOKEN_KEY),

  getAdminUser: (): AdminUser | null => {
    const user = localStorage.getItem(ADMIN_USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  setAdminUser: (user: AdminUser) => localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user)),
  clearAdminUser: () => localStorage.removeItem(ADMIN_USER_KEY),

  clearAll: () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  }
};

// ============================================================================
// HTTP Client
// ============================================================================

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = storage.getAdminToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['X-Admin-Token'] = token;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle token expiration/invalid token errors
    if (response.status === 401 || response.status === 403) {
      const errorMessage = data.detail || data.message || '';
      if (errorMessage.toLowerCase().includes('token') || errorMessage.toLowerCase().includes('unauthorized')) {
        console.log('[API] Admin token expired or invalid, redirecting to login...');
        storage.clearAll();
        window.location.href = '/admin/login';
        throw new ApiError(response.status, 'Session expired, redirecting to login...', data);
      }
    }

    throw new ApiError(
      response.status,
      data.detail || data.message || 'Request failed',
      data
    );
  }

  return data;
}

// ============================================================================
// Authentication
// ============================================================================

export const auth = {
  login: async (email: string, password: string) => {
    const response = await request<{
      success: boolean;
      admin: AdminUser;
      session: AdminSession;
    }>('/admin/simple-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    storage.setAdminToken(response.session.token);
    storage.setAdminUser(response.admin);

    return response;
  },

  logout: async () => {
    try {
      await request('/admin/logout', { method: 'POST' });
    } finally {
      storage.clearAll();
    }
  },

  getCurrentUser: async () => {
    const response = await request<{ success: boolean; admin: AdminUser }>('/admin/me');
    storage.setAdminUser(response.admin);
    return response.admin;
  },

  isAuthenticated: (): boolean => {
    return !!storage.getAdminToken();
  }
};

// ============================================================================
// Analytics
// ============================================================================

export const analytics = {
  getOverview: async () => {
    const response = await request<{ success: boolean; } & SystemOverview>('/admin/analytics/overview');
    return response;
  },

  getUsageTrends: async (days: number = 30) => {
    const response = await request<{ success: boolean; trends: UsageTrend[] }>(
      `/admin/analytics/usage-trends?days=${days}`
    );
    return response.trends;
  },

  getServerPerformance: async () => {
    const response = await request<{ success: boolean; servers: ServerPerformance[] }>(
      '/admin/analytics/server-performance'
    );
    return response.servers;
  },

  getRevenueAnalytics: async () => {
    const response = await request<{
      success: boolean;
      total_mrr: number;
      total_arr: number;
      by_plan: Record<string, { mrr: number; arr: number; count: number }>;
      timestamp: string;
    }>('/admin/analytics/revenue');
    return response;
  }
};

// ============================================================================
// Settings
// ============================================================================

export interface SystemSettings {
  general: {
    platform_name: string;
    support_email: string;
    platform_description: string;
    default_region: string;
    default_timezone: string;
  };
  features: {
    allow_registrations: boolean;
    maintenance_mode: boolean;
  };
  security: {
    require_email_verification: boolean;
    enforce_2fa_admins: boolean;
    session_timeout_hours: number;
    max_login_attempts: number;
  };
  email: {
    smtp_host: string;
    smtp_port: number;
    smtp_username: string;
    from_email: string;
    from_name: string;
  };
  theme: {
    default_mode: 'dark' | 'light';
  };
}

export const settings = {
  getAll: async (): Promise<{ settings: Record<string, { value: any; updated_at: string | null }> }> => {
    const response = await request<{
      success: boolean;
      settings: Record<string, { value: any; updated_at: string | null }>;
    }>('/admin/settings');
    return response;
  },

  get: async (key: string): Promise<{ value: any; updated_at: string | null }> => {
    const response = await request<{
      success: boolean;
      key: string;
      value: any;
      updated_at: string | null;
    }>(`/admin/settings/${key}`);
    return { value: response.value, updated_at: response.updated_at };
  },

  updateAll: async (settingsData: Record<string, any>): Promise<void> => {
    await request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings: settingsData }),
    });
  },

  update: async (key: string, value: any): Promise<void> => {
    await request(`/admin/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify(value),
    });
  },

  getTheme: async (): Promise<'dark' | 'light'> => {
    const response = await request<{ success: boolean; mode: 'dark' | 'light' }>('/admin/settings/theme/current');
    return response.mode;
  },

  setTheme: async (mode: 'dark' | 'light'): Promise<void> => {
    await request(`/admin/settings/theme/${mode}`, { method: 'PUT' });
  }
};

// ============================================================================
// Users (Admin)
// ============================================================================

export interface PlatformUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  teams: Array<{
    team_id: string;
    team_name: string;
    team_plan: string;
    role: string;
  }>;
  team_count: number;
}

export interface TeamMember {
  membership_id: string;
  user_id: string;
  role: string;
  joined_at?: string;
  email: string;
  name?: string;
  avatar_url?: string | null;
  active?: boolean;
  last_login_at?: string | null;
}

export const users = {
  list: async (params?: { limit?: number; offset?: number }): Promise<{
    users: PlatformUser[];
    total: number;
    limit: number;
    offset: number;
  }> => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    const response = await request<{
      success: boolean;
      users: PlatformUser[];
      total: number;
      limit: number;
      offset: number;
    }>(`/admin/users${query.toString() ? '?' + query.toString() : ''}`);
    return response;
  },

  get: async (userId: string): Promise<PlatformUser> => {
    const response = await request<{ success: boolean; user: PlatformUser }>(`/admin/users/${userId}`);
    return response.user;
  },

  getStats: async (): Promise<{
    total_users: number;
    active_users: number;
    verified_users: number;
    new_users_30d: number;
  }> => {
    const response = await request<{
      success: boolean;
      total_users: number;
      active_users: number;
      verified_users: number;
      new_users_30d: number;
    }>('/admin/users/stats');
    return response;
  },

  getTeamMembers: async (teamId: string): Promise<TeamMember[]> => {
    const response = await request<{
      success: boolean;
      members: TeamMember[];
      total: number;
    }>(`/admin/teams/${teamId}/members`);
    return response.members;
  },

  addToTeam: async (teamId: string, userId: string, role: string = 'member'): Promise<void> => {
    await request(`/admin/teams/${teamId}/members?user_id=${userId}&role=${role}`, {
      method: 'POST'
    });
  },

  removeFromTeam: async (teamId: string, userId: string): Promise<void> => {
    await request(`/admin/teams/${teamId}/members/${userId}`, {
      method: 'DELETE'
    });
  },

  delete: async (userId: string): Promise<void> => {
    await request(`/admin/users/${userId}`, { method: 'DELETE' });
  },

  bulkDeleteWithoutTeams: async (): Promise<{
    success: boolean;
    message: string;
    total_deleted: number;
    deleted_from_auth: number;
    deleted_from_db: number;
    deleted_users: Array<{ user_id: string; email: string; in_auth: boolean; in_db: boolean }>;
  }> => {
    return await request(`/admin/users/bulk-delete-without-teams`, { method: 'POST' });
  },

  updateStatus: async (userId: string, active: boolean): Promise<{ success: boolean; active: boolean }> => {
    return await request(`/admin/users/${userId}/status?active=${active}`, { method: 'PUT' });
  },

  resetPassword: async (userId: string): Promise<{ success: boolean; message: string }> => {
    return await request(`/admin/users/${userId}/reset-password`, { method: 'POST' });
  }
};

// ============================================================================
// Teams
// ============================================================================

export const teams = {
  list: async (params?: { limit?: number; offset?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.search) query.append('search', params.search);

    const response = await request<{
      success: boolean;
      teams: Team[];
      total: number;
      limit: number;
      offset: number;
      has_more: boolean;
    }>(`/admin/teams?${query}`);
    return response;
  },

  get: async (teamId: string) => {
    const response = await request<{ success: boolean; team: Team }>(`/admin/teams/${teamId}`);
    return response.team;
  },

  create: async (data: { name: string; plan?: string; quota_limit?: number }) => {
    const response = await request<{ success: boolean; team: Team }>('/admin/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.team;
  },

  update: async (teamId: string, data: { plan?: string; quota_limit?: number; active?: boolean }) => {
    const response = await request<{ success: boolean; team: Team }>(`/admin/teams/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.team;
  },

  delete: async (teamId: string, hardDelete: boolean = false, deleteUsers: boolean = false) => {
    const query = new URLSearchParams();
    if (hardDelete) query.append('hard_delete', 'true');
    if (deleteUsers) query.append('delete_users', 'true');

    const response = await request<{
      success: boolean;
      message: string;
      users_deleted?: number;
      deleted_users?: Array<{ user_id: string; email: string }>;
    }>(`/admin/teams/${teamId}?${query}`, { method: 'DELETE' });
    return response;
  }
};

// ============================================================================
// Activity
// ============================================================================

export const activity = {
  list: async (params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    const response = await request<{
      success: boolean;
      activities: ActivityLog[];
      total: number;
    }>(`/admin/activity?${query}`);
    return response.activities;
  }
};

// ============================================================================
// Admins
// ============================================================================

export const admins = {
  list: async (params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    const response = await request<{
      success: boolean;
      admins: AdminUser[];
      total: number;
    }>(`/admin/admins?${query}`);
    return response.admins;
  },

  create: async (data: { email: string; password: string; role: string }) => {
    const response = await request<{ success: boolean; admin: AdminUser }>('/admin/admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.admin;
  }
};

// ============================================================================
// Plans
// ============================================================================

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price_monthly: number;
  price_yearly: number;
  quota_limit: number;
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const plans = {
  list: async (params?: { is_active?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.is_active !== undefined) query.append('is_active', params.is_active.toString());

    const response = await request<{
      success: boolean;
      plans: Plan[];
      total: number;
    }>(`/admin/plans?${query}`);
    return response;
  },

  get: async (planId: string) => {
    const response = await request<{ success: boolean; plan: Plan }>(`/admin/plans/${planId}`);
    return response.plan;
  },

  create: async (data: {
    name: string;
    slug: string;
    description?: string;
    price_monthly: number;
    price_yearly: number;
    quota_limit: number;
    features: string[];
    is_active?: boolean;
    is_featured?: boolean;
  }) => {
    const response = await request<{ success: boolean; plan: Plan }>('/admin/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.plan;
  },

  update: async (planId: string, data: Partial<Plan>) => {
    const response = await request<{ success: boolean; plan: Plan }>(`/admin/plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.plan;
  },

  delete: async (planId: string) => {
    await request(`/admin/plans/${planId}`, { method: 'DELETE' });
  }
};

// ============================================================================
// MCP Marketplace
// ============================================================================

export interface MarketplaceMCP {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  description?: string;
  provider: 'official' | 'partner' | 'community';
  status: 'planned' | 'active' | 'pending' | 'rejected' | 'deprecated';
  version: string;
  icon: string;
  installs: number;
  rating: number;
  is_featured: boolean;
  verified: boolean;
  is_hosted_by_symone: boolean;
  created_at: string;
  updated_at?: string;
}

export const marketplace = {
  list: async (params?: {
    status?: string;
    provider?: string;
    category?: string;
    search?: string;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.provider) query.append('provider', params.provider);
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', params.limit.toString());

    const response = await request<{
      success: boolean;
      mcps: MarketplaceMCP[];
      total: number;
    }>(`/admin/marketplace?${query}`);
    return response;
  },

  get: async (mcpId: string) => {
    const response = await request<{ success: boolean; mcp: MarketplaceMCP }>(`/admin/marketplace/${mcpId}`);
    return response.mcp;
  },

  create: async (data: {
    name: string;
    slug: string;
    category: string;
    description?: string;
    provider?: string;
    status?: string;
    version?: string;
    icon?: string;
    is_featured?: boolean;
    verified?: boolean;
    is_hosted_by_symone?: boolean;
  }) => {
    const response = await request<{ success: boolean; mcp: MarketplaceMCP }>('/admin/marketplace', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.mcp;
  },

  update: async (mcpId: string, data: Partial<MarketplaceMCP>) => {
    const response = await request<{ success: boolean; mcp: MarketplaceMCP }>(`/admin/marketplace/${mcpId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.mcp;
  },

  delete: async (mcpId: string) => {
    await request(`/admin/marketplace/${mcpId}`, { method: 'DELETE' });
  },

  approve: async (mcpId: string) => {
    const response = await request<{ success: boolean; mcp: MarketplaceMCP }>(`/admin/marketplace/${mcpId}/approve`, {
      method: 'POST',
    });
    return response.mcp;
  },

  reject: async (mcpId: string) => {
    const response = await request<{ success: boolean; mcp: MarketplaceMCP }>(`/admin/marketplace/${mcpId}/reject`, {
      method: 'POST',
    });
    return response.mcp;
  },

  stats: async () => {
    const response = await request<{
      success: boolean;
      stats: {
        total: number;
        active: number;
        pending: number;
        planned: number;
        total_installs: number;
      };
    }>('/admin/marketplace/stats');
    return response.stats;
  }
};

// ============================================================================
// Public
// ============================================================================

export const publicApi = {
  marketplace: {
    list: async (params?: {
      category?: string;
      subcategory?: string;
      search?: string;
      provider?: string; // server_type
      executionMode?: string;
    }) => {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.subcategory) query.append('subcategory', params.subcategory);
      if (params?.search) query.append('search', params.search);
      if (params?.provider && params.provider !== 'all') query.append('provider', params.provider);

      const response = await fetch(`${API_BASE_URL}/public/marketplace?${query}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    },
    get: async (slug: string) => {
      const response = await fetch(`${API_BASE_URL}/public/marketplace/${slug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    }
  }
};

// ============================================================================
// User-facing APIs (Dashboard)
// ============================================================================

const USER_TOKEN_KEY = 'symone_user_token';

export const userStorage = {
  getToken: (): string | null => localStorage.getItem(USER_TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(USER_TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(USER_TOKEN_KEY),
};

async function userRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = userStorage.getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle token expiration/invalid token errors
    if (response.status === 401 || response.status === 403) {
      const errorMessage = data.detail || data.message || '';
      if (errorMessage.toLowerCase().includes('token') || errorMessage.toLowerCase().includes('unauthorized')) {
        console.log('[API] User token expired or invalid, redirecting to login...');
        userStorage.clearToken();
        window.location.href = '/login';
        throw new ApiError(response.status, 'Session expired, redirecting to login...', data);
      }
    }

    throw new ApiError(
      response.status,
      data.detail || data.message || 'Request failed',
      data
    );
  }

  return data;
}

export interface UserServer {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'error' | 'deploying';
  config?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface UserActivityLog {
  id: string;
  server_type: string;
  tool_name: string;
  status: 'success' | 'error' | 'pending';
  latency_ms?: number;
  created_at: string;
  request_params?: Record<string, any>;
}

export const user = {
  // Servers - uses session token auth
  getServers: async () => {
    const response = await userRequest<{ success: boolean; servers: UserServer[] }>('/auth/dashboard/servers');
    return response.servers || [];
  },

  deployServer: async (data: {
    name: string;
    type: string;
    config?: Record<string, any>;
  }) => {
    const response = await userRequest<{ success: boolean; server: UserServer; message?: string }>(
      '/auth/dashboard/servers',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.server;
  },

  deleteServer: async (serverId: string) => {
    await userRequest(`/auth/dashboard/servers/${serverId}`, { method: 'DELETE' });
  },

  getServerConnectionInfo: async (serverId: string) => {
    return await userRequest<{
      success: boolean;
      connection: {
        server_id: string;
        server_name: string;
        server_type: string;
        status: string;
        gateway_url: string;
        tools_endpoint: string;
        api_key_hint?: string;
        region: string;
        claude_desktop_config: {
          mcpServers: Record<string, any>;
        };
        curl_example: string;
        documentation_url: string;
        next_steps: string[];
      };
    }>(`/auth/dashboard/servers/${serverId}/connection-info`);
  },

  getPlanLimits: async () => {
    return await userRequest<{
      success: boolean;
      quota_limit: number;
      server_limit: number;
      storage_limit: number;
      current_usage: number;
      current_servers: number;
      plan: string;
      plan_name: string;
    }>('/auth/dashboard/limits');
  },

  // Activity - uses session token auth
  getActivity: async (params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());

    const response = await userRequest<{ success: boolean; activity: UserActivityLog[] }>(
      `/auth/dashboard/activity${query.toString() ? '?' + query : ''}`
    );
    return { activities: response.activity || [], total: response.activity?.length || 0 };
  },

  // Metrics / Health - uses session token auth
  getMetrics: async () => {
    return await userRequest<{ success: boolean; total_requests: number; success_rate: number; total_servers: number }>(
      '/auth/dashboard/metrics'
    );
  },

  getHealth: async () => {
    return await userRequest<{ success: boolean; status: string; database: string; servers_active: number }>(
      '/auth/dashboard/health'
    );
  },

  // Team Management
  getTeamMembers: async () => {
    return await userRequest<{
      success: boolean;
      members: Array<{
        id: string;
        user_id: string;
        name: string;
        email: string;
        role: string;
        avatar: string;
        status: string;
        created_at: string;
      }>;
    }>('/auth/dashboard/team');
  },

  inviteTeamMember: async (email: string, role: string = 'member') => {
    return await userRequest<{
      success: boolean;
      message: string;
      member: { id: string; email: string; role: string; status: string };
    }>('/auth/dashboard/team/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  removeTeamMember: async (memberId: string) => {
    return await userRequest<{ success: boolean; message: string }>(
      `/auth/dashboard/team/${memberId}`,
      { method: 'DELETE' }
    );
  },

  // Authentication
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Login failed');
    }
    return data;
  },

  signup: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Signup failed');
    }
    return data;
  },

  logout: async () => {
    const token = userStorage.getToken();
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } finally {
      // Clear all user-related storage
      userStorage.clearToken();
      localStorage.removeItem('symone_user');
      localStorage.removeItem('symone_user_token');
      // Clear mock data storage to force re-init on next login
      localStorage.removeItem('symone_initialized');
      // Redirect to login
      window.location.href = '/login';
    }
  },

  getCurrentUser: async () => {
    const token = userStorage.getToken();
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      userStorage.clearToken();
      return null;
    }

    const data = await response.json();
    return data.user;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const token = userStorage.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to change password');
    }
    return data;
  },

  isAuthenticated: () => {
    return !!userStorage.getToken();
  },
};

// ============================================================================
// Export all
// ============================================================================

export const api = {
  auth,
  analytics,
  settings,
  users,
  teams,
  activity,
  admins,
  plans,
  marketplace,
  public: publicApi,
  user,
};

export default api;
