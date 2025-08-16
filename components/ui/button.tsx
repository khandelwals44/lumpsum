import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus-visible:ring-blue-500",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:from-red-700 hover:to-red-800 hover:shadow-xl focus-visible:ring-red-500",
        outline:
          "border-2 border-zinc-200 bg-white/80 backdrop-blur-sm text-zinc-900 shadow-sm hover:bg-white hover:shadow-md focus-visible:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:bg-zinc-900",
        secondary:
          "bg-gradient-to-r from-zinc-100 to-zinc-200 text-zinc-900 shadow-sm hover:from-zinc-200 hover:to-zinc-300 hover:shadow-md focus-visible:ring-zinc-500 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-100 dark:hover:from-zinc-700 dark:hover:to-zinc-800",
        ghost:
          "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-zinc-500 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
        link: "text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500 dark:text-blue-400",
        premium:
          "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white shadow-lg hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 hover:shadow-xl focus-visible:ring-purple-500"
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-lg px-3",
        lg: "h-14 rounded-xl px-8 text-base",
        xl: "h-16 rounded-xl px-10 text-lg font-semibold",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
