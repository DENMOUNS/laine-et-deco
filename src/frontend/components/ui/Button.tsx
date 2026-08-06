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

    // Spinner size matches button size
    const spinnerSizes = {
      sm: 'h-3 w-3 border',
      md: 'h-4 w-4 border-2',
      lg: 'h-5 w-5 border-2',
      icon: 'h-4 w-4 border-2',
    };

    // Spinner color matches button variant
    const spinnerColors = {
      primary: 'border-white/30 border-t-white',
      secondary: 'border-primary/30 border-t-primary',
      accent: 'border-white/30 border-t-white',
      outline: 'border-primary/30 border-t-primary',
      ghost: 'border-primary/30 border-t-primary',
      danger: 'border-white/30 border-t-white',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={disabled || isLoading}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full font-bold transition-colors disabled:opacity-50 disabled:pointer-events-none animate-shine',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {/* Children are hidden (not removed) during loading to preserve button width */}
        <span className={cn('inline-flex items-center gap-2', isLoading ? 'invisible' : 'visible')}>
          {children}
        </span>
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              'animate-spin rounded-full',
              spinnerSizes[size],
              spinnerColors[variant]
            )} />
          </span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
