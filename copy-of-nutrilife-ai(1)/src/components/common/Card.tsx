import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`bg-white shadow-lg shadow-slate-200/50 rounded-xl border border-slate-100 p-6 ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default Card;