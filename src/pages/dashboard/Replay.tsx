import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Eye,
  Clock,
  Server,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Filter,
  Download,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useActivity, useServers } from '@/hooks/useSymoneData';
import { formatDistanceToNow } from 'date-fns';

const Replay = () => {
  const { data: activity = [] } = useActivity();
  const { data: servers = [] } = useServers();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Group activity into sessions (by server within time windows)
  const sessions = activity.reduce((acc, event) => {
    const sessionKey = `${event.serverId}-${new Date(event.timestamp).toDateString()}`;
    if (!acc[sessionKey]) {
      acc[sessionKey] = {
        id: sessionKey,
        serverId: event.serverId,
        serverName: event.serverName,
        events: [],
        startTime: event.timestamp,
      };
    }
    acc[sessionKey].events.push(event);
    return acc;
  }, {} as Record<string, { id: string; serverId?: string; serverName?: string; events: typeof activity; startTime: string }>);

  const sessionList = Object.values(sessions).slice(0, 10);
  const activeSession = selectedSession ? sessions[selectedSession] : sessionList[0];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-destructive" />;
      default: return <Eye className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Session Replay</h1>
          <p className="text-muted-foreground">Step through agent interactions to understand exactly what happened</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">X-Ray Observability</p>
              <p className="text-sm text-muted-foreground">Every agent request and tool response is captured. Replay sessions step-by-step for debugging and compliance audits.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Sessions</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search sessions..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto">
            <div className="space-y-2">
              {sessionList.map((session) => (
                <button
                  key={session.id}
                  onClick={() => {
                    setSelectedSession(session.id);
                    setCurrentStep(0);
                  }}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    (selectedSession || sessionList[0]?.id) === session.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-secondary/50 hover:bg-secondary border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Server className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{session.serverName || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{session.events.length} events</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(session.startTime), { addSuffix: true })}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Replay Player */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Session Details</CardTitle>
                <CardDescription>{activeSession?.serverName || 'Select a session'}</CardDescription>
              </div>
              {activeSession && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={isPlaying ? 'default' : 'hero'}
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentStep(Math.min((activeSession?.events.length || 1) - 1, currentStep + 1))}
                    disabled={currentStep >= (activeSession?.events.length || 1) - 1}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {activeSession ? (
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Step {currentStep + 1} of {activeSession.events.length}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${((currentStep + 1) / activeSession.events.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Event Timeline */}
                <div className="relative space-y-3 max-h-96 overflow-y-auto">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  
                  {activeSession.events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ 
                        opacity: index <= currentStep ? 1 : 0.3,
                        x: 0,
                        scale: index === currentStep ? 1.02 : 1
                      }}
                      className={`relative pl-10 ${index === currentStep ? 'z-10' : ''}`}
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-2 w-4 h-4 rounded-full border-2 ${
                        index === currentStep ? 'border-primary bg-primary' : 'border-border bg-card'
                      } flex items-center justify-center`}>
                        {index < currentStep && <CheckCircle2 className="w-2 h-2 text-success" />}
                      </div>

                      <div className={`p-3 rounded-lg transition-all ${
                        index === currentStep 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'bg-secondary/30 border border-transparent'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(event.status)}
                            <span className="font-medium text-sm text-foreground capitalize">{event.type}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {event.duration ? `${event.duration}ms` : ''}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.message}</p>
                        {event.details && (
                          <pre className="mt-2 p-2 rounded bg-background text-xs text-muted-foreground overflow-x-auto">
                            {event.details}
                          </pre>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Select a session to view the replay
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Replay;
