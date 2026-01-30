import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Server,
  DollarSign,
  Activity,
  Globe,
  Clock,
  AlertTriangle,
  Skull,
  Zap,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { analytics } from '@/lib/api';

const userGrowthData = [
  { date: 'Jan', users: 8200, active: 6100 },
  { date: 'Feb', users: 8900, active: 6800 },
  { date: 'Mar', users: 9800, active: 7500 },
  { date: 'Apr', users: 10500, active: 8200 },
  { date: 'May', users: 11400, active: 9000 },
  { date: 'Jun', users: 12847, active: 10200 },
];

const revenueData = [
  { date: 'Jan', mrr: 185000, arr: 2220000 },
  { date: 'Feb', mrr: 198000, arr: 2376000 },
  { date: 'Mar', mrr: 215000, arr: 2580000 },
  { date: 'Apr', mrr: 228000, arr: 2736000 },
  { date: 'May', mrr: 256000, arr: 3072000 },
  { date: 'Jun', mrr: 284500, arr: 3414000 },
];

const apiCallsData = [
  { hour: '00:00', calls: 120000 },
  { hour: '04:00', calls: 85000 },
  { hour: '08:00', calls: 280000 },
  { hour: '12:00', calls: 420000 },
  { hour: '16:00', calls: 380000 },
  { hour: '20:00', calls: 290000 },
];

const mcpUsageData = [
  { name: 'OpenAI', value: 35, color: 'hsl(var(--primary))' },
  { name: 'PostgreSQL', value: 25, color: 'hsl(210, 100%, 50%)' },
  { name: 'Slack', value: 18, color: 'hsl(280, 100%, 60%)' },
  { name: 'GitHub', value: 12, color: 'hsl(150, 100%, 40%)' },
  { name: 'Others', value: 10, color: 'hsl(var(--muted))' },
];

const regionData = [
  { region: 'North America', users: 5200, percentage: 40 },
  { region: 'Europe', users: 3800, percentage: 30 },
  { region: 'Asia Pacific', users: 2500, percentage: 19 },
  { region: 'Latin America', users: 850, percentage: 7 },
  { region: 'Other', users: 497, percentage: 4 },
];

const kpis = [
  { label: 'DAU', value: '4,892', change: '+8%', trend: 'up' },
  { label: 'WAU', value: '8,234', change: '+12%', trend: 'up' },
  { label: 'MAU', value: '10,847', change: '+15%', trend: 'up' },
  { label: 'Churn Rate', value: '2.3%', change: '-0.5%', trend: 'down' },
  { label: 'ARPU', value: '$69.50', change: '+5%', trend: 'up' },
  { label: 'LTV', value: '$1,420', change: '+8%', trend: 'up' },
];

// Cost data types
interface TeamCost {
  team_id: string;
  team_name: string;
  request_count: number;
  total_seconds: number;
  estimated_cost: number;
  user_count: number;
  cost_per_user: number;
  status: 'healthy' | 'at_risk';
}

interface ZombieUser {
  team_id: string;
  team_name: string;
  user_id?: string;
  user_email?: string;
  session_count: number;
  avg_session_hours: number;
  total_tools: number;
  idle_ratio?: number;
  longest_session_hours: number;
}

interface ActiveConnection {
  id: string;
  team_id: string;
  team_name: string;
  connected_at: string;
  duration_minutes: number;
  tools_executed: number;
}

interface UserCost {
  user_id: string;
  user_email?: string;
  user_name?: string;
  request_count: number;
  total_seconds: number;
  estimated_cost: number;
  status: 'healthy' | 'at_risk';
}

interface TeamUserCosts {
  team_id: string;
  users: UserCost[];
  unattributed: {
    request_count: number;
    estimated_cost: number;
  };
  target_cost_per_user: number;
}

export default function AdminAnalytics() {
  // Cost attribution state
  const [costData, setCostData] = useState<{
    total_cost: number;
    total_requests: number;
    teams: TeamCost[];
    calculated_at: string;
  } | null>(null);
  const [zombieData, setZombieData] = useState<{
    zombies: ZombieUser[];
    recommendations: string[];
    message?: string;
  } | null>(null);
  const [activeConnections, setActiveConnections] = useState<{
    active_count: number;
    connections: ActiveConnection[];
  } | null>(null);
  const [loadingCosts, setLoadingCosts] = useState(false);
  const [loadingZombies, setLoadingZombies] = useState(false);
  const [costDays, setCostDays] = useState(30);

  // Per-user cost state
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [teamUserCosts, setTeamUserCosts] = useState<TeamUserCosts | null>(null);
  const [loadingUserCosts, setLoadingUserCosts] = useState(false);

  // Fetch cost data
  const fetchCostData = async () => {
    setLoadingCosts(true);
    try {
      const data = await analytics.getUsageCosts(costDays, 20);
      setCostData({
        total_cost: data.total_cost,
        total_requests: data.total_requests,
        teams: data.teams,
        calculated_at: data.calculated_at
      });
    } catch (error) {
      console.error('Failed to fetch cost data:', error);
    } finally {
      setLoadingCosts(false);
    }
  };

  // Fetch zombie data
  const fetchZombieData = async () => {
    setLoadingZombies(true);
    try {
      const [zombies, connections] = await Promise.all([
        analytics.getZombieUsers(7, 300, 20),
        analytics.getActiveConnections()
      ]);
      setZombieData({
        zombies: zombies.zombies,
        recommendations: zombies.recommendations,
        message: zombies.message
      });
      setActiveConnections({
        active_count: connections.active_count,
        connections: connections.connections
      });
    } catch (error) {
      console.error('Failed to fetch zombie data:', error);
    } finally {
      setLoadingZombies(false);
    }
  };

  // Fetch per-user costs for a team
  const fetchTeamUserCosts = async (teamId: string) => {
    setLoadingUserCosts(true);
    setSelectedTeamId(teamId);
    try {
      const data = await analytics.getTeamUserCosts(teamId, costDays, 20);
      setTeamUserCosts({
        team_id: data.team_id,
        users: data.users,
        unattributed: data.unattributed,
        target_cost_per_user: data.target_cost_per_user
      });
    } catch (error) {
      console.error('Failed to fetch team user costs:', error);
      setTeamUserCosts(null);
    } finally {
      setLoadingUserCosts(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchCostData();
    fetchZombieData();
  }, [costDays]);

  // Format currency
  const formatCost = (cost: number) => {
    if (cost < 0.01) return `$${cost.toFixed(6)}`;
    if (cost < 1) return `$${cost.toFixed(4)}`;
    return `$${cost.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-xl font-bold">{kpi.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {kpi.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-green-500" />
                )}
                <span className="text-xs text-green-500">{kpi.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="costs">Costs & Zombies</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Total and active users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowthData}>
                      <defs>
                        <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(150, 100%, 40%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(150, 100%, 40%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fill="url(#usersGradient)" name="Total Users" />
                      <Area type="monotone" dataKey="active" stroke="hsl(150, 100%, 40%)" fill="url(#activeGradient)" name="Active Users" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>Cohort retention analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { cohort: 'Week 1', retention: 100 },
                    { cohort: 'Week 2', retention: 68 },
                    { cohort: 'Week 4', retention: 52 },
                    { cohort: 'Week 8', retention: 41 },
                    { cohort: 'Week 12', retention: 35 },
                  ].map((item) => (
                    <div key={item.cohort} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.cohort}</span>
                        <span className="font-medium">{item.retention}%</span>
                      </div>
                      <Progress value={item.retention} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly and annual recurring revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                      />
                      <Bar dataKey="mrr" fill="hsl(var(--primary))" name="MRR" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Revenue by plan tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { plan: 'Enterprise', revenue: 103753, percentage: 36 },
                    { plan: 'Business', revenue: 118800, percentage: 42 },
                    { plan: 'Team', revenue: 81200, percentage: 22 },
                  ].map((item) => (
                    <div key={item.plan} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.plan}</span>
                        <span className="font-medium">${item.revenue.toLocaleString()} ({item.percentage}%)</span>
                      </div>
                      <Progress value={item.percentage} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Calls by Hour</CardTitle>
                <CardDescription>Today's API usage pattern</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={apiCallsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [value.toLocaleString(), 'API Calls']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="calls" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>MCP Usage Distribution</CardTitle>
                <CardDescription>Most popular MCP servers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mcpUsageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {mcpUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value}%`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {mcpUsageData.map((item) => (
                    <Badge 
                      key={item.name} 
                      variant="outline" 
                      className="flex items-center gap-2"
                    >
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}: {item.value}%
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          {/* Cost Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs">Total Cost (30d)</span>
                </div>
                <p className="text-2xl font-bold">
                  {costData ? formatCost(costData.total_cost) : '--'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs">Total Requests</span>
                </div>
                <p className="text-2xl font-bold">
                  {costData ? costData.total_requests.toLocaleString() : '--'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Active Connections</span>
                </div>
                <p className="text-2xl font-bold">
                  {activeConnections ? activeConnections.active_count : '--'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Skull className="h-4 w-4" />
                  <span className="text-xs">Zombie Users</span>
                </div>
                <p className="text-2xl font-bold text-amber-500">
                  {zombieData ? zombieData.zombies.length : '--'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Leaderboard */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Cost Leaderboard
                  </CardTitle>
                  <CardDescription>
                    Top teams by estimated infrastructure cost (last {costDays} days).
                    Click a team for per-user breakdown.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchCostData}
                  disabled={loadingCosts}
                >
                  {loadingCosts ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {loadingCosts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : costData && costData.teams.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Team</TableHead>
                        <TableHead className="text-right">Requests</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead className="text-right">$/User</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {costData.teams.map((team) => (
                        <TableRow
                          key={team.team_id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => fetchTeamUserCosts(team.team_id)}
                        >
                          <TableCell className="font-medium">
                            <span className="text-primary hover:underline">{team.team_name}</span>
                          </TableCell>
                          <TableCell className="text-right">{team.request_count.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono">{formatCost(team.estimated_cost)}</TableCell>
                          <TableCell className="text-right font-mono">{formatCost(team.cost_per_user)}</TableCell>
                          <TableCell>
                            <Badge variant={team.status === 'healthy' ? 'default' : 'destructive'}>
                              {team.status === 'at_risk' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {team.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No cost data available</p>
                    <p className="text-sm mt-1">Run the database migration to enable cost tracking</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Zombie Report */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Skull className="h-5 w-5" />
                    Zombie Report
                  </CardTitle>
                  <CardDescription>
                    Users with high idle time (SSE connected but not executing tools)
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchZombieData}
                  disabled={loadingZombies}
                >
                  {loadingZombies ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {loadingZombies ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : zombieData?.message ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Skull className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Zombie detection not yet enabled</p>
                    <p className="text-sm mt-1">{zombieData.message}</p>
                  </div>
                ) : zombieData && zombieData.zombies.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Team / User</TableHead>
                        <TableHead className="text-right">Sessions</TableHead>
                        <TableHead className="text-right">Avg Hours</TableHead>
                        <TableHead className="text-right">Tools</TableHead>
                        <TableHead className="text-right">Idle Ratio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {zombieData.zombies.map((zombie, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{zombie.team_name}</p>
                              {zombie.user_email && (
                                <p className="text-xs text-muted-foreground">{zombie.user_email}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{zombie.session_count}</TableCell>
                          <TableCell className="text-right">{zombie.avg_session_hours.toFixed(1)}h</TableCell>
                          <TableCell className="text-right">{zombie.total_tools}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={zombie.idle_ratio && zombie.idle_ratio > 600 ? 'destructive' : 'secondary'}>
                              {zombie.idle_ratio ? `${Math.round(zombie.idle_ratio)}s/tool` : '∞'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Skull className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No zombies detected</p>
                    <p className="text-sm mt-1">All users are actively using their connections</p>
                  </div>
                )}

                {/* Recommendations */}
                {zombieData?.recommendations && zombieData.recommendations.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <p className="text-sm font-medium text-amber-600 mb-2">Recommendations:</p>
                    <ul className="text-xs text-amber-600 space-y-1">
                      {zombieData.recommendations.map((rec, idx) => (
                        <li key={idx}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Connections */}
          {activeConnections && activeConnections.connections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Active SSE Connections
                </CardTitle>
                <CardDescription>
                  Currently connected clients consuming instance hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team</TableHead>
                      <TableHead>Connected At</TableHead>
                      <TableHead className="text-right">Duration</TableHead>
                      <TableHead className="text-right">Tools Executed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeConnections.connections.map((conn) => (
                      <TableRow key={conn.id}>
                        <TableCell className="font-medium">{conn.team_name}</TableCell>
                        <TableCell>{new Date(conn.connected_at).toLocaleString()}</TableCell>
                        <TableCell className="text-right">{Math.round(conn.duration_minutes)} min</TableCell>
                        <TableCell className="text-right">{conn.tools_executed}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Per-User Cost Breakdown */}
          {(selectedTeamId || teamUserCosts) && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Per-User Cost Breakdown
                  </CardTitle>
                  <CardDescription>
                    Cost breakdown by individual users within the selected team
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTeamId(null);
                    setTeamUserCosts(null);
                  }}
                >
                  Clear
                </Button>
              </CardHeader>
              <CardContent>
                {loadingUserCosts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : teamUserCosts && (teamUserCosts.users.length > 0 || teamUserCosts.unattributed.request_count > 0) ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead className="text-right">Requests</TableHead>
                          <TableHead className="text-right">Compute (s)</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamUserCosts.users.map((user) => (
                          <TableRow key={user.user_id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{user.user_name || user.user_email || 'Unknown'}</p>
                                {user.user_email && user.user_name && (
                                  <p className="text-xs text-muted-foreground">{user.user_email}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{user.request_count.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono">{user.total_seconds.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-mono">{formatCost(user.estimated_cost)}</TableCell>
                            <TableCell>
                              <Badge variant={user.status === 'healthy' ? 'default' : 'destructive'}>
                                {user.status === 'at_risk' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                {user.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Unattributed row */}
                        {teamUserCosts.unattributed.request_count > 0 && (
                          <TableRow className="bg-muted/30">
                            <TableCell>
                              <div>
                                <p className="font-medium text-muted-foreground">Unattributed</p>
                                <p className="text-xs text-muted-foreground">API calls without X-User-ID header</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{teamUserCosts.unattributed.request_count.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono">--</TableCell>
                            <TableCell className="text-right font-mono">{formatCost(teamUserCosts.unattributed.estimated_cost)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">N/A</Badge>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    <p className="text-xs text-muted-foreground mt-4">
                      Note: Requires clients to send X-User-ID header with requests for per-user tracking.
                      Unattributed requests are API calls made without user identification.
                    </p>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No per-user cost data available</p>
                    <p className="text-sm mt-1">
                      Click on a team in the Cost Leaderboard to view per-user breakdown.
                      Requires X-User-ID header in API requests.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Cost Target Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium">LTD Cost Target: &lt; $0.09 / user / month</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Teams marked "at_risk" exceed this threshold and may not be profitable under the Lifetime Deal model.
                    Zombie users drain Cloud Run instance hours without generating value.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Users by Region</CardTitle>
              <CardDescription>Geographic distribution of users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionData.map((item) => (
                  <div key={item.region} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium">{item.region}</div>
                    <div className="flex-1">
                      <Progress value={item.percentage} />
                    </div>
                    <div className="w-24 text-right">
                      <span className="font-medium">{item.users.toLocaleString()}</span>
                      <span className="text-muted-foreground text-sm ml-1">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
