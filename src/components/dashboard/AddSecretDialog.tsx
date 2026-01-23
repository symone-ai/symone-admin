import { useState } from 'react';
import { Key, Plus, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateSecret, useServers } from '@/hooks/useSymoneData';

interface AddSecretDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddSecretDialog = ({ open, onOpenChange }: AddSecretDialogProps) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  const [showValue, setShowValue] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');

  const { data: servers = [] } = useServers();
  const createSecret = useCreateSecret();

  const handleSubmit = async () => {
    if (!name.trim() || !value.trim()) return;

    await createSecret.mutateAsync({
      name: name.toUpperCase().replace(/\s+/g, '_'),
      value,
      serverIds: selectedServers,
      expiresAt: expiresAt || undefined,
    });

    // Reset and close
    setName('');
    setValue('');
    setSelectedServers([]);
    setExpiresAt('');
    onOpenChange(false);
  };

  const toggleServer = (id: string) => {
    setSelectedServers(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Add New Secret
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Secret Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
              placeholder="API_KEY"
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Value</label>
            <div className="relative">
              <input
                type={showValue ? 'text' : 'password'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter secret value..."
                className="w-full px-3 py-2 pr-10 rounded-lg bg-secondary border border-border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowValue(!showValue)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Expires (optional)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Assign to Servers</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {servers.map((server) => (
                <button
                  key={server.id}
                  type="button"
                  onClick={() => toggleServer(server.id)}
                  className={`p-2 rounded-lg border text-left text-sm transition-colors ${
                    selectedServers.includes(server.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {server.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="hero" 
              onClick={handleSubmit}
              disabled={!name.trim() || !value.trim() || createSecret.isPending}
              className="flex-1"
            >
              {createSecret.isPending ? 'Creating...' : 'Create Secret'}
              <Plus className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
