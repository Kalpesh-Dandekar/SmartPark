"use client";

import { useId, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  id,
  label,
  error,
  helperText,
  className,
  disabled,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const description = error ?? helperText;
  const descriptionId = description ? `${inputId}-description` : undefined;

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-slate-800"
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
        className={cn(
          "h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-base text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 sm:text-sm",
          error && "border-red-500 focus:border-red-600 focus:ring-red-600/15",
          className,
        )}
        {...props}
      />
      {description ? (
        <p
          id={descriptionId}
          className={cn(
            "mt-1.5 text-sm text-slate-500",
            error && "text-red-700",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
