'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  colorClass?: string;
  className?: string;
}

export function Progress({
  value,
  label,
  showPercentage = true,
  colorClass = 'bg-[#00A3E0]',
  className,
}: ProgressProps) {
  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm font-medium text-[#1F2933]">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-semibold text-[#0B2A4A]">{value}%</span>
          )}
        </div>
      )}
      <div className="h-2.5 w-full rounded-full bg-[#0B2A4A]/8">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', colorClass)}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
