import React from "react";
import { cn } from "utils";

type CardProps = {
    title?: string;
    className?: string;
    children: React.ReactNode;
};

export function Card({ title, className, children }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
                className,
            )}
        >
            {title ? (
                <h3 className="mb-3 text-base font-semibold">{title}</h3>
            ) : null}
            {children}
        </div>
    );
}
