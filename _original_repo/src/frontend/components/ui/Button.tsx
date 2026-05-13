import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../../utils/utils';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-[#5c5e46] text-white hover:opacity-90 shadow-xl shadow-[#5c5e46]/20',
      secondary: 'bg-secondary text-[#5c5e46] hover:bg-secondary/80',
      accent: 'bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20',
      outline: 'border-2 border-primary/10 bg-transparent hover:bg-primary/5 text-primary',
      ghost: 'bg-transparent hover:bg-primary/5 text-primary',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
      icon: 'p-2',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-bold transition-colors disabled:opacity-50 disabled:pointer-events-none animate-shine',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
