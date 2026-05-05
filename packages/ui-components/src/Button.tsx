import React from "react";
import { cn } from "utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
};

const baseStyles =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 disabled:pointer-events-none disabled:opacity-50";

const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-green-600 text-white hover:bg-green-700",
    secondary:
        "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-900 hover:bg-slate-100",
};

export function Button({
    className,
    variant = "primary",
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(baseStyles, variantStyles[variant], className)}
            {...props}
        />
    );
}
