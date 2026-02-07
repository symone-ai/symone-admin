import { useState, useEffect } from 'react';
import {
  Search,
  MoreHorizontal,
  RefreshCw,
  Eye,
  Trash2,
  PlusCircle,
  Edit,
  Users,
  Building2,
  ChevronDown,
  ChevronUp,
  Mail,
  User,
  Loader2,
  UserMinus,
  UserPlus,
  RotateCcw,
  Shield,
  Bell,
  Server
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { api, type Team, type PlatformUser, type TeamMember, type Plan } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const planColors: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  starter: 'bg-blue-500/10 text-blue-500',
  pro: 'bg-purple-500/10 text-purple-500',
  enterprise: 'bg-primary/10 text-primary',
};

export default function AdminUsers() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teams');

  // Teams state
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', plan: 'free', quota_limit: 500 });
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<Record<string, TeamMember[]>>({});
  const [loadingMembers, setLoadingMembers] = useState<string | null>(null);
  const [addingMemberToTeam, setAddingMemberToTeam] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [memberRole, setMemberRole] = useState<'owner' | 'admin' | 'member' | 'viewer'>('member');

  // Users state
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [deletingUser, setDeletingUser] = useState<PlatformUser | null>(null);

  // Plans for quota lookup
  const [plans, setPlans] = useState<Plan[]>([]);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => { },
    variant: 'default'
  });

  useEffect(() => {
    loadTeams();
    loadPlans();
    loadUsersCount(); // Load user count immediately without loading all user data
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) {
      loadUsers();
    }
  }, [activeTab]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      console.log('[AdminUsers] Loading teams...');
      const response = await api.teams.list({ limit: 100 });
      console.log('[AdminUsers] Teams loaded:', response);
      setTeams(response.teams || []);
    } catch (error: any) {
      console.error('[AdminUsers] Error loading teams:', error);
      toast({
        title: 'Error loading teams',
        description: error.message,
        variant: 'destructive'
      });
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('[AdminUsers] Loading users...');
      const response = await api.users.list({ limit: 100 });
      console.log('[AdminUsers] Users loaded:', response);
      setUsers(response.users || []);
      setTotalUsers(response.total || 0);
    } catch (error: any) {
      console.error('[AdminUsers] Error loading users:', error);
      toast({
        title: 'Error loading users',
        description: error.message,
        variant: 'destructive'
      });
      // Set empty array on error
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const response = await api.plans.list();
      setPlans(response.plans || []);
    } catch (error: any) {
      console.error('Error loading plans:', error);
    }
  };

  const loadUsersCount = async () => {
    try {
      console.log('[AdminUsers] Loading users count...');
      const response = await api.users.getStats();
      console.log('[AdminUsers] Users count loaded:', response);
      setTotalUsers(response.total_users || 0);
    } catch (error: any) {
      console.error('[AdminUsers] Error loading users count:', error);
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    if (teamMembers[teamId]) {
      // Already loaded
      console.log('[AdminUsers] Team members already loaded for:', teamId);
      return;
    }

    try {
      setLoadingMembers(teamId);
      console.log('[AdminUsers] Loading team members for:', teamId);
      const members = await api.users.getTeamMembers(teamId);
      console.log('[AdminUsers] Team members loaded:', members);
      setTeamMembers(prev => ({ ...prev, [teamId]: members || [] }));
    } catch (error: any) {
      console.error('[AdminUsers] Error loading team members:', error);
      toast({
        title: 'Error loading team members',
        description: error.message,
        variant: 'destructive'
      });
      // Set empty array on error to prevent retry
      setTeamMembers(prev => ({ ...prev, [teamId]: [] }));
    } finally {
      setLoadingMembers(null);
    }
  };

  const toggleTeamExpanded = (teamId: string) => {
    if (expandedTeamId === teamId) {
      setExpandedTeamId(null);
    } else {
      setExpandedTeamId(teamId);
      loadTeamMembers(teamId);
    }
  };

  const createTeam = async () => {
    try {
      await api.teams.create(newTeam);
      toast({
        title: 'Team created',
        description: `${newTeam.name} has been created successfully`
      });
      setCreatingTeam(false);
      setNewTeam({ name: '', plan: 'free', quota_limit: 500 });
      loadTeams();
    } catch (error: any) {
      toast({
        title: 'Error creating team',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const updateTeam = async () => {
    if (!editingTeam) return;

    try {
      await api.teams.update(editingTeam.id, {
        name: editingTeam.name,
        plan: editingTeam.plan,
        quota_limit: editingTeam.quota_limit,
        active: editingTeam.active
      });
      toast({
        title: 'Team updated',
        description: `${editingTeam.name} has been updated successfully`
      });
      setEditingTeam(null);
      loadTeams();
    } catch (error: any) {
      toast({
        title: 'Error updating team',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const deleteTeam = async (teamId: string, teamName: string, hardDelete: boolean = false, deleteUsers: boolean = false) => {
    console.log('[AdminUsers] deleteTeam called with:', { teamId, teamName, hardDelete, deleteUsers });

    const title = hardDelete
      ? deleteUsers
        ? `Delete ${teamName} and All Users?`
        : `Permanently Delete ${teamName}?`
      : `Deactivate ${teamName}?`;

    const description = hardDelete
      ? deleteUsers
        ? `This will permanently delete ${teamName} AND all its users. This action cannot be undone!`
        : `This will permanently delete ${teamName}. Users will remain but the team will be deleted. This action cannot be undone!`
      : `This will deactivate ${teamName}. The team can be restored later.`;

    console.log('[AdminUsers] Showing confirmation dialog');

    setConfirmDialog({
      open: true,
      title,
      description,
      variant: hardDelete ? 'destructive' : 'default',
      onConfirm: async () => {
        console.log('[AdminUsers] User confirmed delete');
        try {
          console.log('[AdminUsers] Deleting team:', { teamId, teamName, hardDelete, deleteUsers });
          const result = await api.teams.delete(teamId, hardDelete, deleteUsers);
          console.log('[AdminUsers] Team delete result:', result);
          toast({
            title: 'Team deleted',
            description: hardDelete
              ? `${teamName} has been permanently deleted${deleteUsers ? ` (${result.users_deleted || 0} users deleted)` : ''}`
              : `${teamName} has been deactivated`
          });
          loadTeams();
          if (activeTab === 'users') {
            loadUsers();
          }
        } catch (error: any) {
          console.error('[AdminUsers] Error deleting team:', error);
          toast({
            title: 'Error deleting team',
            description: error.message || 'Unknown error occurred',
            variant: 'destructive'
          });
        }
      }
    });
  };

  const bulkDeleteUsersWithoutTeams = async () => {
    console.log('[AdminUsers] bulkDeleteUsersWithoutTeams called');

    setConfirmDialog({
      open: true,
      title: 'Delete All Orphaned Users?',
      description: 'This will permanently delete all users without team memberships from both Supabase Auth and the database. This action cannot be undone!',
      variant: 'destructive',
      onConfirm: async () => {
        console.log('[AdminUsers] User confirmed bulk delete');
        try {
          setLoading(true);
          console.log('[AdminUsers] Starting bulk delete users without teams...');
          const result = await api.users.bulkDeleteWithoutTeams();
          console.log('[AdminUsers] Bulk delete result:', result);
          toast({
            title: 'Bulk delete complete',
            description: `Deleted ${result.total_deleted} users without teams (Auth: ${result.deleted_from_auth}, DB: ${result.deleted_from_db})`
          });
          loadUsers();
          loadTeams();
        } catch (error: any) {
          console.error('[AdminUsers] Error bulk deleting users:', error);
          toast({
            title: 'Error deleting users',
            description: error.message || 'Unknown error occurred',
            variant: 'destructive'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const addMemberToTeam = async () => {
    if (!addingMemberToTeam || !selectedUserId) return;

    try {
      await api.users.addToTeam(addingMemberToTeam, selectedUserId, memberRole);

      toast({
        title: 'Member added',
        description: 'User has been added to the team'
      });

      setAddingMemberToTeam(null);
      setSelectedUserId('');
      setMemberRole('member');

      // Refresh team members for the updated team
      setTeamMembers(prev => {
        const updated = { ...prev };
        delete updated[addingMemberToTeam];
        return updated;
      });
      loadTeamMembers(addingMemberToTeam);
      loadTeams();

    } catch (error: any) {
      toast({
        title: 'Error adding member',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Get plan quota from plans API instead of hardcoded values
  const getPlanQuota = (planSlug: string): number => {
    const plan = plans.find(p => p.slug === planSlug);
    return plan?.quota_limit || 500;
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team?.name?.toLowerCase().includes(teamSearchQuery.toLowerCase()) ?? false;
    const matchesPlan = planFilter === 'all' || team?.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const filteredUsers = users.filter(user => {
    const searchLower = userSearchQuery.toLowerCase();
    const firstNameMatch = user.first_name?.toLowerCase().includes(searchLower) || false;
    const lastNameMatch = user.last_name?.toLowerCase().includes(searchLower) || false;
    const emailMatch = user.email?.toLowerCase().includes(searchLower) || false;
    return emailMatch || firstNameMatch || lastNameMatch;
  });

  if (loading && teams.length === 0 && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="teams" className="gap-2">
              <Building2 className="h-4 w-4" />
              Teams ({teams.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users ({totalUsers || users.length})
            </TabsTrigger>
          </TabsList>

          <Button variant="outline" size="sm" onClick={() => {
            if (activeTab === 'teams') loadTeams();
            else loadUsers();
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teams by name..."
                  value={teamSearchQuery}
                  onChange={(e) => setTeamSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.slug}>{plan.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCreatingTeam(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Teams</CardTitle>
              <CardDescription>
                Manage team accounts, plans, and quotas. {filteredTeams.length} teams found.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredTeams.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No teams found. Create your first team to get started.
                  </div>
                ) : (
                  filteredTeams.map((team) => (
                    <Collapsible
                      key={team.id}
                      open={expandedTeamId === team.id}
                      onOpenChange={() => toggleTeamExpanded(team.id)}
                    >
                      <div className="border rounded-lg">
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                            <div className="flex items-center gap-4">
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                {expandedTeamId === team.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                              <div>
                                <p className="font-medium">{team?.name || 'Unknown Team'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {team?.member_count || 0} members • Created {team?.created_at ? new Date(team.created_at).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <Badge className={planColors[team?.plan || 'free'] || planColors.free}>
                                {(team?.plan || 'free').charAt(0).toUpperCase() + (team?.plan || 'free').slice(1)}
                              </Badge>
                              <Badge className={(team?.active ?? true) ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
                                {(team?.active ?? true) ? 'Active' : 'Inactive'}
                              </Badge>
                              <div className="text-sm text-right">
                                <p>{(team?.usage_count ?? 0).toLocaleString()} / {(team?.quota_limit ?? 0).toLocaleString()}</p>
                                <p className="text-muted-foreground">Usage</p>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTimeout(() => setEditingTeam(team), 100); }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Team
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onSelect={(e) => { e.preventDefault(); setTimeout(() => deleteTeam(team.id, team.name || 'Unknown Team', false, false), 500); }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Deactivate Team (Soft)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onSelect={(e) => { e.preventDefault(); setTimeout(() => deleteTeam(team.id, team.name || 'Unknown Team', true, false), 500); }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Team (Hard)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive font-bold"
                                    onSelect={(e) => { e.preventDefault(); setTimeout(() => deleteTeam(team.id, team.name || 'Unknown Team', true, true), 500); }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Team + Users
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="border-t p-4 bg-muted/30">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Team Members
                              </h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAddingMemberToTeam(team.id);
                                }}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Member
                              </Button>
                            </div>

                            {loadingMembers === team.id ? (
                              <div className="flex items-center gap-2 text-muted-foreground py-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading members...
                              </div>
                            ) : teamMembers[team.id]?.length ? (
                              <div className="space-y-2">
                                {teamMembers[team.id].map((member) => (
                                  <div
                                    key={member.membership_id}
                                    className="flex items-center justify-between p-3 bg-background rounded-lg border"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={member?.avatar_url || undefined} />
                                        <AvatarFallback>
                                          {member?.name?.slice(0, 2).toUpperCase() || member?.email?.slice(0, 2).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{member?.name || 'No name'}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                          <Mail className="h-3 w-3" />
                                          {member?.email || 'No email'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Badge variant="outline">{member?.role || 'member'}</Badge>
                                      <Badge className={(member?.active ?? true) ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
                                        {(member?.active ?? true) ? 'Active' : 'Inactive'}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground py-4">No members in this team</p>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by email or name..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={bulkDeleteUsersWithoutTeams}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clean Up Orphaned Users
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                View all platform users and their team memberships. {filteredUsers.length} users found.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Teams</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback>
                                {user.name?.slice(0, 2).toUpperCase() || user.email.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {user.first_name} {user.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.teams?.length > 0 ? (
                              user.teams.map((team, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {team.team_name} ({team.role})
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">No teams</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Badge className={user.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
                              {user.active ? 'Active' : 'Inactive'}
                            </Badge>
                            {user.email_verified && (
                              <Badge variant="outline" className="text-xs">Verified</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.last_login_at
                            ? new Date(user.last_login_at).toLocaleDateString()
                            : 'Never'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={async () => {
                                  try {
                                    await api.users.resetPassword(user.id);
                                    toast({ title: 'Password reset email sent' });
                                  } catch (error: any) {
                                    toast({ title: 'Error', description: error.message, variant: 'destructive' });
                                  }
                                }}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={async () => {
                                  const newStatus = !user.active;
                                  try {
                                    await api.users.updateStatus(user.id, newStatus);
                                    toast({
                                      title: newStatus ? 'User enabled' : 'User disabled',
                                      description: `${user.email} has been ${newStatus ? 'enabled' : 'disabled'}`
                                    });
                                    // Force reload to get fresh data from server
                                    await loadUsers();
                                  } catch (error: any) {
                                    toast({
                                      title: 'Error updating user status',
                                      description: error.message,
                                      variant: 'destructive'
                                    });
                                  }
                                }}
                              >
                                {user.active ? (
                                  <><UserMinus className="h-4 w-4 mr-2" />Disable Account</>
                                ) : (
                                  <><UserPlus className="h-4 w-4 mr-2" />Enable Account</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeletingUser(user)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Team Dialog */}
      <Dialog open={creatingTeam} onOpenChange={setCreatingTeam}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>Add a new team to the platform</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Team Name</Label>
              <Input
                placeholder="Acme Corporation"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select
                value={newTeam.plan}
                onValueChange={(plan) => setNewTeam({
                  ...newTeam,
                  plan,
                  quota_limit: getPlanQuota(plan)
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.slug}>
                      {plan.name} ({plan.quota_limit.toLocaleString()} calls/month)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Monthly Quota</Label>
              <Input
                type="number"
                value={newTeam.quota_limit}
                onChange={(e) => setNewTeam({ ...newTeam, quota_limit: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatingTeam(false)}>Cancel</Button>
            <Button onClick={createTeam} disabled={!newTeam.name}>Create Team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={!!editingTeam} onOpenChange={() => setEditingTeam(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>Update team settings, plan, and quota</DialogDescription>
          </DialogHeader>
          {editingTeam && (() => {
            const teamPlan = plans.find(p => p.slug === editingTeam.plan);
            const memberCount = editingTeam.member_count ?? 0;
            const memberLimit = teamPlan?.member_limit;
            const workspaceLimit = teamPlan?.workspace_limit;
            const usagePercent = editingTeam.quota_limit
              ? Math.round(((editingTeam.usage_count ?? 0) / editingTeam.quota_limit) * 100)
              : 0;

            return (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Team Name</Label>
                  <Input
                    value={editingTeam.name}
                    onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Plan</Label>
                    <Select
                      value={editingTeam.plan}
                      onValueChange={(plan) => setEditingTeam({
                        ...editingTeam,
                        plan: plan as any,
                        quota_limit: getPlanQuota(plan)
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map(plan => (
                          <SelectItem key={plan.id} value={plan.slug}>{plan.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editingTeam.active ? 'active' : 'inactive'}
                      onValueChange={(status) => setEditingTeam({ ...editingTeam, active: status === 'active' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Quota</Label>
                  <Input
                    type="number"
                    value={editingTeam.quota_limit}
                    onChange={(e) => setEditingTeam({ ...editingTeam, quota_limit: parseInt(e.target.value) })}
                  />
                </div>

                {/* Usage & Quota Stats */}
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">API Usage</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          await api.teams.resetUsage(editingTeam.id);
                          toast({ title: 'Usage reset', description: `Usage counter for ${editingTeam.name} has been reset to 0` });
                          setEditingTeam({ ...editingTeam, usage_count: 0 });
                          loadTeams();
                        } catch (error: any) {
                          toast({ title: 'Error resetting usage', description: error.message, variant: 'destructive' });
                        }
                      }}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset Usage
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{(editingTeam.usage_count ?? 0).toLocaleString()} / {(editingTeam.quota_limit ?? 0).toLocaleString()} calls</span>
                      <span className={usagePercent >= 90 ? 'text-red-500 font-medium' : usagePercent >= 70 ? 'text-yellow-500' : 'text-muted-foreground'}>
                        {usagePercent}%
                      </span>
                    </div>
                    <Progress value={Math.min(usagePercent, 100)} className="h-2" />
                  </div>
                </div>

                {/* Plan Limits Display */}
                {teamPlan && (
                  <div className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-medium text-sm">Plan Limits ({teamPlan.name})</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Members:</span>
                        <span className="font-medium">
                          {memberCount}{memberLimit != null ? ` / ${memberLimit}` : ' / Unlimited'}
                        </span>
                        {memberLimit != null && memberCount >= memberLimit && (
                          <Badge variant="destructive" className="text-[10px] px-1 py-0">At limit</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>Workspaces:</span>
                        <span className="font-medium">
                          {workspaceLimit != null ? workspaceLimit : 'Unlimited'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <span>Servers:</span>
                        <span className="font-medium">
                          {teamPlan.server_providers?.join(', ') || 'community'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        <span>Log Retention:</span>
                        <span className="font-medium">{teamPlan.log_retention_days}d</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      {teamPlan.request_tracing && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />Tracing
                        </Badge>
                      )}
                      {teamPlan.webhooks && (
                        <Badge variant="outline" className="text-xs">
                          <Bell className="h-3 w-3 mr-1" />Webhooks
                        </Badge>
                      )}
                      {teamPlan.server_providers?.includes('official') && (
                        <Badge variant="outline" className="text-xs">
                          <Server className="h-3 w-3 mr-1" />Official MCPs
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTeam(null)}>Cancel</Button>
            <Button onClick={updateTeam}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingUser?.email}</strong>?
              This action cannot be undone. The user will be removed from all teams and
              their account will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingUser(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deletingUser) return;
                try {
                  await api.users.delete(deletingUser.id);
                  toast({ title: 'User deleted successfully' });
                  setDeletingUser(null);
                  loadUsers();
                } catch (error: any) {
                  toast({ title: 'Error', description: error.message, variant: 'destructive' });
                }
              }}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member to Team Dialog */}
      <Dialog open={!!addingMemberToTeam} onOpenChange={() => setAddingMemberToTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User to Team</DialogTitle>
            <DialogDescription>
              Add an existing user to {teams.find(t => t.id === addingMemberToTeam)?.name || 'this team'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u =>
                    !teamMembers[addingMemberToTeam || '']?.some(m => m.user_id === u.id)
                  ).map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email} - {user.first_name} {user.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={memberRole} onValueChange={(value: any) => setMemberRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingMemberToTeam(null)}>
              Cancel
            </Button>
            <Button onClick={addMemberToTeam} disabled={!selectedUserId}>
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation AlertDialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog({ ...confirmDialog, open: false });
              }}
              className={confirmDialog.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
