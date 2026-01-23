import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  User,
  Server,
  CreditCard,
  Settings,
  Shield,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api, type ActivityLog } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<string, string> = {
  success: 'bg-green-500/10 text-green-500',
  error: 'bg-red-500/10 text-red-500',
  warning: 'bg-yellow-500/10 text-yellow-500',
  pending: 'bg-blue-500/10 text-blue-500',
};

const statusIcons: Record<string, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  pending: Info,
};

export default function AdminActivity() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await api.activity.list({ limit: 100 });
      setActivities(data);
    } catch (error: any) {
      toast({
        title: 'Error loading activities',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from real data
  const successCount = activities.filter(a => a.status === 'success').length;
  const errorCount = activities.filter(a => a.status === 'error').length;
  const totalCount = activities.length;

  const filteredActivity = activities.filter(log => {
    const matchesSearch = log.tool_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.agent_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{successCount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Successful Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{errorCount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Server className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{successCount > 0 ? Math.round((successCount / totalCount) * 100) : 0}%</p>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by tool or agent name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadActivities} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Real-time tool execution activity ({filteredActivity.length} events)</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredActivity.length === 0 ? (
            <div className="h-96 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activity logs yet</p>
                <p className="text-sm mt-2">Tool executions will appear here in real-time</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredActivity.map((log) => {
                  const StatusIcon = statusIcons[log.status] || Info;

                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className={`p-2 rounded-full ${statusColors[log.status] || statusColors.pending}`}>
                        <StatusIcon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{log.tool_name || 'Unknown Tool'}</p>
                          {log.agent_name && (
                            <Badge variant="outline" className="text-xs">
                              <Server className="h-3 w-3 mr-1" />
                              {log.agent_name}
                            </Badge>
                          )}
                        </div>
                        {log.server_id && (
                          <p className="text-sm text-muted-foreground mb-2">Server: {log.server_id}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatTimestamp(log.timestamp)}</span>
                          {log.latency_ms && <span>Latency: {log.latency_ms}ms</span>}
                        </div>
                      </div>

                      <Badge className={statusColors[log.status] || statusColors.pending}>
                        {log.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
