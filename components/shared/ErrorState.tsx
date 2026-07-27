import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-red-600/40 bg-red-600/10 px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-red-600/20 text-red-500">
        <AlertTriangle className="size-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-18-bold text-light-200">{title}</h3>
        <p className="text-14-regular max-w-md text-dark-700">{message}</p>
      </div>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          className="shad-gray-btn mt-2"
          onClick={onRetry}
        >
          Try again
        </Button>
      ) : null}
    </div>
  );
}
