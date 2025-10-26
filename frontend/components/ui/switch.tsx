"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, React.ComponentProps<typeof SwitchPrimitive.Root>>(
  ({ className, children, ...props }, ref) => {
    return (
      <SwitchPrimitive.Root
        ref={ref}
        data-slot="switch"
        className={cn(
          "inline-flex h-6 w-10 items-center rounded-full bg-primary p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform")}
        />
      </SwitchPrimitive.Root>
    )
  }
)

Switch.displayName = "Switch"

export { Switch }
