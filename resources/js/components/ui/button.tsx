import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-none border-2 border-[var(--neutral-900)] text-sm font-bold whitespace-nowrap shadow-[2px_2px_0_0_var(--neutral-900)] transition-[transform,box-shadow,background-color] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[var(--brand-primary-hover)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_0_var(--neutral-900)] active:translate-x-px active:translate-y-px active:shadow-none",
        success:
          "bg-[var(--success)] text-white hover:bg-[var(--success)]/90 hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_0_var(--neutral-900)] active:translate-x-px active:translate-y-px active:shadow-none focus-visible:ring-[var(--success)]/40",
        destructive:
          "bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90 hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_0_var(--neutral-900)] active:translate-x-px active:translate-y-px active:shadow-none focus-visible:ring-[var(--danger)]/40",
        warning:
          "bg-[var(--warning)] text-amber-950 hover:bg-[var(--warning)]/90 hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_0_var(--neutral-900)] active:translate-x-px active:translate-y-px active:shadow-none focus-visible:ring-[var(--warning)]/40",
        info:
          "bg-[var(--info)] text-white hover:bg-[var(--info)]/90 hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_0_var(--neutral-900)] active:translate-x-px active:translate-y-px active:shadow-none focus-visible:ring-[var(--info)]/40",
        outline:
          "bg-background hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary-active)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "border-transparent bg-transparent shadow-none hover:bg-accent hover:text-accent-foreground hover:shadow-none hover:translate-none active:translate-none",
        link: "border-transparent bg-transparent shadow-none text-primary underline-offset-4 hover:underline hover:shadow-none hover:translate-none active:translate-none",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
