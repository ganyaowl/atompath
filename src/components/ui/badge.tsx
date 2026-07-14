import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'accent';
}

const variantClasses = {
  default: 'bg-[#0B2A4A]/10 text-[#0B2A4A]',
  success: 'bg-[#3FAE5A]/10 text-[#3FAE5A]',
  warning: 'bg-[#F5A623]/10 text-[#F5A623]',
  accent: 'bg-[#00A3E0]/10 text-[#00A3E0]',
};

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
