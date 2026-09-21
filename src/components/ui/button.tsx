import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-xl font-bold transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer ";
    let v = "bg-sky-500 text-slate-950 hover:bg-sky-400 ";
    if (variant === "outline") v = "border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white ";
    if (variant === "ghost") v = "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800 ";
    if (variant === "destructive") v = "bg-rose-600 text-white hover:bg-rose-700 ";
    if (variant === "secondary") v = "bg-slate-800 text-white hover:bg-slate-700 ";

    let s = "px-4 py-2 text-xs ";
    if (size === "sm") s = "px-3 py-1.5 text-xs ";
    if (size === "lg") s = "px-6 py-3 text-sm ";
    if (size === "icon") s = "size-8 p-1.5 ";

    return <button ref={ref} className={`${base}${v}${s}${className}`} {...props} />;
  }
);
Button.displayName = "Button";
