import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity as ActivityIcon,
  Server,
  Database,
  MessageSquare,
  Github,
  Cloud,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  Slack,
  FileText,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, UserActivityLog } from '@/lib/api';

// Icon mapping for server types
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

const Activity = () => {
  const [filter, setFilter] = useState<'all' | 'errors' | 'success'>('all');
  const [events, setEvents] = useState<UserActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const loadActivity = async () => {
    setLoading(true);
    try {
      const response = await api.user.getActivity({ limit: 50 });
      setEvents(response.activities || []);
      setTotal(response.total || 0);
    } catch (err) {
      console.error('Failed to load activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, []);

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'errors') return event.status === 'error';
    if (filter === 'success') return event.status === 'success';
    return true;
  });

  const getStatusIcon = (status: UserActivityLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'pending':
        return <ActivityIcon className="w-4 h-4 text-primary" />;
    }
  };

  const successCount = events.filter(e => e.status === 'success').length;
  const errorCount = events.filter(e => e.status === 'error').length;
  const successRate = events.length > 0 ? ((successCount / events.length) * 100).toFixed(1) : '0';

  const stats = [
    { label: 'Total Events', value: total.toLocaleString(), change: 'all time', color: 'text-primary' },
    { label: 'Success Rate', value: `${successRate}%`, change: successCount.toString(), color: 'text-success' },
    { label: 'Errors', value: errorCount.toString(), change: 'recent', color: 'text-destructive' },
  ];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
          <p className="text-muted-foreground">Real-time events across all servers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={loadActivity}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <span className={`text-xs font-medium ${stat.color}`}>{stat.change}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(['all', 'success', 'errors'] as const).map((status) => (
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

      {/* Activity Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ActivityIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No activity logs found</p>
              <p className="text-sm">Activity will appear here as you use MCP servers</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-4">
                {filteredEvents.map((event, index) => {
                  const EventIcon = iconMap[event.server_type] || iconMap.default;
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative flex items-start gap-4 pl-12"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-4 w-4 h-4 rounded-full bg-card border-2 border-border flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${event.status === 'success' ? 'bg-success' :
                            event.status === 'error' ? 'bg-destructive' : 'bg-primary'
                          }`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center">
                              <EventIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{event.server_type}</span>
                                {getStatusIcon(event.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">{event.tool_name}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {event.latency_ms && (
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                {event.latency_ms}ms
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(event.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredEvents.length > 0 && (
            <div className="mt-6 text-center">
              <Button variant="outline">Load More Events</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Activity;
