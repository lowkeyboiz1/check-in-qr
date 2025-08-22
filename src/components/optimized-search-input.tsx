'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/useDebounce'

interface OptimizedSearchInputProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
}

export const OptimizedSearchInput = memo(function OptimizedSearchInput({ onSearch, placeholder = 'Tìm kiếm...', className, debounceMs = 300 }: OptimizedSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs)

  // Trigger search when debounced value changes
  useMemo(() => {
    onSearch(debouncedSearchQuery)
  }, [debouncedSearchQuery, onSearch])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleClear = useCallback(() => {
    setSearchQuery('')
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      onSearch(searchQuery)
    },
    [onSearch, searchQuery]
  )

  return (
    <div className={`relative ${className || ''}`}>
      <form onSubmit={handleSubmit} className='relative'>
        <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
        <input
          type='text'
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          className='h-11 w-full rounded-xl border border-gray-200 bg-white pr-4 pl-10 text-sm shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:shadow-md focus:ring-2 focus:ring-blue-500/10'
        />
        {searchQuery && (
          <Button type='button' variant='ghost' size='sm' onClick={handleClear} className='absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 transform rounded-full p-0 hover:bg-gray-100'>
            <X className='h-3 w-3 text-gray-400' />
          </Button>
        )}
      </form>
    </div>
  )
})
