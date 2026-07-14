'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className,
}: SelectProps) {
  return (
    <div className={cn('w-full', className)}>
      <label className="block text-sm font-medium text-[#1F2933] mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-4 py-3 text-[#1F2933] focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20 focus:outline-none transition-all appearance-none cursor-pointer"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
