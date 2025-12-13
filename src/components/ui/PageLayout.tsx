import React from 'react';
import { clsx } from 'clsx';

interface PageLayoutProps {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

/**
 * Shared page scaffold to keep padding/header spacing consistent across views.
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  actions,
  children,
  className,
  headerClassName,
}) => {
  const hasHeader = title || actions;

  return (
    <div className={clsx('p-4 md:p-8', className)}>
      {hasHeader && (
        <div className={clsx('flex items-center justify-between mb-6', headerClassName)}>
          {typeof title === 'string' ? (
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          ) : (
            title
          )}
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
