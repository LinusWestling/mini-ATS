import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 md:flex-row md:justify-between md:items-center">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2 mt-4 md:mt-0">{children}</div>}
    </div>
  );
}
