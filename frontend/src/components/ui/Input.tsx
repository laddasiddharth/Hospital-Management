"use client";

import { type InputHTMLAttributes, type ReactNode, useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  id?: string;
}

export default function Input({
  label,
  error,
  icon,
  rightIcon,
  className = "",
  id,
  type,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label
        htmlFor={inputId}
        className="text-[10px] font-black uppercase tracking-[0.15em] text-surface-400 pl-1"
      >
        {label}
      </label>
      <div className="relative group/input">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within/input:text-primary-500 transition-colors">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          className={`
            w-full rounded-2xl px-5 py-3.5
            bg-white text-surface-950 font-bold
            border-2 transition-all duration-300
            placeholder:text-surface-300 placeholder:font-medium
            focus:outline-none focus:ring-4 focus:ring-primary-500/10
            ${icon ? "pl-12" : ""}
            ${isPassword || rightIcon ? "pr-12" : ""}
            ${
              error
                ? "border-danger-200 focus:border-danger-500 bg-danger-50/10"
                : "border-surface-100 hover:border-surface-200 focus:border-primary-500"
            }
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-primary-600 transition-colors cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        )}
        {rightIcon && !isPassword && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="text-[10px] font-black text-danger-600 uppercase tracking-widest pl-1 animate-slide-up">
          {error}
        </p>
      )}
    </div>
  );
}
