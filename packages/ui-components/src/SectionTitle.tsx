import React from "react";
import { cn } from "utils";

type SectionTitleProps = {
    title: string;
    subtitle?: string;
    className?: string;
};

export function SectionTitle({
    title,
    subtitle,
    className,
}: SectionTitleProps) {
    return (
        <div className={cn("space-y-1", className)}>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            {subtitle ? (
                <p className="text-sm text-slate-500">{subtitle}</p>
            ) : null}
        </div>
    );
}
