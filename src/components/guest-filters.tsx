'use client'

import { useAtom } from 'jotai'
import { motion } from 'framer-motion'
import { Filter, ArrowUpDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { OptimizedSearchInput } from '@/components/optimized-search-input'
import { guestFiltersAtom, updateGuestFiltersAtom, showAddGuestModalAtom, FilterStatus, SortField, SortOrder } from '@/store/atoms'
import { useSetAtom } from 'jotai'

export function GuestFilters() {
  const [filters] = useAtom(guestFiltersAtom)
  const updateFilters = useSetAtom(updateGuestFiltersAtom)
  const setShowAddModal = useSetAtom(showAddGuestModalAtom)

  const statusOptions: { value: FilterStatus; label: string; color: string }[] = [
    { value: 'all', label: 'Tất cả', color: 'bg-gray-100 text-gray-800' },
    {
      value: 'checked-in',
      label: 'Đã check-in',
      color: 'bg-green-100 text-green-800'
    },
    {
      value: 'not-checked-in',
      label: 'Chưa check-in',
      color: 'bg-orange-100 text-orange-800'
    }
  ]

  const sortOptions: { value: SortField; label: string }[] = [
    { value: 'name', label: 'Tên' },
    { value: 'checkedInAt', label: 'Thời gian check-in' },
    { value: 'createdAt', label: 'Thời gian tạo' },
    { value: 'status', label: 'Trạng thái' }
  ]

  const handleSearchChange = (value: string) => {
    updateFilters({ searchTerm: value })
  }

  const handleStatusChange = (status: FilterStatus) => {
    updateFilters({ status })
  }

  const handleSortChange = (field: SortField) => {
    const newOrder: SortOrder = filters.sortField === field && filters.sortOrder === 'asc' ? 'desc' : 'asc'
    updateFilters({ sortField: field, sortOrder: newOrder })
  }

  return (
    <div className='space-y-4'>
      {/* Search and Add Button */}
      <div className='flex gap-2'>
        <OptimizedSearchInput onSearch={handleSearchChange} placeholder='Tìm kiếm theo tên, email hoặc số điện thoại...' className='flex-1' debounceMs={300} />
        <Button onClick={() => setShowAddModal(true)} className='bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'>
          <Plus className='mr-1 h-4 w-4' />
          Thêm
        </Button>
      </div>

      {/* Status Filter */}
      <Card className='p-3'>
        <div className='mb-2 flex items-center gap-2'>
          <Filter className='h-4 w-4 text-gray-500' />
          <span className='text-sm font-medium text-gray-700'>Lọc theo trạng thái:</span>
        </div>
        <div className='flex gap-2 overflow-x-auto pb-1'>
          {statusOptions.map((option) => (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStatusChange(option.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap transition-all ${
                filters.status === option.value ? option.color + ' ring-2 ring-blue-500' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Sort Options */}
      <Card className='p-3'>
        <div className='mb-2 flex items-center gap-2'>
          <ArrowUpDown className='h-4 w-4 text-gray-500' />
          <span className='text-sm font-medium text-gray-700'>Sắp xếp theo:</span>
        </div>
        <div className='flex gap-2 overflow-x-auto pb-1'>
          {sortOptions.map((option) => (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSortChange(option.value)}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap transition-all ${
                filters.sortField === option.value ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {option.label}
              {filters.sortField === option.value && <span className='text-xs'>{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>}
            </motion.button>
          ))}
        </div>
      </Card>
    </div>
  )
}
