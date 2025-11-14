'use client';

import React, { ReactNode } from 'react';

export interface DashboardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  className?: string;
}

export function DashboardLayout({ 
  children, 
  sidebar, 
  header, 
  className = '' 
}: DashboardLayoutProps) {
  return (
    <div className={`flex h-screen ${className}`}>
      {sidebar && (
        <aside className="w-64 border-r bg-card">
          {sidebar}
        </aside>
      )}
      
      <main className="flex-1 flex flex-col">
        {header && (
          <header className="border-b px-6 py-4">
            {header}
          </header>
        )}
        
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}