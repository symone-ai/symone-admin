import { useState, useEffect } from 'react';
import {
  Save,
  AlertTriangle,
  Shield,
  Mail,
  Bell,
  Globe,
  Database,
  Key,
  RefreshCw,
  Sun,
  Moon,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { api } from '@/lib/api';

// Theme is managed via document.documentElement class toggle
interface SettingsState {
  general: {
    platform_name: string;
    support_email: string;
    platform_description: string;
    default_region: string;
    default_timezone: string;
  };
  features: {
    allow_registrations: boolean;
    maintenance_mode: boolean;
  };
  security: {
    require_email_verification: boolean;
    enforce_2fa_admins: boolean;
    session_timeout_hours: number;
    max_login_attempts: number;
  };
  email: {
    smtp_host: string;
    smtp_port: number;
    smtp_username: string;
    from_email: string;
    from_name: string;
  };
  theme: {
    default_mode: 'dark' | 'light';
  };
}

const DEFAULT_SETTINGS: SettingsState = {
  general: {
    platform_name: 'Symone',
    support_email: 'support@symone.dev',
    platform_description: 'The Heroku for MCP - Deploy and manage Model Context Protocol servers',
    default_region: 'us-central1',
    default_timezone: 'UTC'
  },
  features: {
    allow_registrations: true,
    maintenance_mode: false
  },
  security: {
    require_email_verification: true,
    enforce_2fa_admins: true,
    session_timeout_hours: 24,
    max_login_attempts: 5
  },
  email: {
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    from_email: 'noreply@symone.dev',
    from_name: 'Symone'
  },
  theme: {
    default_mode: 'dark'
  }
};

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [integrations, setIntegrations] = useState<Array<{ name: string; type: string; status: string; deployed_count: number }>>([]);
  const [dbMetrics, setDbMetrics] = useState<{ teams: number; servers: number; users: number; activity_logs: number } | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    loadIntegrations();
    loadDbMetrics();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.settings.getAll();

      // Merge with defaults for any missing keys
      const loaded: SettingsState = {
        general: response.settings.general?.value || DEFAULT_SETTINGS.general,
        features: response.settings.features?.value || DEFAULT_SETTINGS.features,
        security: response.settings.security?.value || DEFAULT_SETTINGS.security,
        email: response.settings.email?.value || DEFAULT_SETTINGS.email,
        theme: response.settings.theme?.value || DEFAULT_SETTINGS.theme
      };

      setSettings(loaded);
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      // Use defaults if API fails
      toast.error('Failed to load settings - using defaults');
    } finally {
      setLoading(false);
    }
  };

  const loadIntegrations = async () => {
    try {
      // Get MCP categories from marketplace to show available integrations
      const response = await api.marketplace.list();
      const mcps = response.mcps || [];

      // Group by category and count deployed
      const categoryMap: Record<string, { name: string; type: string; deployed_count: number }> = {};
      for (const mcp of mcps) {
        const cat = mcp.category || 'Other';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { name: cat, type: cat.toLowerCase(), deployed_count: 0 };
        }
      }

      // Get deployed servers to mark connected
      const teamsResponse = await api.teams.list({ limit: 100 });
      for (const team of teamsResponse.teams) {
        // Each team can have servers configured
        if (team.config?.servers) {
          for (const server of Object.keys(team.config.servers)) {
            if (categoryMap[server]) {
              categoryMap[server].deployed_count++;
            }
          }
        }
      }

      setIntegrations(Object.values(categoryMap).map(cat => ({
        ...cat,
        status: cat.deployed_count > 0 ? 'connected' : 'available'
      })));
    } catch (error: any) {
      console.error('Failed to load integrations:', error);
    }
  };

  const loadDbMetrics = async () => {
    try {
      const overview = await api.analytics.getOverview();
      setDbMetrics({
        teams: overview.teams?.total || 0,
        servers: overview.servers?.total || 0,
        users: overview.users?.total || 0,
        activity_logs: overview.usage?.calls_24h || 0
      });
    } catch (error: any) {
      console.error('Failed to load database metrics:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save all settings sections
      await api.settings.updateAll({
        general: settings.general,
        features: settings.features,
        security: settings.security,
        email: settings.email,
        theme: settings.theme
      });

      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeToggle = () => {
    const newMode = settings.theme.default_mode === 'dark' ? 'light' : 'dark';
    setSettings({
      ...settings,
      theme: { default_mode: newMode }
    });
    // Apply the theme immediately via DOM
    const html = document.documentElement;
    html.classList.remove('dark', 'light');
    html.classList.add(newMode);
    localStorage.setItem('theme', newMode);
  };

  const updateGeneral = (key: string, value: string) => {
    setSettings({
      ...settings,
      general: { ...settings.general, [key]: value }
    });
  };

  const updateFeatures = (key: string, value: boolean) => {
    setSettings({
      ...settings,
      features: { ...settings.features, [key]: value }
    });
  };

  const updateSecurity = (key: string, value: boolean | number) => {
    setSettings({
      ...settings,
      security: { ...settings.security, [key]: value }
    });
  };

  const updateEmail = (key: string, value: string | number) => {
    setSettings({
      ...settings,
      email: { ...settings.email, [key]: value }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Admin Settings</AlertTitle>
        <AlertDescription>
          Changes here affect all users. Please be careful when modifying these settings.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform Name</Label>
                  <Input
                    value={settings.general.platform_name}
                    onChange={(e) => updateGeneral('platform_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input
                    value={settings.general.support_email}
                    onChange={(e) => updateGeneral('support_email', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Platform Description</Label>
                <Textarea
                  value={settings.general.platform_description}
                  onChange={(e) => updateGeneral('platform_description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Region</Label>
                  <Select
                    value={settings.general.default_region}
                    onValueChange={(value) => updateGeneral('default_region', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-central1">US Central (Iowa)</SelectItem>
                      <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                      <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                      <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                      <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Timezone</Label>
                  <Select
                    value={settings.general.default_timezone}
                    onValueChange={(value) => updateGeneral('default_timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {settings.theme.default_mode === 'dark' ? (
                    <Moon className="h-5 w-5 text-primary" />
                  ) : (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">Theme Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Currently: {settings.theme.default_mode === 'dark' ? 'Dark mode' : 'Light mode'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.theme.default_mode === 'dark'}
                  onCheckedChange={handleThemeToggle}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Allow New Registrations</p>
                  <p className="text-sm text-muted-foreground">Enable public sign-ups</p>
                </div>
                <Switch
                  checked={settings.features.allow_registrations}
                  onCheckedChange={(checked) => updateFeatures('allow_registrations', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">Show maintenance page to all users</p>
                </div>
                <Switch
                  checked={settings.features.maintenance_mode}
                  onCheckedChange={(checked) => updateFeatures('maintenance_mode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Authentication and security configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Require Email Verification</p>
                  <p className="text-sm text-muted-foreground">Users must verify email before accessing</p>
                </div>
                <Switch
                  checked={settings.security.require_email_verification}
                  onCheckedChange={(checked) => updateSecurity('require_email_verification', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Enforce 2FA for Admins</p>
                  <p className="text-sm text-muted-foreground">Require two-factor auth for admin accounts</p>
                </div>
                <Switch
                  checked={settings.security.enforce_2fa_admins}
                  onCheckedChange={(checked) => updateSecurity('enforce_2fa_admins', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Password Requirements</p>
                  <p className="text-sm text-muted-foreground">Minimum 12 characters, mixed case, numbers, symbols</p>
                </div>
                <Badge>Strong</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Session Timeout (hours)</Label>
                  <Input
                    type="number"
                    value={settings.security.session_timeout_hours}
                    onChange={(e) => updateSecurity('session_timeout_hours', parseInt(e.target.value) || 24)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Login Attempts</Label>
                  <Input
                    type="number"
                    value={settings.security.max_login_attempts}
                    onChange={(e) => updateSecurity('max_login_attempts', parseInt(e.target.value) || 5)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Allowed IP Ranges (Admin Panel)</Label>
                <Textarea placeholder="One CIDR range per line, e.g., 10.0.0.0/8" />
                <p className="text-xs text-muted-foreground">Leave empty to allow all IPs</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>Platform-level API configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Public API Key</p>
                  <p className="text-sm text-muted-foreground font-mono">pk_live_****************************</p>
                </div>
                <Button variant="outline" size="sm">Regenerate</Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Admin API Key</p>
                  <p className="text-sm text-muted-foreground font-mono">sk_admin_****************************</p>
                </div>
                <Button variant="outline" size="sm">Regenerate</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>SMTP and email template settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input
                    value={settings.email.smtp_host}
                    onChange={(e) => updateEmail('smtp_host', e.target.value)}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input
                    type="number"
                    value={settings.email.smtp_port}
                    onChange={(e) => updateEmail('smtp_port', parseInt(e.target.value) || 587)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Username</Label>
                  <Input
                    value={settings.email.smtp_username}
                    onChange={(e) => updateEmail('smtp_username', e.target.value)}
                    placeholder="apikey"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Password</Label>
                  <Input type="password" placeholder="••••••••••••••••" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input
                    value={settings.email.from_email}
                    onChange={(e) => updateEmail('from_email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>From Name</Label>
                  <Input
                    value={settings.email.from_name}
                    onChange={(e) => updateEmail('from_name', e.target.value)}
                  />
                </div>
              </div>

              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Send Test Email
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Templates
              </CardTitle>
              <CardDescription>Customize email notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['Welcome Email', 'Password Reset', 'Plan Upgrade', 'Usage Warning', 'Invoice'].map((template) => (
                  <div key={template} className="flex items-center justify-between p-3 border rounded-lg">
                    <span>{template}</span>
                    <Button variant="outline" size="sm">Edit Template</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>MCP Integrations</CardTitle>
              <CardDescription>Available MCP categories and connection status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {integrations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Loading integrations...</p>
              ) : (
                integrations.map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {integration.deployed_count > 0
                          ? `${integration.deployed_count} deployed across teams`
                          : 'Available in marketplace'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={integration.status === 'connected' ? 'default' : 'secondary'}>
                        {integration.status === 'connected' ? 'Deployed' : 'Available'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View MCPs
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database & Storage
              </CardTitle>
              <CardDescription>Data management and backups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{dbMetrics?.teams ?? '-'}</p>
                    <p className="text-sm text-muted-foreground">Teams</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{dbMetrics?.users ?? '-'}</p>
                    <p className="text-sm text-muted-foreground">Users</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{dbMetrics?.servers ?? '-'}</p>
                    <p className="text-sm text-muted-foreground">Servers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{dbMetrics?.activity_logs?.toLocaleString() ?? '-'}</p>
                    <p className="text-sm text-muted-foreground">Logs (24h)</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Backup Now
                </Button>
                <Button variant="outline">Download Latest Backup</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                <div>
                  <p className="font-medium">Clear All Cache</p>
                  <p className="text-sm text-muted-foreground">Remove all cached data</p>
                </div>
                <Button variant="destructive" size="sm">Clear Cache</Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                <div>
                  <p className="font-medium">Reset Rate Limits</p>
                  <p className="text-sm text-muted-foreground">Clear all rate limit counters</p>
                </div>
                <Button variant="destructive" size="sm">Reset</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save All Changes
        </Button>
      </div>
    </div>
  );
}
