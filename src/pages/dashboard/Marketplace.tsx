import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Database,
  MessageSquare,
  Cloud,
  FileText,
  Mail,
  Globe,
  Brain,
  Github,
  Zap,
  Star,
  Download,
  CheckCircle2,
  Clock,
  Shield,
  CreditCard,
  Calendar,
  BarChart3,
  Code,
  Image,
  Music,
  Video,
  Lock,
  Webhook,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Smartphone,
  Map,
  ShoppingCart,
  Users,
  Briefcase,
  Headphones,
  Palette,
  ExternalLink,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/categories';

type ServerType = 'official' | 'partner' | 'community';
type ExecutionMode = 'traditional' | 'code-execution' | 'dual-mode';

interface MarketplaceServer {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory: string;
  icon: any; // Simplified for dynamic loading or lucide mapping
  publisher: string;
  serverType: ServerType;
  executionMode: ExecutionMode;
  verified: boolean;
  healthScore: number;
  installs: number;
  rating: number;
  latency: string;
  coldStart: string;
  toolCount: number;
  tags: string[];
  featured?: boolean;
}

// Map the shared categories to the UI structure (adding 'count' which we'd need to fetch dynamically ideally)
const categories = CATEGORIES.map(c => ({
  ...c,
  count: 0 // Placeholder
}));

const Marketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest' | 'health'>('popular');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [serverTypeFilter, setServerTypeFilter] = useState<ServerType | 'all'>('all');
  const [executionModeFilter, setExecutionModeFilter] = useState<ExecutionMode | 'all'>('all');
  const [minHealthScore, setMinHealthScore] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Data State
  const [mcps, setMcps] = useState<MarketplaceServer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMCPs = async () => {
      setLoading(true);
      try {
        // Fetch from REAL public API
        // Pass filters to backend for initial subset, or fetch all active and filter client side.
        // For now, let's fetch 'active' via public endpoint and apply granular filters client side 
        // to match existing UI logic (which is fast for < 1000 items)
        const params: any = {
          // We could pass params here, but 'list' defaults to fetching all active.
          // If we want to offload filtering to DB, pass params. For now, fetching all active is fine.
        };

        const response = await api.public.marketplace.list(params);
        if (response.success) {
          const mapped = response.mcps.map((m: any) => ({
            id: m.id,
            name: m.name,
            slug: m.slug,
            description: m.description || '',
            category: m.category,
            subcategory: m.subcategory || '',
            icon: Brain, // Default icon, would need a mapper for string name -> Component
            publisher: m.provider === 'official' ? 'Symone' : (m.provider === 'partner' ? 'Official' : 'Marketplace'),
            serverType: (m.provider as ServerType) || 'community',
            executionMode: 'dual-mode', // Placeholder
            verified: m.verified,
            healthScore: 98, // Placeholder
            installs: m.installs || 0,
            rating: 0, // Not in DB yet?
            latency: '120ms', // Placeholder
            coldStart: '200ms', // Placeholder
            toolCount: 0,
            tags: [],
            featured: m.is_featured
          }));
          setMcps(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch marketplace:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMCPs();
  }, []); // Run once on mount, then filter locally. Or add deps to re-fetch if we use server-side filtering.

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategory(categoryId);
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategoryClick = (categoryId: string, subcategoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subcategoryId);
  };

  const filteredServers = useMemo(() => {
    let filtered = mcps.filter(server => {
      const matchesCategory = !selectedCategory || server.category === selectedCategory;
      const matchesSubcategory = !selectedSubcategory || server.subcategory === selectedSubcategory;
      const matchesSearch =
        !searchQuery ||
        server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesVerified = !showVerifiedOnly || server.verified;
      const matchesHealth = server.healthScore >= minHealthScore;
      const matchesServerType = serverTypeFilter === 'all' || server.serverType === serverTypeFilter;
      const matchesExecutionMode = executionModeFilter === 'all' || server.executionMode === executionModeFilter;

      return matchesCategory && matchesSubcategory && matchesSearch && matchesVerified && matchesHealth && matchesServerType && matchesExecutionMode;
    });

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.installs - a.installs);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'health':
        filtered.sort((a, b) => b.healthScore - a.healthScore);
        break;
      case 'newest':
        // Would use created date in real app
        break;
    }

    return filtered;
  }, [mcps, selectedCategory, selectedSubcategory, searchQuery, sortBy, showVerifiedOnly, minHealthScore, serverTypeFilter, executionModeFilter]);

  const featuredServers = mcps.filter(s => s.featured);
  const totalCount = mcps.length; // Active count from DB

  const getHealthColor = (score: number) => {
    if (score >= 95) return 'text-success';
    if (score >= 80) return 'text-accent';
    return 'text-destructive';
  };

  const getServerTypeBadge = (type: ServerType) => {
    switch (type) {
      case 'official':
        return { label: 'Symone', className: 'bg-primary/10 text-primary border-primary/20' };
      case 'partner':
        return { label: 'Official', className: 'bg-accent/10 text-accent border-accent/20' };
      case 'community':
        return { label: 'Marketplace', className: 'bg-muted text-muted-foreground border-border' };
      default:
        return { label: type, className: 'bg-muted text-muted-foreground border-border' };
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchQuery('');
    setShowVerifiedOnly(false);
    setMinHealthScore(0);
    setServerTypeFilter('all');
    setExecutionModeFilter('all');
  };

  const hasActiveFilters = selectedCategory || selectedSubcategory || searchQuery || showVerifiedOnly || minHealthScore > 0 || serverTypeFilter !== 'all' || executionModeFilter !== 'all';

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Category Sidebar */}
      <aside className="w-64 shrink-0 hidden lg:block">
        <Card className="h-full">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Categories</h3>
              <Badge variant="secondary" className="text-xs">{totalCount}</Badge>
            </div>
            <ScrollArea className="h-[calc(100vh-14rem)]">
              <div className="space-y-1 pr-3">
                <button
                  onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                    }`}
                >
                  <span>All Servers</span>
                  <span className="text-xs opacity-70">{totalCount}</span>
                </button>

                {categories.map((category) => (
                  <div key={category.id}>
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="p-1 hover:bg-secondary rounded"
                      >
                        {expandedCategories.includes(category.id) ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCategoryClick(category.id)}
                        className={`flex-1 flex items-center justify-between px-2 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category.id && !selectedSubcategory
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-secondary'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <category.icon className="w-4 h-4" />
                          <span className="truncate">{category.label}</span>
                        </div>
                        <span className="text-xs opacity-70">{category.count}</span>
                      </button>
                    </div>

                    {expandedCategories.includes(category.id) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {category.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleSubcategoryClick(category.id, sub.id)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-colors ${selectedSubcategory === sub.id
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                              }`}
                          >
                            <span className="truncate">{sub.label}</span>
                            <span className="opacity-70">{sub.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="shrink-0 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
              <p className="text-muted-foreground">
                Discover from {totalCount.toLocaleString()}+ verified MCP servers
              </p>
            </div>
          </div>

          {/* Server Type Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-1 mr-2">
              <span className="text-xs text-muted-foreground">Provider:</span>
              <Button
                variant={serverTypeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setServerTypeFilter('all')}
              >
                All
              </Button>
              <Button
                variant={serverTypeFilter === 'official' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setServerTypeFilter('official')}
              >
                <Shield className="w-3 h-3 mr-1" />
                Symone
              </Button>
              <Button
                variant={serverTypeFilter === 'partner' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setServerTypeFilter('partner')}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Official
              </Button>
              <Button
                variant={serverTypeFilter === 'community' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setServerTypeFilter('community')}
              >
                <Users className="w-3 h-3 mr-1" />
                Marketplace
              </Button>
            </div>

            <div className="h-6 w-px bg-border mx-2 hidden sm:block" />

            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Mode:</span>
              <Button
                variant={executionModeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExecutionModeFilter('all')}
              >
                All
              </Button>
              <Button
                variant={executionModeFilter === 'traditional' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExecutionModeFilter('traditional')}
              >
                <Server className="w-3 h-3 mr-1" />
                Traditional
              </Button>
              <Button
                variant={executionModeFilter === 'code-execution' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExecutionModeFilter('code-execution')}
              >
                <Code className="w-3 h-3 mr-1" />
                Code Exec
              </Button>
              <Button
                variant={executionModeFilter === 'dual-mode' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExecutionModeFilter('dual-mode')}
              >
                <Cpu className="w-3 h-3 mr-1" />
                Dual Mode
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search servers by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Most Popular
                  </div>
                </SelectItem>
                <SelectItem value="rating">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Highest Rated
                  </div>
                </SelectItem>
                <SelectItem value="health">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Health Score
                  </div>
                </SelectItem>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Newest
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Category Selector */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                      !
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Browse by category or apply filters
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Categories</h4>
                    <div className="space-y-1">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            handleCategoryClick(cat.id);
                            setFiltersOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${selectedCategory === cat.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-secondary'
                            }`}
                        >
                          <cat.icon className="w-4 h-4" />
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Options</h4>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={showVerifiedOnly}
                        onCheckedChange={(c) => setShowVerifiedOnly(c === true)}
                      />
                      <span className="text-sm">Verified only</span>
                    </label>
                  </div>

                  {hasActiveFilters && (
                    <Button variant="outline" className="w-full" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="outline" className="hidden lg:flex">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find(c => c.id === selectedCategory)?.label}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); }}
                  />
                </Badge>
              )}
              {selectedSubcategory && (
                <Badge variant="secondary" className="gap-1">
                  {categories
                    .find(c => c.id === selectedCategory)
                    ?.subcategories.find(s => s.id === selectedSubcategory)?.label}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSubcategory(null)} />
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  "{searchQuery}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {showVerifiedOnly && (
                <Badge variant="secondary" className="gap-1">
                  Verified only
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setShowVerifiedOnly(false)} />
                </Badge>
              )}
              <button className="text-xs text-primary hover:underline" onClick={clearFilters}>
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Server Grid */}
        <ScrollArea className="flex-1">
          <div className="pr-4">
            {/* Featured Section (only when no filters) */}
            {!hasActiveFilters && !loading && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-semibold text-foreground">Featured Servers</h2>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {featuredServers.slice(0, 6).map((server, index) => (
                    <ServerCard key={server.id} server={server} index={index} getHealthColor={getHealthColor} getServerTypeBadge={getServerTypeBadge} />
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Results */}
            {!loading && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    {hasActiveFilters ? 'Search Results' : 'All Servers'}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {filteredServers.length} server{filteredServers.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {filteredServers.length > 0 ? (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 pb-6">
                    {filteredServers.map((server, index) => (
                      <ServerCard key={server.id} server={server} index={index} getHealthColor={getHealthColor} getServerTypeBadge={getServerTypeBadge} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-foreground mb-2">No servers found</p>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search or filters
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

// Server Card Component
const ServerCard = ({
  server,
  index,
  getHealthColor,
  getServerTypeBadge,
}: {
  server: MarketplaceServer;
  index: number;
  getHealthColor: (score: number) => string;
  getServerTypeBadge: (type: ServerType) => { label: string; className: string };
}) => {
  const typeBadge = getServerTypeBadge(server.serverType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
    >
      <Card className="hover:border-primary/30 transition-colors h-full flex flex-col group">
        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <server.icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeBadge.className}`}>
                {typeBadge.label}
              </Badge>
              <div className="flex items-center gap-1">
                <div className={`text-sm font-semibold ${getHealthColor(server.healthScore)}`}>
                  {server.healthScore}
                </div>
                <span className="text-xs text-muted-foreground">health</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-foreground">{server.name}</h3>
            {server.verified && <CheckCircle2 className="w-4 h-4 text-primary" />}
            {server.featured && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Featured
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-3 flex-1 line-clamp-2">
            {server.description}
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-accent" />
              {server.rating}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {(server.installs / 1000).toFixed(1)}k
            </span>
            <span className="flex items-center gap-1" title="Response latency when warm">
              <Clock className="w-3 h-3" />
              {server.latency}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground/70" title="Cold start time (scale-to-zero)">
              <Zap className="w-3 h-3" />
              {server.coldStart}
            </span>
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {server.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground truncate max-w-[120px]" title={server.publisher}>
              by {server.publisher}
            </span>
            <div className="flex items-center gap-2">
              <Link to={`/servers/${server.slug}`}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View
                </Button>
              </Link>
              <Button size="sm" variant="hero">
                <Zap className="w-3 h-3 mr-1" />
                Deploy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Marketplace;
