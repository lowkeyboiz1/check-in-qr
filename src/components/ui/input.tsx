'use client'

import * as React from 'react'
import { FieldError } from 'react-hook-form'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError | string
  label?: string
  icon?: React.ReactNode
  required?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, error, label, icon, required, ...props }, ref) => {
  const errorMessage = typeof error === 'string' ? error : error?.message

  return (
    <div className='space-y-2'>
      {label && (
        <div className='flex items-center space-x-2'>
          {icon && <span className='h-4 w-4 text-gray-500'>{icon}</span>}
          <label className='text-sm font-medium text-gray-700'>
            {label} {required && <span className='text-red-500'>*</span>}
          </label>
        </div>
      )}
      <input
        type={type}
        className={cn(
          'ring-offset-background placeholder:text-muted-foreground flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          errorMessage && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        ref={ref}
        {...props}
      />
      {errorMessage && <p className='text-sm text-red-500'>{errorMessage}</p>}
    </div>
  )
})

Input.displayName = 'Input'

export { Input }
