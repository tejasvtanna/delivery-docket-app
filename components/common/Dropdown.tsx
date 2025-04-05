import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'
import { Check, ChevronUp, ChevronDown, X } from 'lucide-react'

type Option = {
  [key: string]: any
}

const asChild = true
const showPopoverAsModal = true

interface MultiSelectProps {
  placeholder?: string
  options: Option[] | null | undefined
  isLoadingOptions?: boolean
  value: Option | Option[] | null
  onChange: (value: Option[] | Option | null) => void
  valuePropName?: string
  labelPropName?: string
  className?: string
  maxDisplayCount?: number
  multiSelect?: boolean
  disabled?: boolean
  showClearIcon?: boolean
  getDisplayFormat?: (option: Option) => string
}

export const Dropdown: React.FC<MultiSelectProps> = ({
  placeholder = '',
  options: rawOptions,
  isLoadingOptions = false,
  onChange,
  value,
  valuePropName = 'value',
  labelPropName = 'label',
  className = '',
  maxDisplayCount = Number.MAX_SAFE_INTEGER,
  multiSelect = false,
  disabled = false,
  showClearIcon = false,
  getDisplayFormat = null
}) => {
  const options = rawOptions || []
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const selectedValue: Option[] = value
    ? multiSelect
      ? (value as Option[])
      : [value]
    : []

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setIsPopoverOpen(true)
    } else if (event.key === 'Backspace' && !event.currentTarget.value) {
      if (!selectedValue.length) return

      if (multiSelect) {
        const newSelectedValues = [...selectedValue]
        newSelectedValues.pop()
        onChange(newSelectedValues)
      } else {
        onChange(null)
      }
    }
  }

  const toggleOption = (option: Option) => {
    if (multiSelect) {
      const isSelected = selectedValue.some(
        (selOption: Option) =>
          selOption[valuePropName] === option[valuePropName]
      )

      const newSelectedValues = isSelected
        ? selectedValue.filter(
            (selOption: Option) =>
              selOption[valuePropName] !== option[valuePropName]
          )
        : [...selectedValue, option]

      onChange(newSelectedValues)
    } else {
      onChange(option)
      setIsPopoverOpen(false)
    }
  }

  const handleClear = () => {
    if (multiSelect) {
      onChange([])
    } else {
      onChange(null)
    }
  }

  const toggleAll = () => {
    if (selectedValue.length === options.length) {
      onChange([])
    } else {
      onChange(options)
    }
  }

  return (
    <Popover
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
      modal={showPopoverAsModal}
    >
      <PopoverTrigger asChild={asChild}>
        <Button
          disabled={disabled}
          onClick={() => setIsPopoverOpen((prev) => !prev)}
          className={cn(
            'flex w-full p-1 rounded-md border h-auto min-h-12 items-center justify-between bg-inherit hover:bg-inherit [&_svg]:pointer-events-auto',
            className
          )}
        >
          {/* Show multiple selected values in badges */}
          {multiSelect && !!selectedValue.length && (
            <div className='flex justify-between items-center w-full'>
              <div className='flex flex-wrap items-center gap-1'>
                {selectedValue.slice(0, maxDisplayCount).map((option) => (
                  <Badge
                    key={option[valuePropName]}
                    className='bg-grey-5 text-grey-1 text-base font-medium h-7 w-fit p-3 rounded'
                  >
                    {getDisplayFormat
                      ? getDisplayFormat(option)
                      : option[labelPropName]}
                    <X
                      className='ml-2 h-4 w-4 cursor-pointer'
                      onClick={(event) => {
                        event.stopPropagation()
                        toggleOption(option)
                      }}
                    />
                  </Badge>
                ))}
                {selectedValue.length > maxDisplayCount && (
                  <Badge className='bg-grey-5 text-grey-1 text-base font-medium'>
                    {`+ ${selectedValue.length - maxDisplayCount} more`}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Show single selected value */}
          {!multiSelect && !!selectedValue.length && (
            <div className='text-base text-grey-1 font-normal ml-2 flex items-center min-w-0'>
              <span className='truncate'>
                {getDisplayFormat
                  ? getDisplayFormat(selectedValue[0])
                  : selectedValue[0][labelPropName]}
              </span>
            </div>
          )}

          {/* Clear all Icon + Down/up icon */}
          {!!selectedValue.length && (
            <div className='flex items-center justify-between'>
              {showClearIcon && (
                <>
                  <X
                    className='h-4 mx-2 cursor-pointer text-grey-1'
                    onClick={(event) => {
                      event.stopPropagation()
                      handleClear()
                    }}
                    // title={multiSelect ? 'Clear all' : 'Clear'}
                  />
                  <Separator
                    orientation='vertical'
                    className='flex min-h-6 h-full bg-grey-4'
                  />
                </>
              )}
              {isPopoverOpen ? (
                <ChevronUp className='h-5 w-5 mx-2 cursor-pointer text-muted-foreground' />
              ) : (
                <ChevronDown className='h-5 w-5 mx-2 cursor-pointer text-muted-foreground' />
              )}
            </div>
          )}

          {/* Placeholder + Down/up icon */}
          {!selectedValue.length && (
            <>
              <span className='text-base mx-3 text-grey-3 font-medium'>
                {placeholder}
              </span>
              {isPopoverOpen ? (
                <ChevronUp className='h-5 w-5 mx-2 cursor-pointer text-muted-foreground' />
              ) : (
                <ChevronDown className='h-5 w-5 mx-2 cursor-pointer text-muted-foreground' />
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className='p-0 min-w-[var(--radix-popover-trigger-width)] w-[var(--radix-popover-trigger-width)]'
        align='start'
        onEscapeKeyDown={() => setIsPopoverOpen(false)}
      >
        <Command>
          <CommandInput
            placeholder='Search...'
            onKeyDown={handleInputKeyDown}
          />
          <CommandList>
            {/* Show CommandEmpty when options is empty */}
            {options.length === 0 && !isLoadingOptions && (
              <CommandEmpty className='text-base p-4 text-grey-2'>
                No options found.
              </CommandEmpty>
            )}

            {/* Show Loading... */}
            {isLoadingOptions && (
              <CommandEmpty className='text-base p-4 text-grey-2'>
                Loading...
              </CommandEmpty>
            )}

            {options.length > 0 && !isLoadingOptions && (
              <CommandGroup className='bp-0'>
                {multiSelect && (
                  <CommandItem
                    key='all'
                    onSelect={toggleAll}
                    className={cn(
                      'cursor-pointer text-base px-[14px] py-[10px] hover:bg-grey-5',
                      selectedValue.length === options.length && 'bg-grey-5'
                    )}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        selectedValue.length === options.length
                          ? 'bg-primary'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className='h-4 w-4 text-white' />
                    </div>
                    <span>(Select All)</span>
                  </CommandItem>
                )}

                {options.map((option) => {
                  const isSelected = selectedValue.some(
                    (value) => value[valuePropName] === option[valuePropName]
                  )
                  return (
                    <CommandItem
                      key={option[valuePropName]}
                      onSelect={() => toggleOption(option)}
                      className={cn(
                        'cursor-pointer text-base px-[14px] py-[10px] hover:bg-grey-5',
                        isSelected && 'bg-grey-5'
                      )}
                    >
                      {multiSelect && (
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                            isSelected
                              ? 'bg-primary'
                              : 'opacity-50 [&_svg]:invisible'
                          )}
                        >
                          <Check className='h-4 w-4 text-white' />
                        </div>
                      )}
                      <span>
                        {getDisplayFormat
                          ? getDisplayFormat(option)
                          : option[labelPropName]}
                      </span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
            <CommandSeparator />
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

Dropdown.displayName = 'Dropdown'
