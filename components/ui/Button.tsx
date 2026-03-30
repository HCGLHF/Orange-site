"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-orange text-white hover:bg-brand-soft hover:text-brand-charcoal",
  secondary:
    "border border-brand-orange text-brand-orange bg-transparent hover:bg-brand-soft",
  ghost: "bg-transparent text-brand-charcoal hover:bg-brand-soft",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange disabled:pointer-events-none disabled:opacity-50",
        variantClassMap[variant],
        className
      )}
      {...props}
    />
  );
}
