import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4 border-2 border-dashed border-border rounded-lg bg-muted/10">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm mx-auto">{description}</p>
      {action && (
        <Button
          variant="outline"
          className="mt-6"
          onClick={action.onClick}
        >
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Button>
      )}
    </div>
  );
}
