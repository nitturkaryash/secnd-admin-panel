import React from 'react';
import { motion } from 'framer-motion';
import { FiSend } from 'react-icons/fi';

interface AnimatedNeumorphicButtonProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const AnimatedNeumorphicButton: React.FC<AnimatedNeumorphicButtonProps> = ({
  icon = <FiSend />,
  children,
  onClick,
  className = '',
  disabled = false
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-full 
        flex items-center gap-2 
        text-slate-500
        shadow-[-5px_-5px_10px_rgba(255,_255,_255,_0.8),_5px_5px_10px_rgba(0,_0,_0,_0.25)]
        transition-all duration-300 ease-in-out
        hover:shadow-[-1px_-1px_5px_rgba(255,_255,_255,_0.6),_1px_1px_5px_rgba(0,_0,_0,_0.3),inset_-2px_-2px_5px_rgba(255,_255,_255,_1),inset_2px_2px_4px_rgba(0,_0,_0,_0.3)]
        hover:text-violet-500
        focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
    >
      <motion.div
        animate={{ 
          color: disabled ? '#9CA3AF' : '#6B7280'
        }}
        transition={{ duration: 0.3 }}
        className="group-hover:text-violet-500"
      >
        {icon}
      </motion.div>
      <motion.span
        animate={{ 
          color: disabled ? '#9CA3AF' : '#6B7280'
        }}
        transition={{ duration: 0.3 }}
        className="group-hover:text-violet-500"
      >
        {children}
      </motion.span>
    </motion.button>
  );
};

// Wrapper component for demonstration
const ButtonWrapper = () => {
  return (
    <div className="bg-slate-100 min-h-[200px] flex items-center justify-center">
      <AnimatedNeumorphicButton>
        Hover Me
      </AnimatedNeumorphicButton>
    </div>
  );
};

export default AnimatedNeumorphicButton;
export { ButtonWrapper }; 