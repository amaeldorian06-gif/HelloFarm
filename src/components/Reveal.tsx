import React from 'react';
import { motion } from 'framer-motion';

interface RevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
  key?: string | number;
}

export default function Reveal({ children, direction = 'up', delay = 0, className }: RevealProps) {
  const getInitialProps = () => {
    switch (direction) {
      case 'up': return { y: 40, x: 0 };
      case 'down': return { y: -40, x: 0 };
      case 'left': return { y: 0, x: 40 };
      case 'right': return { y: 0, x: -40 };
      default: return { y: 40, x: 0 };
    }
  };

  const initial = { opacity: 0, ...getInitialProps() };

  return (
    <motion.div
      initial={initial}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        x: 0
      }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
