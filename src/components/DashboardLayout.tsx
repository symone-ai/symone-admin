import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Zap,
  Plus,
  Settings,
  Search,
  ChevronDown,
  Server,
  Activity,
  Key,
  Users,
  BarChart3,
  Eye,
  Store,
  User,
  LogOut,
  CreditCard,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { NotificationsPopover } from '@/components/dashboard/NotificationsPopover';
import { UpgradeModal, useUpgradeModal } from '@/components/dashboard/UpgradeModal';
import { useUser } from '@/hooks/useSymoneData';
import { api } from '@/lib/api';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3, path: '/dashboard' },
  { id: 'servers', label: 'Servers', icon: Server, path: '/dashboard/servers' },
  { id: 'marketplace', label: 'Marketplace', icon: Store, path: '/dashboard/marketplace' },
  { id: 'activity', label: 'Activity', icon: Activity, path: '/dashboard/activity' },
  { id: 'replay', label: 'Session Replay', icon: Eye, path: '/dashboard/replay' },
  { id: 'secrets', label: 'Secrets', icon: Key, path: '/dashboard/secrets' },
  { id: 'team', label: 'Team', icon: Users, path: '/dashboard/team' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: user } = useUser();
  const { open: upgradeOpen, setOpen: setUpgradeOpen } = useUpgradeModal();

  const [limits, setLimits] = useState<{ quota_limit: number; current_usage: number } | null>(null);

  useEffect(() => {
    api.user.getPlanLimits().then(setLimits).catch(() => null);
  }, []);

  const actionStats = { actionsThisPeriod: limits?.current_usage || 0, actionLimit: limits?.quota_limit || 500 };
  const actionPercentage = (actionStats.actionsThisPeriod / actionStats.actionLimit) * 100;

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleSignOut = () => {
    // Handle sign out - would integrate with auth
    navigate('/');
  };

  return (
    <>
      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
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
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.path)
                  ? 'bg-sidebar-accent text-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Usage Summary - Real-time */}
          <div className="px-4 pb-2">
            <div className="p-3 rounded-lg bg-sidebar-accent/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Actions Used
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {actionStats.actionsThisPeriod.toLocaleString()} / {actionStats.actionLimit.toLocaleString()}
                </span>
              </div>
              <Progress value={actionPercentage} className="h-1.5 transition-all duration-500" />
              {actionPercentage > 80 && (
                <p className="text-xs text-accent mt-2">
                  Approaching limit. <Link to="/pricing" className="text-primary hover:underline">Upgrade</Link>
                </p>
              )}
            </div>
          </div>

          {/* User Dropdown */}
          <div className="p-4 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/50 cursor-pointer transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">{user?.avatar || 'JD'}</span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">Team Plan</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user ? `${user.firstName} ${user.lastName}` : 'User'}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user?.email || 'user@example.com'}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings" className="flex items-center cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings" className="flex items-center cursor-pointer">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/docs" className="flex items-center cursor-pointer">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help & Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <NotificationsPopover />
              <Button variant="hero" size="sm" asChild>
                <Link to="/dashboard/servers/deploy">
                  <Plus className="w-4 h-4 mr-1" />
                  Deploy Server
                </Link>
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
