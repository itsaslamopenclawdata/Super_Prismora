import React from 'react';
import { cn } from '../utils/cn';
import { NavItem } from './Navbar';

export interface SidebarProps {
  items: NavItem[];
  collapsed?: boolean;
  onCollapse?: () => void;
  variant?: 'default' | 'dark' | 'minimal';
  position?: 'left' | 'right';
  className?: string;
  children?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  collapsed = false,
  onCollapse,
  variant = 'default',
  position = 'left',
  className,
  children,
}) => {
  const variantStyles = {
    default: 'bg-white border-r border-neutral-200',
    dark: 'bg-neutral-900 text-white',
    minimal: 'bg-neutral-50',
  };

  const textStyles = {
    default: 'text-neutral-700',
    dark: 'text-white',
    minimal: 'text-neutral-600',
  };

  const hoverStyles = {
    default: 'hover:bg-neutral-100',
    dark: 'hover:bg-neutral-800',
    minimal: 'hover:bg-neutral-200',
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen transition-all duration-300 ease-in-out',
        variantStyles[variant],
        collapsed ? 'w-16' : 'w-64',
        position === 'right' && 'order-last',
        className
      )}
    >
      {/* Collapse Toggle */}
      {onCollapse && (
        <div className={cn('flex items-center justify-end p-2', hoverStyles[variant])}>
          <button
            onClick={onCollapse}
            className={cn(
              'p-1.5 rounded transition-colors',
              textStyles[variant],
              hoverStyles[variant]
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className={cn('w-5 h-5 transition-transform', collapsed && 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1 px-2">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              disabled={item.disabled}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                item.active
                  ? 'bg-primary-600 text-white'
                  : cn(textStyles[variant], hoverStyles[variant]),
                item.disabled && 'opacity-50 cursor-not-allowed',
                collapsed && 'justify-center px-0'
              )}
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom Content */}
      {children && (
        <div className="p-4 border-t border-neutral-200">
          {!collapsed && children}
        </div>
      )}
    </aside>
  );
};
