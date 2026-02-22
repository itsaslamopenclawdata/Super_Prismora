import React from 'react';
import { cn } from '../utils/cn';

export interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface NavbarProps {
  logo?: React.ReactNode;
  items?: NavItem[];
  actions?: React.ReactNode;
  variant?: 'default' | 'minimal' | 'transparent';
  position?: 'fixed' | 'sticky' | 'static';
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  logo,
  items = [],
  actions,
  variant = 'default',
  position = 'static',
  className,
}) => {
  const variantStyles = {
    default: 'bg-white border-b border-neutral-200 shadow-sm',
    minimal: 'bg-white',
    transparent: 'bg-transparent',
  };

  const positionStyles = {
    fixed: 'fixed top-0 left-0 right-0 z-50',
    sticky: 'sticky top-0 z-50',
    static: 'relative',
  };

  return (
    <nav
      className={cn(
        'w-full transition-all duration-200',
        variantStyles[variant],
        positionStyles[position],
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">{logo}</div>

          {/* Navigation Items */}
          {items.length > 0 && (
            <div className="hidden md:flex items-center space-x-1">
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  disabled={item.disabled}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    item.active
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                    item.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>

        {/* Mobile Navigation */}
        {items.length > 0 && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-1">
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  disabled={item.disabled}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    item.active
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-100',
                    item.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
