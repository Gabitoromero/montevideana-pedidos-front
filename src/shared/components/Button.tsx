import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'golden';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-400',
  golden: 'bg-primary text-dark hover:bg-primary-light active:bg-primary-dark disabled:bg-primary/50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const buttonClasses = twMerge(
      clsx(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )
    );

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={buttonClasses}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
        ) : (
          LeftIcon && <LeftIcon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
        )}
        {children}
        {!isLoading && RightIcon && <RightIcon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
      </button>
    );
  }
);

Button.displayName = 'Button';
