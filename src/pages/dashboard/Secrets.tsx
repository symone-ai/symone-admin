import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Key,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  RefreshCw,
  Shield,
  Lock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Search,
  Server,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Secret {
  id: string;
  name: string;
  value: string;
  servers: string[];
  createdAt: string;
  lastUsed: string;
  expiresAt?: string;
  status: 'active' | 'expiring' | 'expired';
}

const Secrets = () => {
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  // Secrets will be loaded from API once user has deployed servers and configured secrets
  // For now, show empty state - users can add secrets after deploying servers
  const [secrets] = useState<Secret[]>([]);

  const toggleShow = (id: string) => {
    setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const maskValue = (value: string) => {
    return '•'.repeat(Math.min(value.length, 32));
  };

  const getStatusBadge = (status: Secret['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </span>
        );
      case 'expiring':
        return (
          <span className="px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Expiring Soon
          </span>
        );
      case 'expired':
        return (
          <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Expired
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Secrets</h1>
          <p className="text-muted-foreground">Securely manage API keys and credentials</p>
        </div>
        <Button variant="hero">
          <Plus className="w-4 h-4 mr-2" />
          Add Secret
        </Button>
      </div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">End-to-End Encryption</p>
              <p className="text-sm text-muted-foreground">All secrets are encrypted at rest using AES-256 and in transit using TLS 1.3</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Secrets', value: secrets.length, icon: Key, color: 'text-primary' },
          { label: 'Active', value: secrets.filter(s => s.status === 'active').length, icon: CheckCircle2, color: 'text-success' },
          { label: 'Expiring Soon', value: secrets.filter(s => s.status === 'expiring').length, icon: AlertTriangle, color: 'text-accent' },
          { label: 'Expired', value: secrets.filter(s => s.status === 'expired').length, icon: AlertTriangle, color: 'text-destructive' },
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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search secrets..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Secrets List */}
      <div className="space-y-3">
        {secrets.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">No secrets configured</p>
            <p className="text-muted-foreground mb-4">
              Deploy a server first, then add API keys and credentials here
            </p>
            <Button variant="hero">
              <Plus className="w-4 h-4 mr-2" />
              Add First Secret
            </Button>
          </div>
        ) : (
          secrets.map((secret, index) => (
            <motion.div
              key={secret.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-mono font-semibold text-foreground">{secret.name}</h3>
                        {getStatusBadge(secret.status)}
                      </div>

                      {/* Value */}
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm text-muted-foreground font-mono bg-secondary px-2 py-1 rounded max-w-md truncate">
                          {showValues[secret.id] ? secret.value : maskValue(secret.value)}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleShow(secret.id)}
                        >
                          {showValues[secret.id] ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(secret.id, secret.value)}
                        >
                          {copied === secret.id ? (
                            <CheckCircle2 className="w-3 h-3 text-success" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Server className="w-3 h-3" />
                          {secret.servers.join(', ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Created {secret.createdAt}
                        </span>
                        <span>Last used {secret.lastUsed}</span>
                        {secret.expiresAt && (
                          <span className={secret.status === 'expired' ? 'text-destructive' : secret.status === 'expiring' ? 'text-accent' : ''}>
                            Expires {secret.expiresAt}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Secrets;
