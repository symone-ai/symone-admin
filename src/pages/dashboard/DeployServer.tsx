import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/categories';
import {
  Search,
  Database,
  MessageSquare,
  Cloud,
  FileText,
  Mail,
  Globe,
  Brain,
  Github,
  Zap,
  Star,
  CheckCircle2,
  Clock,
  Shield,
  CreditCard,
  Calendar,
  BarChart3,
  Code,
  Image,
  Video,
  Lock,
  Server,
  Smartphone,
  ShoppingCart,
  Users,
  Briefcase,
  Headphones,
  X,
  ChevronRight,
  Check,
  Cpu,
  Play,
  Pause,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ServerType = 'official' | 'partner' | 'community';
type ExecutionMode = 'traditional' | 'code-execution' | 'dual-mode';

interface DeployableServer {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string; // Now stores emoji icon from DB
  publisher: string;
  serverType: ServerType;
  executionMode: ExecutionMode;
  verified: boolean;
  healthScore: number;
  installs: number;
  coldStart: string;
  toolCount: number;
  tags: string[];
  featured?: boolean;
}

// Map categories from shared config
const categories = [
  { id: 'all', label: 'All Servers', icon: Server },
  ...CATEGORIES.map(c => ({ id: c.id, label: c.label, icon: c.icon }))
];

const regions = [
  { id: 'us-east-1', label: 'US East (N. Virginia)', flag: '🇺🇸' },
  { id: 'us-west-2', label: 'US West (Oregon)', flag: '🇺🇸' },
  { id: 'eu-west-1', label: 'EU (Ireland)', flag: '🇪🇺' },
  { id: 'ap-south-1', label: 'Asia Pacific (Mumbai)', flag: '🇮🇳' },
  { id: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)', flag: '🇯🇵' },
];

const DeployServer = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'select' | 'configure' | 'review'>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [serverTypeFilter, setServerTypeFilter] = useState<ServerType | 'all'>('all');
  const [executionModeFilter, setExecutionModeFilter] = useState<ExecutionMode | 'all'>('all');
  const [selectedServer, setSelectedServer] = useState<DeployableServer | null>(null);
  const [serverName, setServerName] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [selectedExecutionMode, setSelectedExecutionMode] = useState<ExecutionMode>('traditional');
  const [deploying, setDeploying] = useState(false);
  const [planLimits, setPlanLimits] = useState<{
    server_limit: number;
    current_servers: number;
    quota_limit: number;
    current_usage: number;
  } | null>(null);

  // Data from API
  const [deployableServers, setDeployableServers] = useState<DeployableServer[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch plan limits for quota enforcement
  useEffect(() => {
    api.user.getPlanLimits().then(setPlanLimits).catch(() => null);
  }, []);

  // Fetch deployable servers from marketplace API
  useEffect(() => {
    const fetchServers = async () => {
      setLoading(true);
      try {
        const response = await api.public.marketplace.list({});
        if (response.success && response.mcps) {
          const mapped: DeployableServer[] = response.mcps
            .filter((m: any) => m.status === 'active') // Only active servers
            .map((m: any) => ({
              id: m.id,
              name: m.name,
              slug: m.slug,
              description: m.description || '',
              category: m.category,
              icon: m.icon || '🔌',
              publisher: m.provider === 'official' ? 'Symone' :
                m.provider === 'partner' ? 'Official Partner' : 'Community',
              serverType: (m.provider as ServerType) || 'community',
              executionMode: 'dual-mode' as ExecutionMode, // Default, could be in DB
              verified: m.verified || false,
              healthScore: m.health_score || 95, // Default 95 if not set
              installs: m.installs || 0,
              coldStart: m.cold_start_ms ? `~${m.cold_start_ms}ms` : '~500ms',
              toolCount: m.tool_count || 0,
              tags: [],
              featured: m.is_featured,
            }));
          setDeployableServers(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch deployable servers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServers();
  }, []);

  const filteredServers = useMemo(() => {
    return deployableServers.filter(server => {
      const matchesSearch = !searchQuery ||
        server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || server.category === categoryFilter;
      const matchesServerType = serverTypeFilter === 'all' || server.serverType === serverTypeFilter;
      const matchesExecutionMode = executionModeFilter === 'all' || server.executionMode === executionModeFilter;

      return matchesSearch && matchesCategory && matchesServerType && matchesExecutionMode;
    });
  }, [deployableServers, searchQuery, categoryFilter, serverTypeFilter, executionModeFilter]);

  const handleServerSelect = (server: DeployableServer) => {
    setSelectedServer(server);
    setServerName(server.name.toLowerCase().replace(/\s+/g, '-'));
    setSelectedExecutionMode(server.executionMode === 'dual-mode' ? 'traditional' : server.executionMode);
    setStep('configure');
  };

  const handleDeploy = async () => {
    if (!selectedServer || deploying) return;

    setDeploying(true);
    try {
      await api.user.deployServer({
        name: serverName,
        type: selectedServer.category,
        config: {
          region,
          executionMode: selectedServer.executionMode === 'dual-mode' ? selectedExecutionMode : selectedServer.executionMode,
          providerType: selectedServer.serverType,
          slug: selectedServer.slug,
        },
      });

      navigate('/dashboard/servers');
    } catch (error) {
      console.error('Failed to deploy server:', error);
      alert('Failed to deploy server. Please try again.');
    } finally {
      setDeploying(false);
    }
  };

  const getExecutionModeInfo = (mode: ExecutionMode) => {
    switch (mode) {
      case 'traditional':
        return {
          label: 'Traditional',
          description: 'Exposes tools via stdio/SSE. Best for simple integrations with predictable tool sets.',
          icon: Server,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/50',
        };
      case 'code-execution':
        return {
          label: 'Code Execution',
          description: 'Generates and executes code on-the-fly. More flexible but requires sandbox environment.',
          icon: Code,
          color: 'text-accent',
          bgColor: 'bg-accent/10',
        };
      case 'dual-mode':
        return {
          label: 'Dual Mode',
          description: 'Supports both traditional tools and code execution. Choose the mode at deploy time.',
          icon: Cpu,
          color: 'text-primary',
          bgColor: 'bg-primary/10',
        };
    }
  };

  const getServerTypeBadge = (type: ServerType) => {
    switch (type) {
      case 'official':
        return { label: 'Official', className: 'bg-primary/10 text-primary border-primary/20' };
      case 'partner':
        return { label: 'Partner', className: 'bg-accent/10 text-accent border-accent/20' };
      case 'community':
        return { label: 'Community', className: 'bg-muted text-muted-foreground border-border' };
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="shrink-0 mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/servers')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Deploy New Server</h1>
            <p className="text-muted-foreground">
              Choose and configure an MCP server to deploy
            </p>
            {/* Quota Warning Banner */}
            {planLimits && planLimits.current_servers >= planLimits.server_limit && (
              <div className="mt-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                <Shield className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">
                  Server limit reached ({planLimits.current_servers}/{planLimits.server_limit}).{' '}
                  <a href="/dashboard/settings" className="underline font-medium">Upgrade your plan</a> to deploy more.
                </span>
              </div>
            )}
            {planLimits && planLimits.current_servers > 0 && planLimits.current_servers < planLimits.server_limit && (
              <p className="text-xs text-muted-foreground mt-1">
                {planLimits.current_servers}/{planLimits.server_limit} servers deployed
              </p>
            )}
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {(['select', 'configure', 'review'] as const).map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step === s ? 'bg-primary text-primary-foreground' :
                  (['select', 'configure', 'review'].indexOf(step) > i) ? 'bg-primary text-primary-foreground' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                  {(['select', 'configure', 'review'].indexOf(step) > i) ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < 2 && (
                  <div className={`w-12 h-0.5 mx-2 ${['select', 'configure', 'review'].indexOf(step) > i ? 'bg-primary' : 'bg-secondary'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Server */}
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Filters */}
            <div className="shrink-0 space-y-4 mb-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search servers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-4">
                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="w-4 h-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Server Type Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Provider:</span>
                  <div className="flex gap-1">
                    {(['all', 'official', 'partner'] as const).map(type => (
                      <Button
                        key={type}
                        variant={serverTypeFilter === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setServerTypeFilter(type)}
                      >
                        {type === 'all' ? 'All' : type === 'official' ? (
                          <><Shield className="w-3 h-3 mr-1" />Official</>
                        ) : (
                          <><CheckCircle2 className="w-3 h-3 mr-1" />Partner</>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Execution Mode Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Mode:</span>
                  <div className="flex gap-1">
                    {(['all', 'traditional', 'code-execution', 'dual-mode'] as const).map(mode => {
                      const info = mode !== 'all' ? getExecutionModeInfo(mode) : null;
                      return (
                        <Button
                          key={mode}
                          variant={executionModeFilter === mode ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setExecutionModeFilter(mode)}
                        >
                          {mode === 'all' ? 'All' : (
                            <>{info && <info.icon className="w-3 h-3 mr-1" />}{info?.label}</>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Server Grid */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 pb-6 pr-4">
                  {filteredServers.map((server, index) => {
                    const typeBadge = getServerTypeBadge(server.serverType);
                    const modeInfo = getExecutionModeInfo(server.executionMode);

                    return (
                      <motion.div
                        key={server.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.03, 0.3) }}
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:border-primary/50 hover:shadow-md ${selectedServer?.id === server.id ? 'border-primary ring-2 ring-primary/20' : ''
                            }`}
                          onClick={() => handleServerSelect(server)}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                                {server.icon}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeBadge.className}`}>
                                  {typeBadge.label}
                                </Badge>
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${modeInfo.bgColor} ${modeInfo.color} border-transparent`}>
                                  <modeInfo.icon className="w-2.5 h-2.5 mr-1" />
                                  {modeInfo.label}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">{server.name}</h3>
                              {server.verified && <CheckCircle2 className="w-4 h-4 text-primary" />}
                            </div>

                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {server.description}
                            </p>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                              <span className="flex items-center gap-1" title="Installs">
                                <Zap className="w-3 h-3" />
                                {server.installs.toLocaleString()} installs
                              </span>
                              <span className="flex items-center gap-1" title="Health score">
                                <Shield className="w-3 h-3" />
                                {server.healthScore}%
                              </span>
                            </div>

                            {server.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {server.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {!loading && filteredServers.length === 0 && (
                <div className="text-center py-12">
                  <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">No servers found</p>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or check back soon as we add more integrations.
                  </p>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}

        {/* Step 2: Configure */}
        {step === 'configure' && selectedServer && (
          <motion.div
            key="configure"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-auto"
          >
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Selected Server Preview */}
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                      {selectedServer.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{selectedServer.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedServer.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Server Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Server Name</label>
                <Input
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder="my-server"
                />
                <p className="text-xs text-muted-foreground mt-1">Lowercase letters, numbers, and hyphens only</p>
              </div>

              {/* Execution Mode (for dual-mode servers) */}
              {selectedServer.executionMode === 'dual-mode' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Execution Mode</label>
                  <p className="text-sm text-muted-foreground mb-3">
                    This server supports dual-mode. Choose how you want it to operate:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {(['traditional', 'code-execution'] as const).map((mode) => {
                      const info = getExecutionModeInfo(mode);
                      return (
                        <button
                          key={mode}
                          onClick={() => setSelectedExecutionMode(mode)}
                          className={`p-4 rounded-lg border text-left transition-all ${selectedExecutionMode === mode
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                            }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <info.icon className={`w-5 h-5 ${info.color}`} />
                            <span className="font-medium text-foreground">{info.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{info.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Region</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {regions.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRegion(r.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${region === r.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{r.flag}</span>
                        <div>
                          <p className="font-medium text-foreground text-sm">{r.id}</p>
                          <p className="text-xs text-muted-foreground">{r.label}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Estimate */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    Cost Control Info
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Server scales to zero when idle (no requests for 5 minutes)</p>
                    <p>• Cold start time: <span className="text-foreground font-medium">{selectedServer.coldStart}</span></p>
                    <p>• You only pay for active execution time</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep('select')}>Back</Button>
                <Button variant="hero" onClick={() => setStep('review')} className="flex-1">
                  Continue to Review
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review */}
        {step === 'review' && selectedServer && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-auto"
          >
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    Deployment Summary
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-border">
                      <dt className="text-muted-foreground">Server</dt>
                      <dd className="font-medium text-foreground flex items-center gap-2">
                        <span className="text-lg">{selectedServer.icon}</span>
                        {selectedServer.name}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <dt className="text-muted-foreground">Instance Name</dt>
                      <dd className="font-mono text-foreground">{serverName}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <dt className="text-muted-foreground">Execution Mode</dt>
                      <dd className="text-foreground">
                        {selectedServer.executionMode === 'dual-mode'
                          ? getExecutionModeInfo(selectedExecutionMode).label
                          : getExecutionModeInfo(selectedServer.executionMode).label}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <dt className="text-muted-foreground">Region</dt>
                      <dd className="text-foreground">{regions.find(r => r.id === region)?.label}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <dt className="text-muted-foreground">Installs</dt>
                      <dd className="text-foreground">{selectedServer.installs.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">Cold Start</dt>
                      <dd className="text-foreground">{selectedServer.coldStart}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card className="bg-accent/5 border-accent/20">
                <CardContent className="p-4">
                  <p className="text-sm text-accent font-medium mb-1">Note</p>
                  <p className="text-sm text-muted-foreground">
                    You'll need to configure secrets after deployment. The server will begin deploying immediately.
                  </p>
                </CardContent>
              </Card>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep('configure')}>Back</Button>
                <Button
                  variant="hero"
                  onClick={handleDeploy}
                  disabled={deploying || (planLimits !== null && planLimits.current_servers >= planLimits.server_limit)}
                  className="flex-1"
                >
                  {deploying ? (
                    <>Deploying...</>
                  ) : (
                    <>
                      Deploy Server
                      <Zap className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeployServer;
