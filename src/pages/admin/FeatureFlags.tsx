import { useState, useEffect } from 'react';
import {
  Flag,
  Plus,
  Trash2,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api, type FeatureFlag } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function FeatureFlags() {
  const { toast } = useToast();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FeatureFlag | null>(null);
  const [creating, setCreating] = useState(false);

  // Create form state
  const [newFlagName, setNewFlagName] = useState('');
  const [newFlagDesc, setNewFlagDesc] = useState('');
  const [newFlagEnabled, setNewFlagEnabled] = useState(false);
  const [newFlagRollout, setNewFlagRollout] = useState(100);

  const loadFlags = async () => {
    try {
      const result = await api.featureFlags.list();
      setFlags(result);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleCreate = async () => {
    if (!newFlagName.trim()) return;
    setCreating(true);
    try {
      await api.featureFlags.create({
        flag_name: newFlagName.trim(),
        description: newFlagDesc.trim(),
        enabled: newFlagEnabled,
        rollout_percent: newFlagRollout,
      });
      toast({ title: 'Flag created', description: `"${newFlagName}" has been created` });
      setShowCreate(false);
      setNewFlagName('');
      setNewFlagDesc('');
      setNewFlagEnabled(false);
      setNewFlagRollout(100);
      loadFlags();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      await api.featureFlags.update(flag.id, { enabled: !flag.enabled });
      setFlags(prev => prev.map(f => f.id === flag.id ? { ...f, enabled: !f.enabled } : f));
      toast({
        title: flag.enabled ? 'Flag disabled' : 'Flag enabled',
        description: `"${flag.flag_name}" is now ${flag.enabled ? 'disabled' : 'enabled'}`,
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleRolloutChange = async (flag: FeatureFlag, percent: number) => {
    try {
      await api.featureFlags.update(flag.id, { rollout_percent: percent });
      setFlags(prev => prev.map(f => f.id === flag.id ? { ...f, rollout_percent: percent } : f));
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.featureFlags.delete(deleteTarget.id);
      toast({ title: 'Flag deleted', description: `"${deleteTarget.flag_name}" has been deleted` });
      setDeleteTarget(null);
      loadFlags();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const enabledCount = flags.filter(f => f.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground">Control feature rollouts and A/B testing</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Flag
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Flags</span>
            </div>
            <p className="text-2xl font-bold mt-1">{flags.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ToggleRight className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Enabled</span>
            </div>
            <p className="text-2xl font-bold mt-1">{enabledCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Disabled</span>
            </div>
            <p className="text-2xl font-bold mt-1">{flags.length - enabledCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Flags Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Flags</CardTitle>
          <CardDescription>Manage feature flags for the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : flags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No feature flags yet. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rollout %</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {flag.flag_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={flag.enabled}
                          onCheckedChange={() => handleToggle(flag)}
                        />
                        <Badge variant={flag.enabled ? 'default' : 'secondary'}>
                          {flag.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 w-32">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={flag.rollout_percent}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setFlags(prev => prev.map(f => f.id === flag.id ? { ...f, rollout_percent: val } : f));
                          }}
                          onMouseUp={(e) => handleRolloutChange(flag, parseInt((e.target as HTMLInputElement).value))}
                          onTouchEnd={(e) => handleRolloutChange(flag, parseInt((e.target as HTMLInputElement).value))}
                          className="w-20 accent-primary"
                        />
                        <span className="text-sm text-muted-foreground w-10">{flag.rollout_percent}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {flag.description || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {flag.created_at ? new Date(flag.created_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(flag)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Feature Flag</DialogTitle>
            <DialogDescription>
              Add a new feature flag to control feature rollouts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="flag-name">Flag Name</Label>
              <Input
                id="flag-name"
                placeholder="e.g. enable_new_dashboard"
                value={newFlagName}
                onChange={(e) => setNewFlagName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Use snake_case for consistency</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="flag-desc">Description</Label>
              <Input
                id="flag-desc"
                placeholder="What does this flag control?"
                value={newFlagDesc}
                onChange={(e) => setNewFlagDesc(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="flag-enabled">Enable immediately</Label>
              <Switch
                id="flag-enabled"
                checked={newFlagEnabled}
                onCheckedChange={setNewFlagEnabled}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Rollout Percentage</Label>
                <span className="text-sm text-muted-foreground">{newFlagRollout}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={newFlagRollout}
                onChange={(e) => setNewFlagRollout(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !newFlagName.trim()}>
              {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete feature flag?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the flag "{deleteTarget?.flag_name}".
              Any code checking this flag will fall back to its default behavior.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete Flag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
