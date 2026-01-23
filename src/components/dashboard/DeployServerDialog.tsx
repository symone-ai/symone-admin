import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  MessageSquare,
  Cloud,
  FileText,
  Mail,
  Globe,
  Brain,
  Github,
  Zap,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateServer } from '@/hooks/useSymoneData';
import type { MCPServer } from '@/lib/types';
import { ServerConnectionModal } from './ServerConnectionModal';

interface DeployServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const serverTemplates = [
  { type: 'database', name: 'PostgreSQL', icon: Database, description: 'SQL database connector' },
  { type: 'database', name: 'MongoDB', icon: Database, description: 'NoSQL document store' },
  { type: 'messaging', name: 'Slack', icon: MessageSquare, description: 'Slack workspace integration' },
  { type: 'messaging', name: 'Discord', icon: MessageSquare, description: 'Discord bot connector' },
  { type: 'storage', name: 'AWS S3', icon: Cloud, description: 'Cloud object storage' },
  { type: 'storage', name: 'Google Cloud Storage', icon: Cloud, description: 'GCP storage buckets' },
  { type: 'api', name: 'GitHub', icon: Github, description: 'Repository management' },
  { type: 'api', name: 'Notion', icon: FileText, description: 'Workspace & docs API' },
  { type: 'api', name: 'Stripe', icon: Zap, description: 'Payment processing' },
  { type: 'messaging', name: 'SendGrid', icon: Mail, description: 'Email delivery' },
  { type: 'api', name: 'Web Scraper', icon: Globe, description: 'Extract web data' },
  { type: 'ai', name: 'OpenAI', icon: Brain, description: 'GPT & embeddings' },
  { type: 'ai', name: 'Anthropic', icon: Brain, description: 'Claude AI assistant' },
] as const;

// Single region deployment - us-central1 (Iowa)
const DEFAULT_REGION = 'us-central1';

export const DeployServerDialog = ({ open, onOpenChange }: DeployServerDialogProps) => {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof serverTemplates[number] | null>(null);
  const [serverName, setServerName] = useState('');
  const [deployedServer, setDeployedServer] = useState<{ id: string; name: string; type: string } | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const createServer = useCreateServer();

  const handleDeploy = async () => {
    if (!selectedTemplate) return;

    const iconMap: Record<string, string> = {
      'PostgreSQL': 'Database',
      'MongoDB': 'Database',
      'Slack': 'MessageSquare',
      'Discord': 'MessageSquare',
      'AWS S3': 'Cloud',
      'Google Cloud Storage': 'Cloud',
      'GitHub': 'Github',
      'Notion': 'FileText',
      'Stripe': 'Zap',
      'SendGrid': 'Mail',
      'Web Scraper': 'Globe',
      'OpenAI': 'Brain',
      'Anthropic': 'Brain',
    };

    const finalServerName = serverName || selectedTemplate.name.toLowerCase().replace(/\s+/g, '-');

    const result = await createServer.mutateAsync({
      name: finalServerName,
      type: selectedTemplate.type as MCPServer['type'],
      iconName: iconMap[selectedTemplate.name] || 'Server',
      status: 'deploying',
      uptime: 0,
      requestCount: 0,
      avgLatency: 0,
      region: DEFAULT_REGION,
      version: 'v1.0.0',
      config: {},
      executionMode: 'dual-mode',
      providerType: 'official',
      coldStartTime: 600,
      toolCount: 10,
      supportsToolSearch: true,
      supportsPTC: true,
    });

    // Store deployed server info
    setDeployedServer({
      id: result.id,
      name: finalServerName,
      type: selectedTemplate.type,
    });

    // Reset and close deployment dialog
    setStep(1);
    setSelectedTemplate(null);
    setServerName('');
    onOpenChange(false);

    // Show connection info modal after a brief delay
    setTimeout(() => {
      setShowConnectionModal(true);
    }, 300);
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedTemplate(null);
    setServerName('');
    onOpenChange(false);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Deploy New MCP Server
          </DialogTitle>
        </DialogHeader>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 mx-2 ${step > s ? 'bg-primary' : 'bg-secondary'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground mb-4">Choose an integration type</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                {serverTemplates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setServerName(template.name.toLowerCase().replace(/\s+/g, '-'));
                      setStep(2);
                    }}
                    className={`p-4 rounded-lg border text-left transition-all hover:border-primary/50 hover:bg-secondary/50 ${
                      selectedTemplate?.name === template.name 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                  >
                    <template.icon className="w-8 h-8 text-primary mb-2" />
                    <p className="font-medium text-foreground">{template.name}</p>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Server Name</label>
                <input
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder="my-server"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground mt-1">Lowercase letters, numbers, and hyphens only</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button variant="hero" onClick={() => setStep(3)} className="flex-1">
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <h3 className="font-medium text-foreground mb-4">Deployment Summary</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium text-foreground">{selectedTemplate?.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Server Name</dt>
                    <dd className="font-mono text-foreground">{serverName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Region</dt>
                    <dd className="text-foreground">{DEFAULT_REGION} (US Central)</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Version</dt>
                    <dd className="text-foreground">v1.0.0 (latest)</dd>
                  </div>
                </dl>
              </div>

              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-sm">
                <p className="text-accent font-medium">Note</p>
                <p className="text-muted-foreground">You'll need to configure secrets after deployment.</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button 
                  variant="hero" 
                  onClick={handleDeploy}
                  disabled={createServer.isPending}
                  className="flex-1"
                >
                  {createServer.isPending ? 'Deploying...' : 'Deploy Server'}
                  <Zap className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>

    {/* Connection Info Modal - shown after successful deployment */}
    {deployedServer && (
      <ServerConnectionModal
        open={showConnectionModal}
        onOpenChange={setShowConnectionModal}
        serverId={deployedServer.id}
        serverName={deployedServer.name}
        serverType={deployedServer.type}
      />
    )}
  </>
  );
};
