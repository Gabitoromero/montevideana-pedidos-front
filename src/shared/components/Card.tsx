import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const paddingStyles = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, padding = 'md', className, ...props }, ref) => {
    const cardClasses = twMerge(
      clsx(
        'bg-dark-lighter rounded-lg shadow-md',
        paddingStyles[padding],
        className
      )
    );

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, ...props }, ref) => {
    const headerClasses = twMerge(
      clsx('border-b border-accent/30 pb-3 mb-3', className)
    );

    return (
      <div ref={ref} className={headerClasses} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className, ...props }, ref) => {
    const bodyClasses = twMerge(clsx('', className));

    return (
      <div ref={ref} className={bodyClasses} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, ...props }, ref) => {
    const footerClasses = twMerge(
      clsx('border-t border-accent/30 pt-3 mt-3', className)
    );

    return (
      <div ref={ref} className={footerClasses} {...props}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';
