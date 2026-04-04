"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: ReactNode;
}

const variantClasses = {
  primary:
    "bg-primary-600 text-white shadow-xl shadow-primary-500/10 hover:shadow-primary-500/30 hover:bg-primary-500 active:bg-primary-700 border border-primary-500",
  secondary:
    "bg-white text-surface-950 border border-surface-200 shadow-sm hover:bg-surface-50 hover:border-surface-300 active:bg-surface-100",
  ghost:
    "text-surface-600 hover:text-surface-950 hover:bg-surface-100 active:bg-surface-200",
  danger:
    "bg-danger-50 text-danger-700 border border-danger-100 hover:bg-danger-100 hover:text-danger-800 active:bg-danger-200",
};

const sizeClasses = {
  sm: "px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl",
  md: "px-6 py-3 text-sm font-black uppercase tracking-widest rounded-2xl",
  lg: "px-8 py-4 text-base font-black uppercase tracking-widest rounded-[1.5rem]",
};

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-3
        transition-all duration-300 ease-out
        cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:grayscale
        active:scale-95
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
