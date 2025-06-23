import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: Array<{
    value: string
    label: string
    icon?: React.ReactNode
    count?: number
    description?: string
  }>
  placeholder?: string
  className?: string
  width?: string
}

const EnhancedSelect = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  EnhancedSelectProps
>(({ value, onValueChange, options, placeholder, className, width = "w-40", ...props }, ref) => {
  const selectedOption = options.find(option => option.value === value)

  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          "enhanced-select-trigger flex h-11 items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition-all duration-200 hover:border-purple-300 hover:shadow-md focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:border-purple-400 dark:focus:border-purple-400 dark:focus:ring-purple-800",
          width,
          className
        )}
        {...props}
      >
        <div className="flex items-center space-x-2">
          {selectedOption?.icon && (
            <span className="flex-shrink-0 text-purple-600 dark:text-purple-400">
              {selectedOption.icon}
            </span>
          )}
          <SelectPrimitive.Value placeholder={placeholder}>
            <span className="truncate">{selectedOption?.label}</span>
          </SelectPrimitive.Value>
          {selectedOption?.count !== undefined && (
            <span className="ml-1 rounded-md bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {selectedOption.count}
            </span>
          )}
        </div>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            "relative z-50 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in-0 zoom-in-95 dark:border-gray-600 dark:bg-gray-700",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          )}
          position="popper"
          sideOffset={8}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "enhanced-select-item relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 pl-10 pr-3 text-sm outline-none transition-colors duration-150 hover:bg-purple-50 focus:bg-purple-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:bg-purple-900/20 dark:focus:bg-purple-900/20",
                  value === option.value && "bg-purple-50 text-purple-900 dark:bg-purple-900/30 dark:text-purple-100"
                )}
              >
                <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
                  <SelectPrimitive.ItemIndicator>
                    <Check className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </SelectPrimitive.ItemIndicator>
                </span>
                
                <div className="flex items-center space-x-2 flex-1">
                  {option.icon && (
                    <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                      {option.icon}
                    </span>
                  )}
                  <div className="flex-1">
                    <SelectPrimitive.ItemText>
                      <span className="font-medium">{option.label}</span>
                    </SelectPrimitive.ItemText>
                    {option.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {option.count !== undefined && (
                    <span className="flex-shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                      {option.count}
                    </span>
                  )}
                </div>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
})

EnhancedSelect.displayName = "EnhancedSelect"

export { EnhancedSelect } 