// React Query hooks for Symone data

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  serverService, 
  secretService, 
  teamService, 
  activityService, 
  workspaceService,
  notificationService,
  statsService,
  userService
} from '@/lib/dataService';
import type { MCPServer, Secret, TeamMember, Workspace } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

// Keys
const keys = {
  servers: ['servers'] as const,
  server: (id: string) => ['servers', id] as const,
  secrets: ['secrets'] as const,
  team: ['team'] as const,
  activity: ['activity'] as const,
  workspace: ['workspace'] as const,
  notifications: ['notifications'] as const,
  stats: ['stats'] as const,
  user: ['user'] as const,
};

// User
export const useUser = () => useQuery({
  queryKey: keys.user,
  queryFn: userService.get,
});

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.user });
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    },
  });
};

// Servers
export const useServers = () => useQuery({
  queryKey: keys.servers,
  queryFn: serverService.getAll,
});

export const useServer = (id: string) => useQuery({
  queryKey: keys.server(id),
  queryFn: () => serverService.getById(id),
  enabled: !!id,
});

export const useCreateServer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: serverService.create,
    onSuccess: (server) => {
      queryClient.invalidateQueries({ queryKey: keys.servers });
      queryClient.invalidateQueries({ queryKey: keys.stats });
      toast({ title: 'Server deploying', description: `${server.name} is being deployed...` });
    },
    onError: () => {
      toast({ title: 'Deployment failed', description: 'Could not deploy server.', variant: 'destructive' });
    },
  });
};

export const useUpdateServer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MCPServer> }) => 
      serverService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.servers });
    },
  });
};

export const useDeleteServer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: serverService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.servers });
      queryClient.invalidateQueries({ queryKey: keys.stats });
      toast({ title: 'Server deleted', description: 'The server has been removed.' });
    },
  });
};

export const useStartServer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: serverService.start,
    onSuccess: (server) => {
      queryClient.invalidateQueries({ queryKey: keys.servers });
      toast({ title: 'Server started', description: `${server.name} is now running.` });
    },
  });
};

export const useStopServer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: serverService.stop,
    onSuccess: (server) => {
      queryClient.invalidateQueries({ queryKey: keys.servers });
      toast({ title: 'Server stopped', description: `${server.name} has been stopped.` });
    },
  });
};

export const useRestartServer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: serverService.restart,
    onSuccess: (server) => {
      queryClient.invalidateQueries({ queryKey: keys.servers });
      toast({ title: 'Server restarted', description: `${server.name} is restarting...` });
    },
  });
};

// Secrets
export const useSecrets = () => useQuery({
  queryKey: keys.secrets,
  queryFn: secretService.getAll,
});

export const useCreateSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: secretService.create,
    onSuccess: (secret) => {
      queryClient.invalidateQueries({ queryKey: keys.secrets });
      toast({ title: 'Secret created', description: `${secret.name} has been added.` });
    },
  });
};

export const useUpdateSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Secret> }) => 
      secretService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.secrets });
    },
  });
};

export const useDeleteSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: secretService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.secrets });
      toast({ title: 'Secret deleted', description: 'The secret has been removed.' });
    },
  });
};

export const useRotateSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newValue }: { id: string; newValue: string }) => 
      secretService.rotate(id, newValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.secrets });
      toast({ title: 'Secret rotated', description: 'New value has been saved.' });
    },
  });
};

// Team
export const useTeam = () => useQuery({
  queryKey: keys.team,
  queryFn: teamService.getAll,
});

export const useInviteTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: teamService.invite,
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: keys.team });
      toast({ title: 'Invitation sent', description: `Invite sent to ${member.email}` });
    },
  });
};

export const useUpdateTeamRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: TeamMember['role'] }) => 
      teamService.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.team });
      toast({ title: 'Role updated' });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: teamService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.team });
      toast({ title: 'Member removed' });
    },
  });
};

export const useResendInvite = () => {
  return useMutation({
    mutationFn: teamService.resendInvite,
    onSuccess: () => {
      toast({ title: 'Invite resent' });
    },
  });
};

// Activity
export const useActivity = () => useQuery({
  queryKey: keys.activity,
  queryFn: activityService.getAll,
  refetchInterval: 30000, // Auto-refresh every 30s
});

// Workspace
export const useWorkspace = () => useQuery({
  queryKey: keys.workspace,
  queryFn: workspaceService.get,
});

export const useUpdateWorkspaceSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: workspaceService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.workspace });
      toast({ title: 'Settings saved' });
    },
  });
};

export const useWorkspaceUsage = () => useQuery({
  queryKey: [...keys.workspace, 'usage'],
  queryFn: workspaceService.getUsage,
});

// Notifications
export const useNotifications = () => useQuery({
  queryKey: keys.notifications,
  queryFn: notificationService.getAll,
});

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.notifications });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.notifications });
    },
  });
};

export const useDismissNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.dismiss,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.notifications });
    },
  });
};

// Dashboard Stats
export const useDashboardStats = () => useQuery({
  queryKey: keys.stats,
  queryFn: statsService.getDashboardStats,
});
