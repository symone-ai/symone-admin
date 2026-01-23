import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check, X, Rocket, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const plans = [
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    actions: 10000,
    current: true,
    features: ['10,000 actions/month', '10 servers', '5GB storage', 'Email support'],
  },
  {
    id: 'team',
    name: 'Team',
    price: 79,
    actions: 50000,
    recommended: true,
    features: ['50,000 actions/month', '25 servers', '25GB storage', 'Priority support', 'Team collaboration'],
  },
  {
    id: 'business',
    name: 'Business',
    price: 199,
    actions: 200000,
    features: ['200,000 actions/month', 'Unlimited servers', '100GB storage', 'Dedicated support', 'SSO & SAML', 'Custom SLAs'],
  },
];

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  // Static fallback values (will be replaced with real API data later)
  const actionStats = { actionsThisPeriod: 0, actionLimit: 10000 };
  const [selectedPlan, setSelectedPlan] = useState('team');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const usagePercentage = (actionStats.actionsThisPeriod / actionStats.actionLimit) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usagePercentage >= 95;

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    // Simulate upgrade process
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsUpgrading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isAtLimit ? (
              <>
                <AlertTriangle className="w-6 h-6 text-destructive" />
                You've reached your action limit
              </>
            ) : (
              <>
                <Rocket className="w-6 h-6 text-primary" />
                Upgrade for more power
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Current Usage */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Current Usage</span>
            <span className={`text-sm font-bold ${isAtLimit ? 'text-destructive' : isNearLimit ? 'text-accent' : 'text-foreground'}`}>
              {actionStats.actionsThisPeriod.toLocaleString()} / {actionStats.actionLimit.toLocaleString()} actions
            </span>
          </div>
          <Progress
            value={Math.min(usagePercentage, 100)}
            className={`h-2 ${isAtLimit ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-accent' : ''}`}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {isAtLimit
              ? 'Upgrade now to continue using your servers without interruption.'
              : `You're using ${usagePercentage.toFixed(0)}% of your monthly actions. Upgrade to avoid hitting limits.`
            }
          </p>
        </div>

        {/* Plan Comparison */}
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !plan.current && setSelectedPlan(plan.id)}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${plan.current
                  ? 'border-muted bg-muted/30 cursor-default opacity-60'
                  : selectedPlan === plan.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Recommended
                </div>
              )}
              {plan.current && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-muted-foreground text-background text-xs font-medium">
                  Current Plan
                </div>
              )}

              <div className="text-center mb-4 pt-2">
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <p className="text-sm text-primary font-medium mt-1">
                  {plan.actions.toLocaleString()} actions
                </p>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {selectedPlan === plan.id && !plan.current && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Upgrade Button */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Upgrade takes effect immediately. Prorated billing applied.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Maybe later
            </Button>
            <Button
              variant="hero"
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="min-w-[140px]"
            >
              {isUpgrading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Zap className="w-4 h-4" />
                </motion.div>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade to {plans.find(p => p.id === selectedPlan)?.name}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage upgrade modal visibility
export function useUpgradeModal() {
  const [open, setOpen] = useState(false);
  const [hasShownThisSession, setHasShownThisSession] = useState(false);

  // Static fallback values (will be replaced with real API data later)
  const actionStats = { actionsThisPeriod: 0, actionLimit: 10000 };
  const usagePercentage = (actionStats.actionsThisPeriod / actionStats.actionLimit) * 100;

  useEffect(() => {
    // Show modal when usage crosses 80% threshold (only once per session)
    if (usagePercentage >= 80 && !hasShownThisSession) {
      const timer = setTimeout(() => {
        setOpen(true);
        setHasShownThisSession(true);
      }, 1000); // Small delay for better UX
      return () => clearTimeout(timer);
    }
  }, [usagePercentage, hasShownThisSession]);

  return {
    open,
    setOpen,
    triggerUpgrade: () => setOpen(true),
  };
}
