"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Input, type InputProps } from "@/components/ui/input";

type PasswordFieldProps = Omit<InputProps, "type" | "trailingAction">;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      type={visible ? "text" : "password"}
      trailingAction={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="flex size-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/20"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      }
      {...props}
    />
  );
}
