import Link from "next/link";
import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyActionConfig = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: EmptyActionConfig | React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
};

function isActionConfig(
  action: EmptyActionConfig | React.ReactNode
): action is EmptyActionConfig {
  return (
    typeof action === "object" &&
    action !== null &&
    "label" in action &&
    typeof (action as EmptyActionConfig).label === "string"
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
  icon,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-dark-500 bg-dark-400 px-6 py-14 text-center",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-dark-300 text-green-500">
        {icon ?? <Inbox className="size-6" aria-hidden />}
      </div>
      <div className="space-y-1">
        <h3 className="text-18-bold text-light-200">{title}</h3>
        {description ? (
          <p className="text-14-regular max-w-md text-dark-700">{description}</p>
        ) : null}
      </div>
      {action ? (
        isActionConfig(action) ? (
          action.href ? (
            <Button asChild className="shad-primary-btn mt-2">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button
              type="button"
              className="shad-primary-btn mt-2"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )
        ) : (
          <div className="mt-2">{action}</div>
        )
      ) : null}
    </div>
  );
}
