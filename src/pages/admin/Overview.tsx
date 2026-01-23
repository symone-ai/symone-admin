import { useEffect, useState } from 'react';
import {
  Users,
  Server,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function AdminOverview() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [usageTrends, setUsageTrends] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load overview data
      const overviewData = await api.analytics.getOverview();
      setOverview(overviewData);

      // Load usage trends
      const trendsData = await api.analytics.getUsageTrends(30);
      setUsageTrends(trendsData);

      // Load revenue
      const revenueData = await api.analytics.getRevenueAnalytics();
      setRevenue(revenueData);

    } catch (error: any) {
      console.error('Failed to load admin overview:', error);
      toast({
        title: 'Error loading data',
        description: error.message || 'Failed to load admin overview',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Teams',
      value: overview?.teams?.total?.toString() || '0',
      change: overview?.teams?.growth ? `${overview.teams.growth > 0 ? '+' : ''}${overview.teams.growth}%` : '',
      trend: (overview?.teams?.growth || 0) >= 0 ? 'up' : 'down',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      label: 'Active MCPs',
      value: overview?.servers?.active?.toString() || '0',
      change: overview?.servers?.growth ? `${overview.servers.growth > 0 ? '+' : ''}${overview.servers.growth}%` : '',
      trend: (overview?.servers?.growth || 0) >= 0 ? 'up' : 'down',
      icon: Server,
      color: 'text-green-500'
    },
    {
      label: 'Monthly Revenue',
      value: revenue?.total_mrr ? `$${(revenue.total_mrr / 100).toLocaleString()}` : '$0',
      change: revenue?.growth ? `${revenue.growth > 0 ? '+' : ''}${revenue.growth}%` : '',
      trend: (revenue?.growth || 0) >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'text-primary'
    },
    {
      label: 'API Calls (24h)',
      value: overview?.usage?.calls_24h?.toLocaleString() || '0',
      change: overview?.usage?.success_rate_24h ? `${Math.round(overview.usage.success_rate_24h)}% success` : '',
      trend: (overview?.usage?.success_rate_24h || 0) >= 95 ? 'up' : 'down',
      icon: Activity,
      color: 'text-orange-500'
    },
  ];

  // Transform usage trends for charts
  const chartData = usageTrends.slice(-7).map((trend) => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    calls: trend.total_calls,
    success: trend.successful_calls,
    errors: trend.failed_calls
  }));

  // Calculate plan distribution from revenue data
  const planDistribution = revenue?.by_plan ? Object.entries(revenue.by_plan).map(([plan, data]: [string, any]) => {
    const totalTeams = overview?.teams?.total || 1;
    return {
      plan: plan.charAt(0).toUpperCase() + plan.slice(1),
      users: data.count,
      percentage: Math.round((data.count / totalTeams) * 100)
    };
  }) : [];
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                {stat.change ? (
                  <>
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                      {stat.change}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground text-sm">No comparison data</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Calls Chart */}
        <Card>
          <CardHeader>
            <CardTitle>API Usage</CardTitle>
            <CardDescription>Tool execution calls (last 7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                      formatter={(value: number) => [value.toLocaleString(), 'API Calls']}
                    />
                    <Area
                      type="monotone"
                      dataKey="calls"
                      stroke="hsl(var(--primary))"
                      fill="url(#callsGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No usage data available yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Success Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Success vs Errors</CardTitle>
            <CardDescription>API call outcomes (last 7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
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
                    <Line
                      type="monotone"
                      dataKey="success"
                      stroke="hsl(142.1 76.2% 36.3%)"
                      strokeWidth={2}
                      name="Success"
                      dot={{ fill: 'hsl(142.1 76.2% 36.3%)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="errors"
                      stroke="hsl(0 84.2% 60.2%)"
                      strokeWidth={2}
                      name="Errors"
                      dot={{ fill: 'hsl(0 84.2% 60.2%)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No usage data available yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current platform metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">API Gateway Operational</p>
                  <p className="text-xs text-muted-foreground">All services running normally</p>
                </div>
                <Badge variant="default">Healthy</Badge>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                  <Server className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{overview?.servers?.active || 0} Active MCP Servers</p>
                  <p className="text-xs text-muted-foreground">{overview?.servers?.total || 0} total deployed</p>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                  <Users className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{overview?.teams?.active || 0} Active Teams</p>
                  <p className="text-xs text-muted-foreground">{overview?.teams?.total || 0} total teams</p>
                </div>
                <Badge variant="outline">Online</Badge>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{overview?.usage?.total_calls?.toLocaleString() || 0} Total API Calls</p>
                  <p className="text-xs text-muted-foreground">Success rate: {Math.round(overview?.usage?.success_rate_24h || 0)}%</p>
                </div>
                <Badge variant="secondary">Stats</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Teams by subscription tier</CardDescription>
          </CardHeader>
          <CardContent>
            {planDistribution.length > 0 ? (
              <div className="space-y-4">
                {planDistribution.map((plan) => (
                  <div key={plan.plan} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{plan.plan}</span>
                      <span className="text-muted-foreground">{plan.users} teams</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={plan.percentage} className="flex-1" />
                      <span className="text-xs text-muted-foreground w-10">{plan.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                No teams yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
