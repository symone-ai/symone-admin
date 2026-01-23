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
  Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NetworkGraph from '@/components/NetworkGraph';
import StatsCounter from '@/components/StatsCounter';
import FeatureCard from '@/components/FeatureCard';
import PricingCard from '@/components/PricingCard';
import LiveActivityFeed from '@/components/LiveActivityFeed';

const Index = () => {
  const features = [
    {
      icon: Shield,
      title: 'Zero Trust Security',
      description: 'Firecracker MicroVMs provide hardware-level isolation. Every tool runs in its own secure sandbox.',
    },
    {
      icon: Eye,
      title: 'X-Ray Observability',
      description: 'Full session replay of every agent interaction. Know exactly what your AI did and why.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'RBAC, SSO, and shared secrets management. Built for teams, not just individuals.',
    },
    {
      icon: Zap,
      title: 'Instant Deployment',
      description: 'Scale-to-zero infrastructure means you only pay for what you use. Cold starts under 300ms.',
    },
    {
      icon: Database,
      title: 'Persistent State',
      description: 'Unlike serverless alternatives, your tools maintain state across sessions.',
    },
    {
      icon: Lock,
      title: 'SOC2 Compliant',
      description: 'Enterprise-grade compliance with full audit logs and data residency options.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Developer',
      price: 'Free',
      period: '',
      description: 'Perfect for side projects and experimentation',
      features: [
        '1 Active MCP Server',
        'Serverless hosting',
        'Public registry access',
        'Community support',
        '100K tokens/month',
      ],
    },
    {
      name: 'Team',
      price: '$29',
      period: '/user/month',
      description: 'For growing teams building production apps',
      features: [
        '15 Active MCP Servers',
        'Persistent storage (5GB)',
        'Shared secrets manager',
        '7-day log retention',
        'Email support',
        'Unlimited tokens',
      ],
      highlighted: true,
    },
    {
      name: 'Business',
      price: '$99',
      period: '/user/month',
      description: 'For organizations requiring compliance',
      features: [
        'Unlimited Active Servers',
        'Private VPC peering',
        'SSO / SAML integration',
        '90-day audit logs',
        'Role-based access control',
        'Priority support',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Tailored solutions for large organizations',
      features: [
        'Dedicated infrastructure',
        'Custom SLAs',
        'On-premise deployment',
        'Compliance automation',
        'Dedicated success manager',
        '24/7 phone support',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-6">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-mono text-primary">14,203 servers online</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Mission Control for{' '}
                <span className="text-gradient">AI Agents</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
                The secure, observable infrastructure for hosting MCP servers. 
                Connect your AI to any tool without the security nightmares.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/dashboard">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    Start Building Free
                    <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link to="/docs">
                  <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
                    <Terminal className="mr-2" />
                    View Documentation
                  </Button>
                </Link>
              </div>
              
              <p className="mt-4 text-sm text-muted-foreground">
                No credit card required • Works with any MCP client
              </p>
            </motion.div>

            {/* Right - Network Graph */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <NetworkGraph />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <StatsCounter />
          </motion.div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              From Chaos to Control
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stop debugging broken integrations. Start shipping AI features.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* The Pain */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative p-8 rounded-2xl bg-destructive/5 border border-destructive/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent" />
              <div className="relative">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-destructive">✕</span> The Context Silo
                </h3>
                <div className="font-mono text-xs bg-background/50 rounded-lg p-4 space-y-2">
                  <p className="text-destructive">ERROR: Connection refused to postgres:5432</p>
                  <p className="text-muted-foreground">WARN: API key exposed in client bundle</p>
                  <p className="text-destructive">ERROR: CORS policy blocked request</p>
                  <p className="text-muted-foreground">DEBUG: Token refresh failed after 3 retries</p>
                  <p className="text-destructive">FATAL: Sandbox escape detected</p>
                </div>
              </div>
            </motion.div>

            {/* The Solution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative p-8 rounded-2xl bg-success/5 border border-success/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent" />
              <div className="relative">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-success">✓</span> Managed Context
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className="text-sm text-success font-medium">Operational</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-sm text-muted-foreground">Auth:</span>
                    <span className="text-sm text-success font-medium">Secured (OAuth 2.1)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-sm text-muted-foreground">Latency:</span>
                    <span className="text-sm text-success font-medium">12ms p95</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Production
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to run MCP servers in production with confidence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                See Every Action, <span className="text-gradient">In Real-Time</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                Full observability into what your AI agents are doing. Session replay, 
                audit logs, and real-time monitoring give you complete visibility.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Real-time activity streaming',
                  'Session replay with step-by-step breakdown',
                  'Automatic PII redaction',
                  'Cost tracking and alerts',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/dashboard">
                <Button variant="hero">
                  Explore Dashboard
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <LiveActivityFeed />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-card/30" id="pricing">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Predictable Pricing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No token counting. No surprise bills. Pay per seat, scale with confidence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <PricingCard
                key={plan.name}
                {...plan}
                delay={index * 0.1}
              />
            ))}
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
                Ready to Take Control?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of teams building the future of AI-powered workflows 
                with secure, observable MCP infrastructure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/dashboard">
                  <Button variant="hero" size="xl">
                    Get Started Free
                    <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="heroOutline" size="xl">
                    Talk to Sales
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

export default Index;
