import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  delay?: number;
}

const PricingCard = ({ 
  name, 
  price, 
  period, 
  description, 
  features, 
  highlighted = false,
  delay = 0 
}: PricingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`relative rounded-2xl p-6 md:p-8 ${
        highlighted 
          ? 'bg-gradient-to-b from-primary/10 to-card border-2 border-primary shadow-glow' 
          : 'bg-card border border-border'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
          Most Popular
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground mb-2">{name}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      
      <div className="mb-6">
        <span className="text-4xl font-bold text-foreground">{price}</span>
        {period && <span className="text-muted-foreground ml-2">{period}</span>}
      </div>
      
      <Button 
        variant={highlighted ? 'hero' : 'outline'} 
        className="w-full mb-6"
        size="lg"
      >
        {price === 'Custom' ? 'Contact Sales' : 'Get Started'}
      </Button>
      
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default PricingCard;
