'use client'

import { useState, useCallback, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { searchFilterSchema, type SearchFilterData } from '@/lib/validations'
import { useDebounce } from '@/hooks/useDebounce'

interface OptimizedSearchInputProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
}

export function OptimizedSearchInput({ onSearch, placeholder = 'Tìm kiếm...', className, debounceMs = 300 }: OptimizedSearchInputProps) {
  const { control, watch, setValue, handleSubmit } = useForm<SearchFilterData>({
    resolver: zodResolver(searchFilterSchema),
    defaultValues: {
      searchQuery: ''
    }
  })

  const searchQuery = watch('searchQuery')
  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs)

  // Trigger search when debounced value changes
  useMemo(() => {
    onSearch(debouncedSearchQuery)
  }, [debouncedSearchQuery, onSearch])

  const handleClear = useCallback(() => {
    setValue('searchQuery', '')
  }, [setValue])

  const onSubmit = useCallback(
    (data: SearchFilterData) => {
      onSearch(data.searchQuery)
    },
    [onSearch]
  )

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className='relative'>
        <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
        <Controller
          name='searchQuery'
          control={control}
          render={({ field, fieldState }) => (
            <input
              {...field}
              type='text'
              placeholder={placeholder}
              className='w-full rounded-lg border border-gray-200 bg-white py-2 pr-10 pl-10 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500'
            />
          )}
        />
        {searchQuery && (
          <Button type='button' variant='ghost' size='sm' onClick={handleClear} className='absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 transform rounded-full p-0 hover:bg-gray-100'>
            <X className='h-3 w-3 text-gray-400' />
          </Button>
        )}
      </form>
    </div>
  )
}
