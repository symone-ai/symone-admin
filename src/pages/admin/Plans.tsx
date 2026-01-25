import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Users,
  Server,
  Zap,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { api, type Plan } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Extended Plan interface for UI calculations
interface PlanWithMetrics extends Plan {
  subscribers?: number;
  mrr?: number;
}

export default function AdminPlans() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<PlanWithMetrics[]>([]);
  const [editingPlan, setEditingPlan] = useState<PlanWithMetrics | null>(null);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<{id: string, name: string} | null>(null);
  const [newPlan, setNewPlan] = useState({
    name: '',
    slug: '',
    description: '',
    price_monthly: 0,
    price_yearly: 0,
    quota_limit: 500,
    features: [] as string[],
    is_active: true,
    is_featured: false
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await api.plans.list();
      setPlans(response.plans);
    } catch (error: any) {
      toast({
        title: 'Error loading plans',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async () => {
    if (!newPlan.name || !newPlan.slug) {
      toast({
        title: 'Validation error',
        description: 'Name and slug are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      await api.plans.create(newPlan);
      toast({
        title: 'Plan created',
        description: `${newPlan.name} has been created successfully`
      });
      setCreatingPlan(false);
      setNewPlan({
        name: '',
        slug: '',
        description: '',
        price_monthly: 0,
        price_yearly: 0,
        quota_limit: 500,
        features: [],
        is_active: true,
        is_featured: false
      });
      loadPlans();
    } catch (error: any) {
      toast({
        title: 'Error creating plan',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const updatePlan = async () => {
    if (!editingPlan) return;

    try {
      await api.plans.update(editingPlan.id, {
        name: editingPlan.name,
        description: editingPlan.description,
        price_monthly: editingPlan.price_monthly,
        price_yearly: editingPlan.price_yearly,
        quota_limit: editingPlan.quota_limit,
        features: editingPlan.features,
        is_active: editingPlan.is_active,
        is_featured: editingPlan.is_featured
      });
      toast({
        title: 'Plan updated',
        description: `${editingPlan.name} has been updated successfully`
      });
      setEditingPlan(null);
      loadPlans();
    } catch (error: any) {
      toast({
        title: 'Error updating plan',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const deletePlan = (planId: string, planName: string) => {
    setDeletingPlan({id: planId, name: planName});
  };

  const confirmDeletePlan = async () => {
    if (!deletingPlan) return;

    try {
      await api.plans.delete(deletingPlan.id);
      toast({
        title: 'Plan deleted',
        description: `${deletingPlan.name} has been deleted`
      });
      setDeletingPlan(null);
      loadPlans();
    } catch (error: any) {
      toast({
        title: 'Error deleting plan',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const totalMRR = plans.reduce((sum, plan) => sum + (plan.mrr || 0), 0);
  const totalSubscribers = plans.reduce((sum, plan) => sum + (plan.subscribers || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total MRR</p>
                <p className="text-2xl font-bold">${totalMRR.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
                <p className="text-2xl font-bold">{totalSubscribers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Plans</p>
                <p className="text-2xl font-bold">{plans.filter(p => p.is_active).length}</p>
              </div>
              <Zap className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Revenue/User</p>
                <p className="text-2xl font-bold">${totalSubscribers > 0 ? (totalMRR / totalSubscribers).toFixed(2) : '0.00'}</p>
              </div>
              <Server className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>Manage pricing plans and features</CardDescription>
          </div>
          <Button onClick={() => setCreatingPlan(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${!plan.is_active ? 'opacity-60' : ''}`}>
                {!plan.is_active && (
                  <Badge className="absolute -top-2 -right-2 bg-muted text-muted-foreground">
                    Inactive
                  </Badge>
                )}
                {plan.is_featured && (
                  <Badge className="absolute -top-2 -right-2 bg-primary">
                    Featured
                  </Badge>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingPlan(plan)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePlan(plan.id, plan.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${(plan.price_monthly / 100).toFixed(0)}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{plan.description || 'No description'}</p>

                  <div className="space-y-2">
                    {plan.features.slice(0, 4).map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 4 && (
                      <p className="text-xs text-muted-foreground">+{plan.features.length - 4} more</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quota</span>
                      <span className="font-medium">{plan.quota_limit.toLocaleString()} calls/mo</span>
                    </div>
                    {plan.price_yearly > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Yearly</span>
                        <span className="font-medium">${(plan.price_yearly / 100).toFixed(0)}/yr</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Plan Dialog */}
      <Dialog open={creatingPlan} onOpenChange={setCreatingPlan}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
            <DialogDescription>Add a new subscription plan to the platform</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan Name *</Label>
                <Input
                  placeholder="Pro"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  placeholder="pro"
                  value={newPlan.slug}
                  onChange={(e) => setNewPlan({ ...newPlan, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="For professional teams and businesses"
                value={newPlan.description}
                onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Monthly Price (cents)</Label>
                <Input
                  type="number"
                  placeholder="9900"
                  value={newPlan.price_monthly}
                  onChange={(e) => setNewPlan({ ...newPlan, price_monthly: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Yearly Price (cents)</Label>
                <Input
                  type="number"
                  placeholder="99000"
                  value={newPlan.price_yearly}
                  onChange={(e) => setNewPlan({ ...newPlan, price_yearly: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Quota Limit</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={newPlan.quota_limit}
                  onChange={(e) => setNewPlan({ ...newPlan, quota_limit: parseInt(e.target.value) || 500 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Features (comma-separated)</Label>
              <Textarea
                placeholder="50,000 API calls/month, Unlimited servers, Priority support"
                onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value.split(',').map(f => f.trim()).filter(f => f) })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={newPlan.is_active}
                  onCheckedChange={(checked) => setNewPlan({ ...newPlan, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newPlan.is_featured}
                  onCheckedChange={(checked) => setNewPlan({ ...newPlan, is_featured: checked })}
                />
                <Label>Featured</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatingPlan(false)}>Cancel</Button>
            <Button onClick={createPlan} disabled={!newPlan.name || !newPlan.slug}>Create Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Plan: {editingPlan?.name}</DialogTitle>
            <DialogDescription>Update plan details, pricing, and limits</DialogDescription>
          </DialogHeader>
          {editingPlan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={editingPlan.slug} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingPlan.description || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Monthly Price (cents)</Label>
                  <Input
                    type="number"
                    value={editingPlan.price_monthly}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price_monthly: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">${(editingPlan.price_monthly / 100).toFixed(2)}/mo</p>
                </div>
                <div className="space-y-2">
                  <Label>Yearly Price (cents)</Label>
                  <Input
                    type="number"
                    value={editingPlan.price_yearly}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price_yearly: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">${(editingPlan.price_yearly / 100).toFixed(2)}/yr</p>
                </div>
                <div className="space-y-2">
                  <Label>Quota Limit</Label>
                  <Input
                    type="number"
                    value={editingPlan.quota_limit}
                    onChange={(e) => setEditingPlan({ ...editingPlan, quota_limit: parseInt(e.target.value) || 500 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Features (comma-separated)</Label>
                <Textarea
                  value={editingPlan.features.join(', ')}
                  onChange={(e) => setEditingPlan({ ...editingPlan, features: e.target.value.split(',').map(f => f.trim()).filter(f => f) })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingPlan.is_active}
                    onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, is_active: checked })}
                  />
                  <Label>Plan Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingPlan.is_featured}
                    onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, is_featured: checked })}
                  />
                  <Label>Featured</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlan(null)}>Cancel</Button>
            <Button onClick={updatePlan}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Plan Confirmation Dialog */}
      <AlertDialog open={!!deletingPlan} onOpenChange={() => setDeletingPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingPlan?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePlan} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
