import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  Zap,
  ArrowRight,
  HelpCircle,
  Server,
  Database,
  Users,
  Clock,
  Shield,
  Headphones,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Developer',
      description: 'Perfect for side projects and experimentation',
      price: { monthly: 0, annual: 0 },
      features: [
        { name: '1 Active MCP Server', included: true },
        { name: '1,000 actions/month', included: true },
        { name: 'Serverless hosting', included: true },
        { name: 'Public registry access', included: true },
        { name: 'Community support', included: true },
        { name: '100K tokens/month', included: true },
        { name: 'Traditional MCP mode', included: true },
        { name: 'Code Execution mode', included: false },
        { name: 'Session replay', included: false },
        { name: 'Team collaboration', included: false },
      ],
      cta: 'Start Free',
      highlighted: false,
    },
    {
      name: 'Team',
      description: 'For growing teams building production apps',
      price: { monthly: 29, annual: 24 },
      features: [
        { name: '15 Active MCP Servers', included: true },
        { name: '10,000 actions/month', included: true },
        { name: 'Persistent storage (5GB)', included: true },
        { name: 'Shared secrets manager', included: true },
        { name: 'Email support', included: true },
        { name: 'Unlimited tokens', included: true },
        { name: 'Traditional MCP mode', included: true },
        { name: 'Code Execution mode', included: true },
        { name: '7-day log retention', included: true },
        { name: 'Up to 10 team members', included: true },
      ],
      cta: 'Start Trial',
      highlighted: true,
    },
    {
      name: 'Business',
      description: 'For organizations requiring compliance',
      price: { monthly: 99, annual: 84 },
      features: [
        { name: 'Unlimited Active Servers', included: true },
        { name: '100,000 actions/month', included: true },
        { name: 'Persistent storage (50GB)', included: true },
        { name: 'Private VPC peering', included: true },
        { name: 'Priority support', included: true },
        { name: 'Unlimited tokens', included: true },
        { name: 'Dual-mode execution', included: true },
        { name: 'Code Execution mode', included: true },
        { name: '90-day audit logs', included: true },
        { name: 'SSO / SAML integration', included: true },
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
    {
      name: 'Enterprise',
      description: 'Tailored solutions for large organizations',
      price: { monthly: null, annual: null },
      features: [
        { name: 'Dedicated infrastructure', included: true },
        { name: 'Unlimited actions', included: true },
        { name: 'Unlimited storage', included: true },
        { name: 'On-premise deployment', included: true },
        { name: '24/7 phone support', included: true },
        { name: 'Custom SLAs', included: true },
        { name: 'All execution modes', included: true },
        { name: 'Compliance automation', included: true },
        { name: 'Unlimited log retention', included: true },
        { name: 'Dedicated success manager', included: true },
      ],
      cta: 'Talk to Sales',
      highlighted: false,
    },
  ];

  const faqs = [
    {
      question: 'What counts as an "active" MCP server?',
      answer: 'An active server is one that has been accessed within the last 30 days. Stopped or paused servers don\'t count against your limit.',
    },
    {
      question: 'Can I switch between plans?',
      answer: 'Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately, and downgrades take effect at the end of your billing cycle.',
    },
    {
      question: 'What\'s the difference between Traditional and Code Execution mode?',
      answer: 'Traditional MCP loads all tool definitions into context upfront. Code Execution mode lets Claude write code that orchestrates tools, reducing token usage by up to 98%.',
    },
    {
      question: 'Do you offer a free trial?',
      answer: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.',
    },
    {
      question: 'Is there a discount for annual billing?',
      answer: 'Yes, annual billing saves you 17% compared to monthly billing on all paid plans.',
    },
  ];

  const comparisonFeatures = [
    { category: 'Infrastructure', features: [
      { name: 'MCP Servers', developer: '1', team: '15', business: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Actions/month', developer: '1,000', team: '10,000', business: '100,000', enterprise: 'Unlimited' },
      { name: 'Storage', developer: '-', team: '5GB', business: '50GB', enterprise: 'Unlimited' },
      { name: 'Regions', developer: '1', team: '3', business: 'All', enterprise: 'Custom' },
      { name: 'Cold Start', developer: '< 300ms', team: '< 300ms', business: '< 100ms', enterprise: '< 50ms' },
    ]},
    { category: 'Execution', features: [
      { name: 'Traditional MCP', developer: '✓', team: '✓', business: '✓', enterprise: '✓' },
      { name: 'Code Execution', developer: '-', team: '✓', business: '✓', enterprise: '✓' },
      { name: 'Dual-Mode', developer: '-', team: '-', business: '✓', enterprise: '✓' },
      { name: 'Tokens/month', developer: '100K', team: 'Unlimited', business: 'Unlimited', enterprise: 'Unlimited' },
    ]},
    { category: 'Security', features: [
      { name: 'MicroVM Isolation', developer: '✓', team: '✓', business: '✓', enterprise: '✓' },
      { name: 'Secrets Manager', developer: '-', team: '✓', business: '✓', enterprise: '✓' },
      { name: 'SSO/SAML', developer: '-', team: '-', business: '✓', enterprise: '✓' },
      { name: 'VPC Peering', developer: '-', team: '-', business: '✓', enterprise: '✓' },
      { name: 'SOC2 Report', developer: '-', team: '-', business: '✓', enterprise: '✓' },
    ]},
    { category: 'Support', features: [
      { name: 'Community', developer: '✓', team: '✓', business: '✓', enterprise: '✓' },
      { name: 'Email', developer: '-', team: '✓', business: '✓', enterprise: '✓' },
      { name: 'Priority', developer: '-', team: '-', business: '✓', enterprise: '✓' },
      { name: '24/7 Phone', developer: '-', team: '-', business: '-', enterprise: '✓' },
      { name: 'Dedicated CSM', developer: '-', team: '-', business: '-', enterprise: '✓' },
    ]},
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
              Simple Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Pay per seat, not per token
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Predictable pricing that scales with your team. No surprise bills, no token counting.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 p-1 bg-secondary rounded-lg">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingPeriod === 'annual'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Annual
                <Badge variant="secondary" className="ml-2 bg-success/10 text-success">
                  Save 17%
                </Badge>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`h-full relative ${
                  plan.highlighted 
                    ? 'border-primary shadow-lg shadow-primary/10' 
                    : 'border-border'
                }`}>
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-4">
                      {plan.price.monthly !== null ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-foreground">
                            ${billingPeriod === 'monthly' ? plan.price.monthly : plan.price.annual}
                          </span>
                          {plan.price.monthly > 0 && (
                            <span className="text-muted-foreground">/user/mo</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-4xl font-bold text-foreground">Custom</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      variant={plan.highlighted ? 'hero' : 'outline'} 
                      className="w-full"
                      asChild
                    >
                      <Link to={plan.name === 'Enterprise' ? '/contact' : '/signup'}>
                        {plan.cta}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>

                    <ul className="space-y-3 pt-4">
                      {plan.features.map((feature) => (
                        <li key={feature.name} className="flex items-center gap-2 text-sm">
                          {feature.included ? (
                            <Check className="w-4 h-4 text-success shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                          <span className={feature.included ? 'text-foreground' : 'text-muted-foreground'}>
                            {feature.name}
                          </span>
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

      {/* Feature Comparison Table */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Compare Plans
            </h2>
            <p className="text-muted-foreground">
              A detailed breakdown of what's included in each plan
            </p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-foreground font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 text-foreground font-semibold">Developer</th>
                  <th className="text-center py-4 px-4 text-foreground font-semibold">
                    <span className="inline-flex items-center gap-2">
                      Team
                      <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">Popular</Badge>
                    </span>
                  </th>
                  <th className="text-center py-4 px-4 text-foreground font-semibold">Business</th>
                  <th className="text-center py-4 px-4 text-foreground font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((category) => (
                  <>
                    <tr key={category.category} className="bg-secondary/30">
                      <td colSpan={5} className="py-3 px-4 font-semibold text-foreground">
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature) => (
                      <tr key={feature.name} className="border-b border-border/50">
                        <td className="py-3 px-4 text-muted-foreground">{feature.name}</td>
                        <td className="text-center py-3 px-4 text-muted-foreground">{feature.developer}</td>
                        <td className="text-center py-3 px-4 text-foreground font-medium">{feature.team}</td>
                        <td className="text-center py-3 px-4 text-muted-foreground">{feature.business}</td>
                        <td className="text-center py-3 px-4 text-muted-foreground">{feature.enterprise}</td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-start gap-2">
                      <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground pl-7">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground mb-8">
              Start building for free. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button variant="hero" size="lg">
                  Start Free Trial
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
