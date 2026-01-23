import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  icon: string;
  isCenter?: boolean;
}

const NetworkGraph = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const nodes: Node[] = [
    { id: 'center', x: 50, y: 50, label: 'AI Agent', icon: '🤖', isCenter: true },
    { id: 'db', x: 20, y: 25, label: 'Database', icon: '🗄️' },
    { id: 'slack', x: 80, y: 20, label: 'Slack', icon: '💬' },
    { id: 'github', x: 85, y: 55, label: 'GitHub', icon: '📦' },
    { id: 'drive', x: 75, y: 85, label: 'Drive', icon: '📁' },
    { id: 'api', x: 25, y: 80, label: 'APIs', icon: '🔌' },
    { id: 'crm', x: 10, y: 55, label: 'CRM', icon: '👥' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      const centerNode = nodes.find(n => n.isCenter)!;
      const centerX = (centerNode.x / 100) * width;
      const centerY = (centerNode.y / 100) * height;
      
      // Draw connections
      nodes.filter(n => !n.isCenter).forEach((node, index) => {
        const nodeX = (node.x / 100) * width;
        const nodeY = (node.y / 100) * height;
        
        // Animated pulse along the line
        const time = Date.now() / 1000;
        const pulsePosition = (Math.sin(time * 2 + index) + 1) / 2;
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(nodeX, nodeY);
        ctx.strokeStyle = 'rgba(0, 210, 211, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw pulse
        const pulseX = centerX + (nodeX - centerX) * pulsePosition;
        const pulseY = centerY + (nodeY - centerY) * pulsePosition;
        
        const gradient = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 8);
        gradient.addColorStop(0, 'rgba(0, 210, 211, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 210, 211, 0)');
        
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 8, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <div className="relative w-full h-[400px] md:h-[500px]">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Node overlays */}
      {nodes.map((node, index) => (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.5, type: 'spring' }}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
            node.isCenter ? 'z-10' : 'z-5'
          }`}
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
          }}
        >
          <div 
            className={`flex flex-col items-center gap-2 ${
              node.isCenter ? 'scale-125' : ''
            }`}
          >
            <div 
              className={`relative flex items-center justify-center rounded-xl backdrop-blur-glass ${
                node.isCenter 
                  ? 'w-16 h-16 bg-primary/20 border-2 border-primary shadow-glow' 
                  : 'w-12 h-12 bg-card/80 border border-border hover:border-primary/50 transition-colors cursor-pointer'
              }`}
            >
              {node.isCenter && (
                <div className="absolute inset-0 rounded-xl animate-pulse-ring border-2 border-primary opacity-50" />
              )}
              <span className="text-2xl">{node.icon}</span>
            </div>
            <span className={`font-mono text-xs ${
              node.isCenter ? 'text-primary font-semibold' : 'text-muted-foreground'
            }`}>
              {node.label}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default NetworkGraph;
