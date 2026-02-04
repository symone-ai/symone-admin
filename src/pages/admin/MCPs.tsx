import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  Download,
  Star,
  Loader2,
  Upload,
  FileArchive,
  Globe,
  FileText,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api, MarketplaceMCP } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { CATEGORIES } from '@/lib/categories';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-500',
  pending: 'bg-yellow-500/10 text-yellow-500',
  rejected: 'bg-red-500/10 text-red-500',
  deprecated: 'bg-muted text-muted-foreground',
  planned: 'bg-blue-500/10 text-blue-500',
};

const providerColors: Record<string, string> = {
  official: 'bg-primary/10 text-primary',
  partner: 'bg-blue-500/10 text-blue-500',
  community: 'bg-purple-500/10 text-purple-500',
};

const providerLabels: Record<string, string> = {
  official: 'Symone',
  partner: 'Official',
  community: 'Marketplace',
};

export default function AdminMCPs() {
  const [mcps, setMcps] = useState<MarketplaceMCP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [showAddMCP, setShowAddMCP] = useState(false);
  const [showUploadMCP, setShowUploadMCP] = useState(false);
  const [editingMCP, setEditingMCP] = useState<MarketplaceMCP | null>(null);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMetadata, setUploadMetadata] = useState({
    name: '',
    category: 'utilities',
    website_url: '',
    documentation_url: '',
  });

  // Form state for new/edit MCP
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'ai-ml',
    subcategory: '',
    description: '',
    provider: 'community' as 'official' | 'partner' | 'community',
    status: 'planned' as 'planned' | 'active' | 'pending' | 'rejected' | 'deprecated',
    version: '1.0.0',
    icon: '🔌',
    is_featured: false,
    verified: false,
    is_hosted_by_symone: false,
  });

  const selectedCategoryData = CATEGORIES.find(c => c.id === formData.category);

  useEffect(() => {
    loadMCPs();
    loadStats();
  }, []);

  const loadMCPs = async () => {
    try {
      setLoading(true);
      const response = await api.marketplace.list();
      setMcps(response.mcps);
    } catch (error: any) {
      toast({
        title: 'Error loading MCPs',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.marketplace.stats();
      setStats(response);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const filteredMCPs = mcps.filter(mcp => {
    const matchesSearch = mcp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mcp.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || mcp.status === statusFilter;
    const matchesProvider = providerFilter === 'all' || mcp.provider === providerFilter;
    return matchesSearch && matchesStatus && matchesProvider;
  });

  const handleCreateMCP = async () => {
    try {
      await api.marketplace.create(formData);
      toast({
        title: 'MCP created successfully',
        description: `${formData.name} has been added to the marketplace`,
      });
      setShowAddMCP(false);
      resetForm();
      loadMCPs();
      loadStats();
    } catch (error: any) {
      toast({
        title: 'Error creating MCP',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateMCP = async () => {
    if (!editingMCP) return;
    try {
      await api.marketplace.update(editingMCP.id, formData);
      toast({
        title: 'MCP updated successfully',
        description: `${formData.name} has been updated`,
      });
      setEditingMCP(null);
      resetForm();
      loadMCPs();
      loadStats();
    } catch (error: any) {
      toast({
        title: 'Error updating MCP',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMCP = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.marketplace.delete(id);
      toast({
        title: 'MCP deleted',
        description: `${name} has been removed from the marketplace`,
      });
      loadMCPs();
      loadStats();
    } catch (error: any) {
      toast({
        title: 'Error deleting MCP',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleApproveMCP = async (id: string, name: string) => {
    try {
      await api.marketplace.approve(id);
      toast({
        title: 'MCP approved',
        description: `${name} is now active`,
      });
      loadMCPs();
      loadStats();
    } catch (error: any) {
      toast({
        title: 'Error approving MCP',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRejectMCP = async (id: string, name: string) => {
    try {
      await api.marketplace.reject(id);
      toast({
        title: 'MCP rejected',
        description: `${name} has been rejected`,
      });
      loadMCPs();
      loadStats();
    } catch (error: any) {
      toast({
        title: 'Error rejecting MCP',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      category: 'ai-ml',
      subcategory: '',
      description: '',
      provider: 'community',
      status: 'planned',
      version: '1.0.0',
      icon: '🔌',
      is_featured: false,
      verified: false,
      is_hosted_by_symone: false,
    });
  };

  const openEditDialog = (mcp: MarketplaceMCP) => {
    setEditingMCP(mcp);
    setFormData({
      name: mcp.name,
      slug: mcp.slug,
      category: mcp.category,
      subcategory: mcp.subcategory || '',
      description: mcp.description || '',
      provider: mcp.provider,
      status: mcp.status,
      version: mcp.version,
      icon: mcp.icon,
      is_featured: mcp.is_featured,
      verified: mcp.verified,
      is_hosted_by_symone: mcp.is_hosted_by_symone,
    });
  };

  // Upload handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.zip')) {
      setUploadFile(file);
      // Auto-fill name from filename
      const name = file.name.replace('.zip', '').replace(/-/g, ' ').replace(/_/g, ' ');
      setUploadMetadata(prev => ({ ...prev, name: name.charAt(0).toUpperCase() + name.slice(1) }));
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a ZIP file',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      setUploadFile(file);
      // Auto-fill name from filename
      const name = file.name.replace('.zip', '').replace(/-/g, ' ').replace(/_/g, ' ');
      setUploadMetadata(prev => ({ ...prev, name: name.charAt(0).toUpperCase() + name.slice(1) }));
    }
  }, []);

  const resetUpload = () => {
    setUploadFile(null);
    setUploadMetadata({
      name: '',
      category: 'utilities',
      website_url: '',
      documentation_url: '',
    });
    setShowUploadMCP(false);
  };

  const handleUploadMCP = async () => {
    if (!uploadFile) return;

    setUploadLoading(true);
    try {
      const result = await api.marketplace.upload(uploadFile, {
        name: uploadMetadata.name || undefined,
        category: uploadMetadata.category,
        website_url: uploadMetadata.website_url || undefined,
        documentation_url: uploadMetadata.documentation_url || undefined,
      });

      toast({
        title: 'MCP uploaded successfully',
        description: `${result.listing.name} has been added. Found ${result.metadata.tools_count} tools and ${result.metadata.required_secrets.length} required secrets.`,
      });

      resetUpload();
      loadMCPs();
      loadStats();
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const pendingCount = mcps.filter(m => m.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total MCPs</p>
                <p className="text-2xl font-bold">{stats?.total || mcps.length}</p>
              </div>
              <Server className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats?.active || mcps.filter(m => m.status === 'active').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className={pendingCount > 0 ? 'border-yellow-500/50' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{stats?.pending || pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Installs</p>
                <p className="text-2xl font-bold">{stats?.total_installs || mcps.reduce((sum, m) => sum + m.install_count, 0).toLocaleString()}</p>
              </div>
              <Download className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search MCPs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="deprecated">Deprecated</SelectItem>
            </SelectContent>
          </Select>
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="official">Symone</SelectItem>
              <SelectItem value="partner">Official</SelectItem>
              <SelectItem value="community">Marketplace</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowUploadMCP(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload ZIP
          </Button>
          <Dialog open={showAddMCP} onOpenChange={setShowAddMCP}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add MCP
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New MCP Server</DialogTitle>
              <DialogDescription>Create a new MCP server integration</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="PostgreSQL Pro"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    placeholder="postgresql-pro"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what this MCP does..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => setFormData({ ...formData, category: val, subcategory: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subcategory</Label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={(val) => setFormData({ ...formData, subcategory: val })}
                    disabled={!formData.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategoryData?.subcategories.map(sub => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provider Type</Label>
                  <Select value={formData.provider} onValueChange={(val: any) => setFormData({ ...formData, provider: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="official">Symone</SelectItem>
                      <SelectItem value="partner">Official</SelectItem>
                      <SelectItem value="community">Marketplace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(val: any) => setFormData({ ...formData, status: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Version</Label>
                  <Input
                    placeholder="1.0.0"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon (emoji)</Label>
                  <Input
                    placeholder="🐘"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Featured on Marketplace</Label>
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Verified</Label>
                <Switch
                  checked={formData.verified}
                  onCheckedChange={(checked) => setFormData({ ...formData, verified: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Hosted by Symone</Label>
                <Switch
                  checked={formData.is_hosted_by_symone}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_hosted_by_symone: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddMCP(false)}>Cancel</Button>
              <Button onClick={handleCreateMCP}>Create MCP</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Upload MCP Dialog */}
      <Dialog open={showUploadMCP} onOpenChange={resetUpload}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileArchive className="h-5 w-5" />
              Upload MCP Server
            </DialogTitle>
            <DialogDescription>
              Upload a ZIP file containing an MCP server implementation (server.py required)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : uploadFile
                  ? 'border-green-500 bg-green-500/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              {uploadFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileArchive className="h-10 w-10 text-green-500" />
                  <div className="text-left">
                    <p className="font-medium">{uploadFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUploadFile(null)}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop a ZIP file here, or
                  </p>
                  <label className="cursor-pointer">
                    <span className="text-primary hover:underline">browse</span>
                    <input
                      type="file"
                      accept=".zip"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Metadata Override Fields */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Name (optional override)</Label>
                <Input
                  placeholder="Auto-detected from server.py"
                  value={uploadMetadata.name}
                  onChange={(e) => setUploadMetadata({ ...uploadMetadata, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={uploadMetadata.category}
                  onValueChange={(val) => setUploadMetadata({ ...uploadMetadata, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Website URL (for favicon)
                </Label>
                <Input
                  placeholder="https://example.com"
                  value={uploadMetadata.website_url}
                  onChange={(e) => setUploadMetadata({ ...uploadMetadata, website_url: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Documentation URL
                </Label>
                <Input
                  placeholder="https://docs.example.com"
                  value={uploadMetadata.documentation_url}
                  onChange={(e) => setUploadMetadata({ ...uploadMetadata, documentation_url: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetUpload}>Cancel</Button>
            <Button onClick={handleUploadMCP} disabled={!uploadFile || uploadLoading}>
              {uploadLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Register
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MCPs Table */}
      <Card>
        <CardHeader>
          <CardTitle>MCP Servers</CardTitle>
          <CardDescription>Manage marketplace MCP integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MCP</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Installs</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMCPs.map((mcp) => {
                const category = CATEGORIES.find(c => c.id === mcp.category);
                const subcategory = category?.subcategories.find(s => s.id === mcp.subcategory);

                return (
                  <TableRow key={mcp.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{mcp.icon}</span>
                        <div>
                          <p className="font-medium">{mcp.name}</p>
                          <p className="text-xs text-muted-foreground">v{mcp.version}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline">{category?.label || mcp.category}</Badge>
                        {mcp.subcategory && (
                          <span className="text-xs text-muted-foreground ml-1">
                            {subcategory?.label || mcp.subcategory}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={providerColors[mcp.provider]}>
                        {providerLabels[mcp.provider] || mcp.provider}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[mcp.status]}>
                        {mcp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{mcp.install_count.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {mcp.rating > 0 ? (
                        <div className="flex items-center justify-end gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span>{mcp.rating}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {mcp.is_featured ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(mcp)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {mcp.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-500"
                              onClick={() => handleApproveMCP(mcp.id, mcp.name)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() => handleRejectMCP(mcp.id, mcp.name)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteMCP(mcp.id, mcp.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit MCP Dialog */}
      <Dialog open={!!editingMCP} onOpenChange={() => setEditingMCP(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit MCP: {editingMCP?.name}</DialogTitle>
            <DialogDescription>Update MCP details and settings</DialogDescription>
          </DialogHeader>
          {editingMCP && (
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Version</Label>
                    <Input
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(val) => setFormData({ ...formData, category: val, subcategory: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subcategory</Label>
                    <Select
                      value={formData.subcategory}
                      onValueChange={(val) => setFormData({ ...formData, subcategory: val })}
                      disabled={!formData.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategoryData?.subcategories.map(sub => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Provider Type</Label>
                    <Select value={formData.provider} onValueChange={(val: any) => setFormData({ ...formData, provider: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="official">Symone</SelectItem>
                        <SelectItem value="partner">Official</SelectItem>
                        <SelectItem value="community">Marketplace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Input
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(val: any) => setFormData({ ...formData, status: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="deprecated">Deprecated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="settings" className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Featured on Marketplace</p>
                    <p className="text-sm text-muted-foreground">Show prominently in the marketplace</p>
                  </div>
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Verified</p>
                    <p className="text-sm text-muted-foreground">Mark as verified integration</p>
                  </div>
                  <Switch
                    checked={formData.verified}
                    onCheckedChange={(checked) => setFormData({ ...formData, verified: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Hosted by Symone</p>
                    <p className="text-sm text-muted-foreground">Symone-managed infrastructure</p>
                  </div>
                  <Switch
                    checked={formData.is_hosted_by_symone}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_hosted_by_symone: checked })}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMCP(null)}>Cancel</Button>
            <Button onClick={handleUpdateMCP}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
