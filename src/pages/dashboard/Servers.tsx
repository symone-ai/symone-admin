import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Server,
  Database,
  MessageSquare,
  Github,
  Cloud,
  Slack,
  FileText,
  Mail,
  Globe,
  MoreVertical,
  Play,
  Pause,
  ExternalLink,
  Settings,
  Trash2,
  RefreshCw,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, UserServer } from '@/lib/api';

const iconMap: Record<string, React.ElementType> = {
  slack: Slack,
  n8n: Zap,
  supabase: Database,
  github: Github,
  postgres: Database,
  notion: FileText,
  email: Mail,
  cloud: Cloud,
  default: Server,
};

const Servers = () => {
  const [filter, setFilter] = useState<'all' | 'running' | 'stopped' | 'error'>('all');
  const [servers, setServers] = useState<UserServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadServers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.user.getServers();
      setServers(data);
    } catch (err) {
      setError('Failed to load servers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServers();
  }, []);

  const handleDeleteServer = async (serverId: string) => {
    if (!confirm('Are you sure you want to delete this server?')) return;

    try {
      await api.user.deleteServer(serverId);
      setServers(servers.filter(s => s.id !== serverId));
    } catch (err) {
      alert('Failed to delete server');
      console.error(err);
    }
  };

  const filteredServers = servers.filter(server => {
    const matchesFilter = filter === 'all' || server.status === filter;
    const matchesSearch = !searchQuery ||
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: UserServer['status']) => {
    switch (status) {
      case 'running':
        return (
          <span className="px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Running
          </span>
        );
      case 'stopped':
        return (
          <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
            Stopped
          </span>
        );
      case 'error':
        return (
          <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Error
          </span>
        );
      case 'deploying':
        return (
          <span className="px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Deploying
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">MCP Servers</h1>
          <p className="text-muted-foreground">Manage and monitor your deployed servers</p>
        </div>
        <Link to="/dashboard/marketplace">
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Deploy New Server
          </Button>
        </Link>
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Servers', value: servers.length, icon: Server, color: 'text-primary' },
              { label: 'Running', value: servers.filter(s => s.status === 'running').length, icon: CheckCircle2, color: 'text-success' },
              { label: 'Stopped', value: servers.filter(s => s.status === 'stopped').length, icon: Pause, color: 'text-muted-foreground' },
              { label: 'Errors', value: servers.filter(s => s.status === 'error').length, icon: AlertCircle, color: 'text-destructive' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search servers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              {(['all', 'running', 'stopped', 'error'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Server List */}
          <div className="space-y-3">
            {filteredServers.length === 0 ? (
              <div className="text-center py-12">
                <Server className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">No servers found</p>
                <p className="text-muted-foreground mb-4">
                  {servers.length === 0
                    ? 'Deploy your first server to get started!'
                    : 'Try adjusting your search or filters'}
                </p>
                <Link to="/dashboard/marketplace">
                  <Button variant="hero">
                    <Plus className="w-4 h-4 mr-2" />
                    Deploy Server
                  </Button>
                </Link>
              </div>
            ) : (
              filteredServers.map((server, index) => {
                const ServerIcon = iconMap[server.type] || iconMap.default;
                return (
                  <motion.div
                    key={server.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:border-primary/30 transition-colors group">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                            <ServerIcon className="w-7 h-7 text-primary" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                            <div className="col-span-2">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground">{server.name}</h3>
                                {getStatusBadge(server.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {server.type} • Created {new Date(server.created_at || '').toLocaleDateString()}
                              </p>
                            </div>

                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground">
                                {server.status === 'running'
                                  ? (() => {
                                    const ms = Date.now() - new Date(server.created_at || Date.now()).getTime();
                                    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
                                    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                    return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
                                  })()
                                  : '-'}
                              </p>
                              <p className="text-xs text-muted-foreground">Uptime</p>
                            </div>

                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground">
                                {(server as any).request_count?.toLocaleString() || '0'}
                              </p>
                              <p className="text-xs text-muted-foreground">Requests</p>
                            </div>

                            <div className="text-right">
                              <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(server.updated_at || server.created_at || '').toLocaleTimeString()}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {server.status === 'running' ? (
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Pause className="w-4 h-4" />
                              </Button>
                            ) : server.status !== 'deploying' ? (
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Play className="w-4 h-4" />
                              </Button>
                            ) : null}
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={loadServers}>
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteServer(server.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Servers;
