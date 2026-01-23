import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

interface ActivityItem {
  id: string;
  created_at: string;
  server_id?: string;
  agent_name?: string;
  tool_name: string;
  status: 'success' | 'pending' | 'error';
  latency_ms?: number;
}

const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActivity = async () => {
    try {
      const data = await api.user.getActivity({ limit: 10 });
      setActivities(data.activities || []);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      console.error('Failed to load activity:', err);
      setError('Failed to connect');
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadActivity();

    // Poll every 10 seconds for new activity
    const interval = setInterval(loadActivity, 10000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success pulse-live' : 'bg-muted-foreground'}`} />
          <span className="font-mono text-sm text-foreground">Live Activity</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {isConnected ? 'Connected' : error || 'Connecting...'}
        </span>
      </div>

      <div className="p-2 max-h-[300px] overflow-hidden">
        {activities.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            {isConnected ? 'No activity yet — deploy a server and make API calls!' : 'Loading...'}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <span className="font-mono text-xs text-muted-foreground shrink-0">
                  [{formatTime(activity.created_at)}]
                </span>
                <span className="text-xs text-primary shrink-0">
                  {activity.agent_name || 'api'}
                </span>
                <span className="text-xs text-muted-foreground">→</span>
                <span className="font-mono text-xs text-accent shrink-0">
                  {activity.tool_name}
                </span>
                <span className="text-xs text-muted-foreground text-right shrink-0 ml-auto">
                  {activity.latency_ms ? `${activity.latency_ms}ms` : '-'}
                </span>
                <div className={`w-2 h-2 rounded-full shrink-0 ${activity.status === 'success' ? 'bg-success' :
                  activity.status === 'pending' ? 'bg-warning' : 'bg-destructive'
                  }`} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default LiveActivityFeed;
