import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Zap,
  Plus,
  Settings,
  Search,
  Bell,
  ChevronDown,
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
  BarChart3,
  Key,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LiveActivityFeed from '@/components/LiveActivityFeed';

interface MCPServer {
  id: string;
  name: string;
  icon: React.ElementType;
  status: 'running' | 'stopped' | 'error';
  uptime: string;
  requests: string;
  latency: string;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const servers: MCPServer[] = [
    { id: '1', name: 'postgres-prod', icon: Database, status: 'running', uptime: '99.99%', requests: '12.4K', latency: '8ms' },
    { id: '2', name: 'slack-integration', icon: MessageSquare, status: 'running', uptime: '99.95%', requests: '3.2K', latency: '42ms' },
    { id: '3', name: 'github-repos', icon: Github, status: 'running', uptime: '100%', requests: '847', latency: '156ms' },
    { id: '4', name: 'gcp-storage', icon: Cloud, status: 'stopped', uptime: '-', requests: '-', latency: '-' },
  ];

  const stats = [
    { label: 'Active Servers', value: '3', change: '+1', icon: Server, trend: 'up' },
    { label: 'Total Requests', value: '16.4K', change: '+23%', icon: Activity, trend: 'up' },
    { label: 'Avg Latency', value: '42ms', change: '-12%', icon: Clock, trend: 'down' },
    { label: 'Health Score', value: '98', change: '+2', icon: Shield, trend: 'up' },
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'servers', label: 'Servers', icon: Server },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'secrets', label: 'Secrets', icon: Key },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-sidebar flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">
              Symone<span className="text-primary">MCP</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-sidebar-accent text-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/50 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">Team Plan</p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-glass flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search servers, tools..."
                className="pl-10 pr-4 py-2 w-80 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
            </button>
            <Button variant="hero" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Deploy Server
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
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
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    stat.trend === 'up' ? 'text-success' : 'text-accent'
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

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Servers List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">MCP Servers</h2>
                <Button variant="ghost" size="sm">View All</Button>
              </div>

              <div className="space-y-3">
                {servers.map((server, index) => (
                  <motion.div
                    key={server.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                        <server.icon className="w-6 h-6 text-primary" />
                      </div>

                      {/* Info */}
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
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Uptime: {server.uptime}</span>
                          <span>Requests: {server.requests}</span>
                          <span>Latency: {server.latency}</span>
                        </div>
                      </div>

                      {/* Actions */}
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
                ))}
              </div>

              {/* Quick Actions */}
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
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Live Activity */}
              <LiveActivityFeed />

              {/* Health Check */}
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
      </main>
    </div>
  );
};

export default Dashboard;
