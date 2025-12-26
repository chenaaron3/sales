import * as React from 'react';

import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';

const ToggleGroup = React.forwardRef<
    React.ElementRef<typeof ToggleGroupPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
    <ToggleGroupPrimitive.Root
        ref={ref}
        className={`inline-flex items-center justify-center rounded-md bg-gray-100 p-1 gap-1 dark:bg-gray-800 ${className || ""}`}
        {...props}
    />
))
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef<
    React.ElementRef<typeof ToggleGroupPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
    <ToggleGroupPrimitive.Item
        ref={ref}
        className={`inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-indigo-600 data-[state=on]:text-white data-[state=on]:shadow-md data-[state=on]:font-semibold data-[state=off]:text-gray-600 data-[state=off]:hover:text-gray-900 data-[state=off]:hover:bg-gray-200 dark:focus-visible:ring-gray-300 dark:data-[state=on]:bg-indigo-600 dark:data-[state=on]:text-white dark:data-[state=off]:text-gray-400 dark:data-[state=off]:hover:text-gray-200 dark:data-[state=off]:hover:bg-gray-700 ${className || ""}`}
        {...props}
    />
))
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }

