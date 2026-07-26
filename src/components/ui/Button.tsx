import { cn } from "@/utils/cn";
import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "outline";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export default function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300";

  const variants: Record<ButtonVariant, string> = {
    primary: "bg-[#2c6e9b] text-white hover:scale-[1.02] hover:shadow-md",
    secondary: "bg-[#AABBCC] text-[#1a1a1a] hover:scale-[1.02] hover:shadow-md",
    outline:
      "bg-transparent text-[var(--text)] border border-gray-600 hover:bg-gray-50",
  };

  const { disabled } = props;
  return (
    <button
      className={cn(
        base,
        variants[variant],
        disabled
          ? "opacity-50 cursor-not-allowed pointer-events-none"
          : undefined,
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
}
