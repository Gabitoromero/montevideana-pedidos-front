import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeVariant = 'pending' | 'processing' | 'ready' | 'delivered' | 'canceled';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  processing: 'bg-blue-100 text-blue-800 border-blue-300',
  ready: 'bg-green-100 text-green-800 border-green-300',
  delivered: 'bg-gray-100 text-gray-800 border-gray-300',
  canceled: 'bg-red-100 text-red-800 border-red-300',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant, children, className, ...props }, ref) => {
    const badgeClasses = twMerge(
      clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )
    );

    return (
      <span ref={ref} className={badgeClasses} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
