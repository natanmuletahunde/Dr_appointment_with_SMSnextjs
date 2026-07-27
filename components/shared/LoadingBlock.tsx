import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type LoadingBlockProps = {
  label?: string;
  className?: string;
};

export function LoadingBlock({
  label = "Loading…",
  className,
}: LoadingBlockProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dark-400 bg-dark-400 px-6 py-16",
        className
      )}
    >
      <Loader2
        className="size-8 animate-spin text-green-500"
        aria-hidden
      />
      <p className="text-14-regular text-dark-700">{label}</p>
      <span className="sr-only">{label}</span>
    </div>
  );
}
