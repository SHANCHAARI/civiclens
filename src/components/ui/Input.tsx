import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full h-10 px-3.5 rounded-lg text-sm",
            "bg-[var(--bg-secondary)] border border-[var(--border)]",
            "text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
            "focus:outline-none focus:border-[var(--accent-civic)] focus:ring-1 focus:ring-[var(--ring)]",
            "transition-all duration-200",
            error && "border-[var(--accent-red)] focus:border-[var(--accent-red)] focus:ring-[var(--accent-red)]/30",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--accent-red)]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
