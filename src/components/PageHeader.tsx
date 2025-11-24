/**
 * Standardized Page Header Component
 * Enterprise-grade, consistent header for all pages
 */

import { ReactNode } from 'react';

interface PageHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  stats?: {
    label: string;
    value: number | string;
    variant?: 'default' | 'success' | 'warning';
  }[];
  actions?: ReactNode;
  compact?: boolean;
}

export default function PageHeader({
  icon: Icon,
  title,
  description,
  stats,
  actions,
  compact = false,
}: PageHeaderProps) {
  return (
    <div className={`bg-card border-b border-border ${compact ? 'py-4 px-6' : 'py-6 px-6'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left side - Icon, Title, Description */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground truncate">{title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>

        {/* Right side - Stats and Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Stats */}
          {stats && stats.length > 0 && (
            <div className="flex items-center gap-2">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center px-3 py-2 bg-muted/50 rounded-lg border border-border"
                >
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
