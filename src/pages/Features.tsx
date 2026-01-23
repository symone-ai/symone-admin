import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield,
  Eye,
  Users,
  Zap,
  Database,
  Lock,
  ArrowRight,
  Terminal,
  Code,
  Layers,
  Activity,
  Globe,
  Server,
  Cpu,
  GitBranch,
  CheckCircle2,
  Play,
  Pause,
  RefreshCw,
  Search,
  Settings,
  Key,
  Clock,
  TrendingUp,
  BarChart3,
  FileText,
  MessageSquare,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Features = () => {
  const coreFeatures = [
    {
      icon: Shield,
      title: 'Firecracker MicroVMs',
      description: 'Hardware-level isolation for every tool execution. Each MCP server runs in its own secure sandbox with zero shared state.',
      benefits: ['Sub-300ms cold starts', 'Complete memory isolation', 'No container escapes possible'],
    },
    {
      icon: Eye,
      title: 'X-Ray Observability',
      description: 'Full session replay of every agent interaction. Understand exactly what your AI did, why it made decisions, and how to improve.',
      benefits: ['Step-by-step replay', 'Token usage tracking', 'Automatic PII redaction'],
    },
    {
      icon: Layers,
      title: 'Dual-Mode Execution',
      description: 'Choose between Traditional MCP for simple tasks or Code Execution mode for complex, multi-step workflows with 98% token savings.',
      benefits: ['Traditional MCP support', 'Code Execution mode', 'Programmatic Tool Calling (PTC)'],
    },
    {
      icon: Zap,
      title: 'Scale-to-Zero Infrastructure',
      description: 'Only pay for what you use. Servers automatically scale down when idle and spin up in milliseconds when needed.',
      benefits: ['No idle costs', 'Auto-scaling on demand', '15-min idle timeout'],
    },
    {
      icon: Database,
      title: 'Persistent State',
      description: 'Unlike serverless alternatives, your tools maintain state across sessions. Perfect for long-running workflows and conversation context.',
      benefits: ['Cross-session memory', 'Durable storage', 'State snapshots'],
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'SOC2 compliant with full audit logs, SSO/SAML integration, and data residency options for regulated industries.',
      benefits: ['SOC2 Type II certified', 'GDPR compliant', 'Custom data residency'],
    },
  ];

  const executionModes = [
    {
      id: 'traditional',
      name: 'Traditional MCP',
      description: 'Direct tool calls via MCP protocol. Simple, immediate, perfect for small tool libraries.',
      bestFor: ['< 10 tools', 'Simple single-tool operations', 'Quick prototyping', 'Small response sizes (< 1KB)'],
      tokenCost: 'All tool definitions loaded upfront',
      example: `// Claude calls tools directly via MCP protocol
await mcpClient.callTool("search_items", { query: "test" });`,
    },
    {
      id: 'code-execution',
      name: 'Code Execution Mode',
      description: 'Claude writes Python/TypeScript code that orchestrates tools. Only final results return to context.',
      bestFor: ['50+ tools', 'Complex multi-step workflows', 'Large data processing', 'Parallel operations'],
      tokenCost: '98% reduction vs traditional',
      example: `# Claude writes this code (runs in sandbox)
team = await get_team_members("engineering")
expenses = await asyncio.gather(*[
    get_expenses(m["id"], "Q3") for m in team
])
# Only final result returns to Claude`,
    },
    {
      id: 'dual-mode',
      name: 'Dual-Mode (Recommended)',
      description: 'Supports both modes. The AI client chooses the optimal mode based on task complexity.',
      bestFor: ['Production deployments', 'Variable workloads', 'Maximum flexibility', 'Future-proof architecture'],
      tokenCost: 'Optimized per-request',
      example: `// Same server, client chooses mode
// Simple task → Traditional MCP
// Complex workflow → Code Execution`,
    },
  ];

  const platformCapabilities = [
    { icon: Server, title: 'MCP Server Hosting', description: 'Deploy any MCP server with zero configuration' },
    { icon: Key, title: 'Secrets Management', description: 'Encrypted credential vault with auto-rotation' },
    { icon: Users, title: 'Team Collaboration', description: 'RBAC, SSO, and shared workspace management' },
    { icon: Activity, title: 'Real-time Monitoring', description: 'Live activity feeds and alerting' },
    { icon: Clock, title: 'Session Replay', description: 'Debug agent behavior with full replay' },
    { icon: Search, title: 'Tool Discovery', description: 'Browse 1,500+ verified MCP servers' },
    { icon: GitBranch, title: 'Version Control', description: 'Deploy from GitHub with auto-updates' },
    { icon: Globe, title: 'Global Edge Network', description: 'Multi-region deployment for low latency' },
    { icon: BarChart3, title: 'Usage Analytics', description: 'Token tracking and cost optimization' },
    { icon: Settings, title: 'Custom Domains', description: 'Bring your own domain for white-labeling' },
    { icon: RefreshCw, title: 'Auto-Scaling', description: 'Handle traffic spikes automatically' },
    { icon: FileText, title: 'Audit Logs', description: 'Complete compliance trail for 90+ days' },
  ];

  const integrations = [
    { name: 'OpenAI', icon: Brain, category: 'AI' },
    { name: 'Claude', icon: Brain, category: 'AI' },
    { name: 'Gemini', icon: Brain, category: 'AI' },
    { name: 'PostgreSQL', icon: Database, category: 'Database' },
    { name: 'MongoDB', icon: Database, category: 'Database' },
    { name: 'Redis', icon: Zap, category: 'Database' },
    { name: 'Slack', icon: MessageSquare, category: 'Messaging' },
    { name: 'GitHub', icon: GitBranch, category: 'DevTools' },
    { name: 'Notion', icon: FileText, category: 'Productivity' },
    { name: 'Stripe', icon: Zap, category: 'Payments' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
              Platform Features
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Everything You Need to{' '}
              <span className="text-gradient">Run MCP at Scale</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              From single-tool prototypes to enterprise AI agents with hundreds of integrations.
              Symone provides the infrastructure, security, and observability you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button variant="hero" size="xl">
                  Start Building Free
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/dashboard/marketplace">
                <Button variant="heroOutline" size="xl">
                  <Search className="mr-2" />
                  Explore Marketplace
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Core Platform Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built from the ground up for production AI workloads
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Execution Modes Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4 border-accent/30 text-accent">
              Dual-Mode Architecture
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Execution Mode
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Traditional MCP loads all tool definitions upfront (consuming 50K-100K+ tokens). 
              Code Execution mode reduces this by 98% while enabling complex workflows.
            </p>
          </motion.div>

          <Tabs defaultValue="dual-mode" className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="traditional" className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Traditional
              </TabsTrigger>
              <TabsTrigger value="code-execution" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Code Execution
              </TabsTrigger>
              <TabsTrigger value="dual-mode" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Dual-Mode
              </TabsTrigger>
            </TabsList>

            {executionModes.map((mode) => (
              <TabsContent key={mode.id} value={mode.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl">{mode.name}</CardTitle>
                          <CardDescription className="text-base mt-2">
                            {mode.description}
                          </CardDescription>
                        </div>
                        <Badge variant={mode.id === 'dual-mode' ? 'default' : 'secondary'}>
                          {mode.id === 'dual-mode' ? 'Recommended' : mode.tokenCost}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-foreground mb-3">Best For:</h4>
                          <ul className="space-y-2">
                            {mode.bestFor.map((item) => (
                              <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-3">Example:</h4>
                          <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                            <pre className="text-muted-foreground whitespace-pre-wrap">{mode.example}</pre>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Token Savings Visualization */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="outline" className="mb-4 border-success/30 text-success">
                Cost Optimization
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Save 98% on Token Costs
              </h2>
              <p className="text-muted-foreground mb-6">
                Traditional MCP with 100+ tools can consume 100K+ tokens before any conversation starts. 
                Code Execution mode keeps tool definitions out of context and processes data in sandboxed code.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Traditional MCP (100 tools)</span>
                    <span className="text-destructive font-mono">~104,000 tokens</span>
                  </div>
                  <div className="w-full h-3 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-destructive" style={{ width: '100%' }} />
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Code Execution Mode</span>
                    <span className="text-success font-mono">~1,500 tokens</span>
                  </div>
                  <div className="w-full h-3 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-success" style={{ width: '1.5%' }} />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Real-World Example
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Task: "Find all team members who exceeded Q3 travel budget"
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
                      <span className="text-sm">Traditional: 23 tool calls</span>
                      <span className="text-destructive font-mono text-sm">205K tokens</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                      <span className="text-sm">Code Execution: 3 code blocks</span>
                      <span className="text-success font-mono text-sm">2.5K tokens</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Token Savings:</span>
                      <Badge className="bg-success text-success-foreground">98.8%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform Capabilities Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Complete Platform Capabilities
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build, deploy, and monitor production AI agents
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {platformCapabilities.map((cap, index) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <cap.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{cap.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{cap.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Preview */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              1,500+ Verified Integrations
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our marketplace of official and community-contributed MCP servers
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border hover:border-primary/30 transition-colors">
                  <integration.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{integration.name}</span>
                </div>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link to="/dashboard/marketplace">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors cursor-pointer">
                  <span className="text-sm font-medium text-primary">+1,490 more</span>
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
            <div className="absolute inset-0 grid-pattern opacity-20" />

            <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Ready to Build Production AI?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of teams using Symone to power their AI agents with 
                secure, observable, and scalable MCP infrastructure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/dashboard">
                  <Button variant="hero" size="xl">
                    Start Building Free
                    <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link to="/#pricing">
                  <Button variant="heroOutline" size="xl">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
