"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-orange text-white hover:bg-brand-soft hover:text-brand-charcoal hover:shadow-orange-200",
  secondary:
    "border border-brand-orange text-brand-orange bg-transparent hover:bg-brand-soft hover:shadow-orange-200",
  ghost: "bg-transparent text-brand-charcoal hover:bg-brand-soft hover:shadow-orange-200",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium shadow-md transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-105 hover:shadow-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange disabled:pointer-events-none disabled:opacity-50",
        variantClassMap[variant],
        className
      )}
      {...props}
    />
  );
}
