import React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="h-12 w-48 animate-pulse rounded bg-muted mx-auto" />
        <div className="h-6 w-64 animate-pulse rounded bg-muted mx-auto" />
        <div className="space-y-2 pt-8">
          <div className="h-4 w-80 animate-pulse rounded bg-muted mx-auto" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted mx-auto" />
          <div className="h-4 w-76 animate-pulse rounded bg-muted mx-auto" />
        </div>
        <div className="h-12 w-32 animate-pulse rounded-lg bg-muted mx-auto mt-8" />
      </div>
    </div>
  );
}