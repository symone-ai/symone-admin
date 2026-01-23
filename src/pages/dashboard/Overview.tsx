import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Server,
  Activity,
  Shield,
  Database,
  MessageSquare,
  Github,
  Cloud,
  MoreVertical,
  Play,
  Pause,
  ExternalLink,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  Zap,
  Slack,
  FileText,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import LiveActivityFeed from '@/components/LiveActivityFeed';
import { api, UserServer } from '@/lib/api';

// Icon mapping for server types
const iconMap: Record<string, React.ElementType> = {
  slack: Slack,
  n8n: Zap,
  supabase: Database,
  github: Github,
  postgres: Database,
  notion: FileText,
  email: Mail,
  default: Server,
};

const Overview = () => {
  const [servers, setServers] = useState<UserServer[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [planLimits, setPlanLimits] = useState<{
    quota_limit: number;
    server_limit: number;
    storage_limit: number;
    current_usage: number;
    current_servers: number;
    plan: string;
    plan_name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [serversData, metricsData, healthData, limitsData] = await Promise.all([
          api.user.getServers(),
          api.user.getMetrics(),
          api.user.getHealth(),
          api.user.getPlanLimits().catch(() => null),
        ]);
        setServers(serversData);
        setMetrics(metricsData);
        setHealth(healthData);
        setPlanLimits(limitsData);
      } catch (err) {
        console.error('Failed to load overview data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const runningServers = servers.filter(s => s.status === 'running').length;
  const totalServers = servers.length;

  const stats = [
    {
      label: 'Active Servers',
      value: runningServers.toString(),
      change: `/${totalServers}`,
      icon: Server,
      trend: 'up' as const,
    },
    {
      label: 'Total Requests',
      value: metrics?.total_requests?.toLocaleString() || '0',
      change: 'all time',
      icon: Activity,
      trend: 'up' as const,
    },
    {
      label: 'Success Rate',
      // Backend returns 0-100 range, not 0-1
      value: `${(metrics?.success_rate || 0).toFixed(1)}%`,
      change: (metrics?.success_rate || 0) > 95 ? 'healthy' : (metrics?.total_requests > 0 ? 'needs attention' : 'no data'),
      icon: Clock,
      trend: (metrics?.success_rate || 0) > 95 ? 'up' as const : 'down' as const,
    },
    {
      label: 'Health Score',
      value: health?.status === 'healthy' ? '100' : '0',
      // Backend returns database: 'healthy' not 'connected'
      change: health?.database === 'healthy' ? 'DB OK' : (health?.status === 'healthy' ? 'DB OK' : 'DB Error'),
      icon: Shield,
      trend: health?.status === 'healthy' ? 'up' as const : 'down' as const,
    },
  ];

  // Usage data based on real plan limits
  const usageData = {
    actions: {
      used: planLimits?.current_usage || metrics?.total_requests || 0,
      limit: planLimits?.quota_limit || 500
    },
    servers: {
      used: totalServers,
      limit: planLimits?.server_limit || 5
    },
    storage: {
      used: 0,
      limit: planLimits?.storage_limit || 1
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-5 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-success' : 'text-accent'
                }`}>
                <TrendingUp className={`w-3 h-3 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Usage & Servers Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Usage Card */}
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <Zap className="w-5 h-5 text-primary" />
              Usage This Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">API Requests</span>
                <motion.span
                  key={usageData.actions.used}
                  initial={{ scale: 1.2, color: 'hsl(var(--primary))' }}
                  animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
                  className="text-sm font-medium tabular-nums"
                >
                  {usageData.actions.used.toLocaleString()} / {usageData.actions.limit.toLocaleString()}
                </motion.span>
              </div>
              <Progress
                value={(usageData.actions.used / usageData.actions.limit) * 100}
                className={`h-2 transition-all duration-500 ${(usageData.actions.used / usageData.actions.limit) >= 0.95 ? '[&>div]:bg-destructive' :
                    (usageData.actions.used / usageData.actions.limit) >= 0.8 ? '[&>div]:bg-yellow-500' : ''
                  }`}
              />
              {(usageData.actions.used / usageData.actions.limit) >= 0.8 && (usageData.actions.used / usageData.actions.limit) < 1 && (
                <p className="text-xs text-yellow-600 mt-1">Approaching limit - consider upgrading</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Servers</span>
                <span className="text-sm font-medium text-foreground">
                  {usageData.servers.used} / {usageData.servers.limit}
                </span>
              </div>
              <Progress
                value={(usageData.servers.used / usageData.servers.limit) * 100}
                className={`h-2 ${(usageData.servers.used / usageData.servers.limit) >= 0.95 ? '[&>div]:bg-destructive' :
                    (usageData.servers.used / usageData.servers.limit) >= 0.8 ? '[&>div]:bg-yellow-500' : ''
                  }`}
              />
            </div>

            <Link to="/pricing" className="text-xs text-primary hover:underline">
              Upgrade for more →
            </Link>
          </CardContent>
        </Card>

        {/* Servers List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">MCP Servers</h2>
            <Link to="/dashboard/servers">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>

          <div className="space-y-3">
            {servers.length === 0 ? (
              <div className="p-6 rounded-xl bg-card border border-dashed border-border text-center">
                <Server className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No servers deployed yet</p>
                <Link to="/dashboard/marketplace">
                  <Button variant="hero" size="sm" className="mt-3">
                    <Plus className="w-4 h-4 mr-1" />
                    Deploy First Server
                  </Button>
                </Link>
              </div>
            ) : (
              servers.slice(0, 4).map((server, index) => {
                const ServerIcon = iconMap[server.type] || iconMap.default;
                return (
                  <motion.div
                    key={server.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                        <ServerIcon className="w-6 h-6 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{server.name}</h3>
                          {server.status === 'running' && (
                            <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                              Running
                            </span>
                          )}
                          {server.status === 'stopped' && (
                            <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                              Stopped
                            </span>
                          )}
                          {server.status === 'error' && (
                            <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Error
                            </span>
                          )}
                          {server.status === 'deploying' && (
                            <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium flex items-center gap-1">
                              <Zap className="w-3 h-3 animate-pulse" />
                              Deploying
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Type: {server.type}</span>
                          <span>Created: {new Date(server.created_at || '').toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {server.status === 'running' ? (
                          <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                            <Pause className="w-4 h-4 text-muted-foreground" />
                          </button>
                        ) : (
                          <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                            <Play className="w-4 h-4 text-muted-foreground" />
                          </button>
                        )}
                        <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Quick Actions */}
          <Link to="/dashboard/marketplace">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/30 transition-colors cursor-pointer group"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Deploy a new MCP server
                </p>
                <p className="text-xs text-muted-foreground">
                  Choose from 200+ pre-built integrations
                </p>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <LiveActivityFeed />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-5 rounded-xl bg-card border border-border"
          >
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security Status
            </h3>
            <div className="space-y-3">
              {[
                { label: 'MicroVM Isolation', status: 'active' },
                { label: 'OAuth 2.1 Tokens', status: 'active' },
                { label: 'Egress Control', status: 'active' },
                { label: 'Audit Logging', status: 'active' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
