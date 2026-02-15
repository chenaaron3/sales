import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost"
    size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "default", size = "default", ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

        const variants = {
            default: "bg-[var(--color-nifty-teal)] text-[var(--color-nifty-teal-foreground)] hover:opacity-90 focus-visible:ring-[var(--color-nifty-teal)] dark:focus-visible:ring-gray-300",
            outline: "border border-border bg-card hover:bg-muted focus-visible:ring-ring",
            ghost: "hover:bg-muted focus-visible:ring-ring"
        }

        const sizes = {
            default: "h-10 px-5 py-2",
            sm: "h-9 rounded-lg px-4 text-sm",
            lg: "h-11 rounded-lg px-6"
        }

        return (
            <button
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }

