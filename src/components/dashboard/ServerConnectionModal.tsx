import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  Check,
  Download,
  ExternalLink,
  Terminal,
  FileCode,
  Key,
  Settings as SettingsIcon,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface ServerConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: string;
  serverName: string;
  serverType: string;
}

interface ConnectionInfo {
  server_id: string;
  server_name: string;
  server_type: string;
  status: string;
  gateway_url: string;
  tools_endpoint: string;
  api_key_hint?: string;
  region: string;
  claude_desktop_config: {
    mcpServers: Record<string, any>;
  };
  curl_example: string;
  documentation_url: string;
  next_steps: string[];
}

export const ServerConnectionModal = ({
  open,
  onOpenChange,
  serverId,
  serverName,
  serverType,
}: ServerConnectionModalProps) => {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (open && serverId) {
      loadConnectionInfo();
    }
  }, [open, serverId]);

  const loadConnectionInfo = async () => {
    setLoading(true);
    try {
      const response = await api.user.getServerConnectionInfo(serverId);
      setConnectionInfo(response.connection);
    } catch (error) {
      console.error('Failed to load connection info:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadConfig = () => {
    if (!connectionInfo) return;

    const configJson = JSON.stringify(connectionInfo.claude_desktop_config, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${serverName}-claude-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!connectionInfo) {
    return null;
  }

  const configJson = JSON.stringify(connectionInfo.claude_desktop_config, null, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Server Deployed Successfully!</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {serverName} is ready to use
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Status Banner */}
          <div className="p-4 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <p className="font-medium text-foreground">
                Your {serverType} MCP server is active in {connectionInfo.region}
              </p>
            </div>
          </div>

          {/* Connection Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Connection Details
            </h3>

            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-secondary border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-muted-foreground">Gateway URL</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(connectionInfo.gateway_url, 'gateway_url')}
                    className="h-7"
                  >
                    {copiedField === 'gateway_url' ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <code className="text-xs font-mono text-foreground">{connectionInfo.gateway_url}</code>
              </div>

              <div className="p-3 rounded-lg bg-secondary border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-muted-foreground">Server ID</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(connectionInfo.server_id, 'server_id')}
                    className="h-7"
                  >
                    {copiedField === 'server_id' ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <code className="text-xs font-mono text-foreground">{connectionInfo.server_id}</code>
              </div>
            </div>
          </div>

          {/* API Key Notice */}
          <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-accent mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-foreground mb-1">API Key Required</p>
                <p className="text-sm text-muted-foreground mb-3">
                  You'll need an API key to authenticate requests. Generate one in{' '}
                  <a href="/dashboard/settings" className="text-accent hover:underline">
                    Settings → API Keys
                  </a>
                </p>
                {connectionInfo.api_key_hint && (
                  <code className="text-xs font-mono text-muted-foreground">
                    {connectionInfo.api_key_hint}
                  </code>
                )}
              </div>
            </div>
          </div>

          {/* Claude Desktop Config */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              Claude Desktop Configuration
            </h3>

            <div className="relative">
              <pre className="p-4 rounded-lg bg-secondary border border-border overflow-x-auto text-xs font-mono text-foreground">
                {configJson}
              </pre>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(configJson, 'config')}
                  className="h-8"
                >
                  {copiedField === 'config' ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadConfig} className="h-8">
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Add this to your{' '}
              <code className="px-1 py-0.5 rounded bg-secondary text-foreground">
                claude_desktop_config.json
              </code>{' '}
              file and restart Claude Desktop.
            </p>
          </div>

          {/* cURL Example */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              API Usage Example
            </h3>

            <div className="relative">
              <pre className="p-4 rounded-lg bg-secondary border border-border overflow-x-auto text-xs font-mono text-foreground whitespace-pre-wrap">
                {connectionInfo.curl_example}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(connectionInfo.curl_example, 'curl')}
                className="absolute top-2 right-2 h-8"
              >
                {copiedField === 'curl' ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <ChevronRight className="w-4 h-4" />
              Next Steps
            </h3>

            <div className="space-y-2">
              {connectionInfo.next_steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">{index + 1}</span>
                  </div>
                  <p className="text-sm text-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => window.open(connectionInfo.documentation_url, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Documentation
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                window.location.href = '/dashboard/secrets';
              }}
              className="flex-1"
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              Configure Secrets
            </Button>
            <Button variant="hero" onClick={() => onOpenChange(false)} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
