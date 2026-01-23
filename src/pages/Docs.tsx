import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Book,
  Rocket,
  Code,
  Server,
  Key,
  Shield,
  Users,
  Zap,
  Terminal,
  GitBranch,
  Search,
  ChevronRight,
  ExternalLink,
  Play,
  FileText,
  Layers,
  Settings,
  Database,
  Globe,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Docs = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const quickLinks = [
    { icon: Rocket, title: 'Quick Start', description: 'Deploy your first MCP server in 5 minutes', href: '#quickstart' },
    { icon: Terminal, title: 'CLI Reference', description: 'Complete command line documentation', href: '#cli' },
    { icon: Code, title: 'API Reference', description: 'REST API and SDK documentation', href: '#api' },
    { icon: Layers, title: 'Execution Modes', description: 'Traditional vs Code Execution mode', href: '#modes' },
  ];

  const docSections = [
    {
      category: 'Getting Started',
      icon: Rocket,
      items: [
        { title: 'Introduction', description: 'What is Symone and why use it', time: '2 min' },
        { title: 'Quick Start Guide', description: 'Deploy your first server', time: '5 min', featured: true },
        { title: 'Architecture Overview', description: 'How Symone works under the hood', time: '10 min' },
        { title: 'Concepts', description: 'Key terminology and concepts', time: '5 min' },
      ],
    },
    {
      category: 'MCP Servers',
      icon: Server,
      items: [
        { title: 'Deploying Servers', description: 'Step-by-step deployment guide', time: '8 min' },
        { title: 'Server Configuration', description: 'Environment variables and settings', time: '6 min' },
        { title: 'Execution Modes', description: 'Traditional, Code Execution, and Dual-Mode', time: '12 min', featured: true },
        { title: 'Custom Servers', description: 'Build and deploy custom MCP servers', time: '15 min' },
        { title: 'Marketplace', description: 'Browse and deploy community servers', time: '4 min' },
      ],
    },
    {
      category: 'Security',
      icon: Shield,
      items: [
        { title: 'Security Overview', description: 'How we keep your data safe', time: '5 min' },
        { title: 'Secrets Management', description: 'Store and manage credentials', time: '7 min' },
        { title: 'MicroVM Isolation', description: 'Understanding Firecracker isolation', time: '10 min' },
        { title: 'SSO & SAML', description: 'Enterprise authentication setup', time: '12 min' },
        { title: 'Compliance', description: 'SOC2, GDPR, and more', time: '6 min' },
      ],
    },
    {
      category: 'Observability',
      icon: Search,
      items: [
        { title: 'Activity Monitoring', description: 'Real-time event tracking', time: '5 min' },
        { title: 'Session Replay', description: 'Debug with full session replay', time: '8 min', featured: true },
        { title: 'Logs & Metrics', description: 'Understanding your logs', time: '6 min' },
        { title: 'Alerting', description: 'Set up notifications and alerts', time: '5 min' },
      ],
    },
    {
      category: 'Team & Collaboration',
      icon: Users,
      items: [
        { title: 'Team Management', description: 'Invite and manage team members', time: '4 min' },
        { title: 'Roles & Permissions', description: 'RBAC configuration guide', time: '7 min' },
        { title: 'Shared Secrets', description: 'Team-wide credential sharing', time: '5 min' },
        { title: 'Audit Logs', description: 'Track team activity', time: '4 min' },
      ],
    },
    {
      category: 'API & Integrations',
      icon: Code,
      items: [
        { title: 'REST API', description: 'Complete API reference', time: '15 min' },
        { title: 'Python SDK', description: 'Python client library', time: '10 min' },
        { title: 'TypeScript SDK', description: 'TypeScript/Node.js client', time: '10 min' },
        { title: 'Webhooks', description: 'Event-driven integrations', time: '8 min' },
        { title: 'GitHub Actions', description: 'CI/CD integration', time: '6 min' },
      ],
    },
  ];

  const codeExamples = [
    {
      title: 'Deploy a Server (CLI)',
      language: 'bash',
      code: `# Install the Symone CLI
npm install -g @symone/cli

# Login to your account
symone login

# Deploy a server from the marketplace
symone deploy postgres-mcp --name my-postgres

# Check server status
symone servers list`,
    },
    {
      title: 'Python SDK Example',
      language: 'python',
      code: `from symone import SymoneClient

client = SymoneClient(api_key="sk_...")

# List all servers
servers = client.servers.list()

# Deploy a new server
server = client.servers.create(
    template="postgres-mcp",
    name="production-db",
    region="us-east-1"
)

# Get server logs
logs = client.servers.logs(server.id)`,
    },
    {
      title: 'TypeScript SDK Example',
      language: 'typescript',
      code: `import { Symone } from '@symone/sdk';

const client = new Symone({ apiKey: 'sk_...' });

// Deploy with Code Execution mode
const server = await client.servers.create({
  template: 'data-analysis',
  name: 'analytics-server',
  executionMode: 'code-execution',
  config: {
    pythonVersion: '3.11',
    packages: ['pandas', 'numpy']
  }
});

// Execute code remotely
const result = await server.execute(\`
  import pandas as pd
  df = pd.read_csv('data.csv')
  return df.describe().to_dict()
\`);`,
    },
  ];

  const popularArticles = [
    { title: 'Understanding Dual-Mode Execution', views: '12.4K', category: 'Concepts' },
    { title: 'Migrating from Self-Hosted MCP', views: '8.2K', category: 'Migration' },
    { title: 'Token Optimization Best Practices', views: '6.8K', category: 'Performance' },
    { title: 'Setting Up SSO with Okta', views: '5.1K', category: 'Enterprise' },
    { title: 'Building Custom MCP Servers', views: '4.9K', category: 'Development' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
              Documentation
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Learn to Build with Symone
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Everything you need to deploy, manage, and scale your MCP infrastructure
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation..."
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-lg"
              />
              <kbd className="hidden sm:inline-flex absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-secondary text-muted-foreground text-xs">
                ⌘K
              </kbd>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <motion.a
                key={link.title}
                href={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group"
              >
                <link.icon className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-foreground mb-1">{link.title}</h3>
                <p className="text-xs text-muted-foreground">{link.description}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Popular Articles */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-24 space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent" />
                      Popular Articles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {popularArticles.map((article) => (
                      <a
                        key={article.title}
                        href="#"
                        className="block p-3 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground mb-1">{article.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{article.views} views</span>
                          <span>•</span>
                          <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                        </div>
                      </a>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Need Help?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <a
                      href="#"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Join Discord Community
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <GitBranch className="w-4 h-4" />
                      GitHub Discussions
                    </a>
                    <a
                      href="/contact"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Contact Support
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 order-1 lg:order-2 space-y-8">
              {/* Documentation Sections */}
              {docSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: sectionIndex * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">{section.category}</h2>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {section.items.map((item) => (
                      <a
                        key={item.title}
                        href="#"
                        className={`p-4 rounded-xl border transition-colors group ${
                          item.featured
                            ? 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                            : 'border-border bg-card hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          {item.featured && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs shrink-0">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <FileText className="w-3 h-3" />
                          {item.time} read
                        </div>
                      </a>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Code Examples */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">Code Examples</h2>
                </div>

                <div className="grid gap-4">
                  {codeExamples.map((example) => (
                    <Card key={example.title}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{example.title}</CardTitle>
                          <Badge variant="outline">{example.language}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                          <pre className="text-muted-foreground whitespace-pre-wrap">{example.code}</pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to start building?
            </h2>
            <p className="text-muted-foreground mb-6">
              Deploy your first MCP server in under 5 minutes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button variant="hero">
                  Get Started Free
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline">
                <Play className="mr-2 w-4 h-4" />
                Watch Tutorial
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Docs;
