import * as React from 'react'
import {
  CaretSortIcon,
  CheckIcon,
} from '@radix-ui/react-icons'
import * as SelectPrimitive from '@radix-ui/react-select'
import { cn } from '@/lib/utils'

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <CaretSortIcon className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

// 👇 Enhanced Content with Search
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    searchable?: boolean
    items?: { id: string; label: string; meta?: string }[]
  }
>(({ className, position = 'popper', searchable, items, children, ...props }, ref) => {
  const [search, setSearch] = React.useState('')

  const filteredItems = React.useMemo(() => {
    if (!items) return []
    if (!search.trim()) return items
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(search.toLowerCase()) ||
        i.meta?.toLowerCase().includes(search.toLowerCase())
    )
  }, [items, search])

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
  ref={ref}
  className={cn(
    'relative z-50 max-h-96 min-w-[12rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    className
  )}
  position={position}
  // 👇 prevents Radix from stealing focus away from search input
  onPointerDownOutside={(e) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT') {
      e.preventDefault()
    }
  }}
  {...props}
>
  <SelectPrimitive.Viewport
    className={cn(
      'p-1',
      position === 'popper' &&
        'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
    )}
  >
    {searchable && (
      <div className="p-2">
        <input
          type="text"
          placeholder="Search patients..."
          className="w-full rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()} // ✅ blocks Radix typeahead
          onClick={(e) => e.stopPropagation()}   // ✅ keep focus in input
        />
      </div>
    )}

    {searchable && items
      ? filteredItems.map((i) => (
          <SelectItem key={i.id} value={i.id}>
            <div>
              <div>{i.label}</div>
              {i.meta && (
                <div className="text-xs text-muted-foreground">{i.meta}</div>
              )}
            </div>
          </SelectItem>
        ))
      : children}
  </SelectPrimitive.Viewport>
</SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem }
