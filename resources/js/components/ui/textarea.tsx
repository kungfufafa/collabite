import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-none border-2 border-[var(--neutral-900)] bg-background px-3 py-2 text-base shadow-[2px_2px_0_0_var(--neutral-900)] transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-[var(--brand-primary)] focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[var(--danger)] aria-invalid:ring-2 aria-invalid:ring-[var(--danger)]/25 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
