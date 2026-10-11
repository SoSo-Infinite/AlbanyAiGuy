"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,box-shadow,transform,opacity] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-40 motion-safe:active:not-disabled:scale-[0.96] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(190,236,250,0.5),0_8px_24px_rgba(126,200,227,0.22)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_0_0_1px_rgba(230,248,255,0.85),0_12px_32px_rgba(126,200,227,0.4),0_0_40px_rgba(224,176,58,0.22)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_0_0_1px_rgba(126,200,227,0.45),0_10px_28px_rgba(0,200,240,0.16)]",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-secondary motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-primary/40 motion-safe:hover:shadow-[0_0_0_1px_rgba(126,200,227,0.35),0_8px_24px_rgba(0,200,240,0.12)]",
        ghost:
          "text-muted-foreground hover:bg-secondary hover:text-foreground motion-safe:hover:-translate-y-px",
        destructive:
          "bg-destructive text-primary-foreground hover:opacity-90 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_8px_24px_rgba(217,119,106,0.28)]",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-5",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
