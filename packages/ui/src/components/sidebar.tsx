'use client';

import React, { ReactNode } from 'react';
import { Button } from './button';

export interface SidebarProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}

export interface SidebarItemProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  variant?: 'primary' | 'ghost';
}

export function Sidebar({ title, subtitle, children, className = '' }: SidebarProps) {
  return (
    <div className={`p-4 ${className}`}>
      <div className="mb-8">
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <nav className="space-y-2">
        {children}
      </nav>
    </div>
  );
}

export function SidebarItem({
  children,
  active = false,
  onClick,
  variant = 'ghost'
}: SidebarItemProps) {
  return (
    <Button
      variant={active ? 'primary' : variant}
      className="w-full justify-start"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
