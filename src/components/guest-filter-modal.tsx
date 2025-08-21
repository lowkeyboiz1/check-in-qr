'use client'

import { useAtom } from 'jotai'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, ArrowUpDown, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { guestFiltersAtom, updateGuestFiltersAtom, FilterStatus, SortField, SortOrder } from '@/store/atoms'
import { useSetAtom } from 'jotai'

interface GuestFilterModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GuestFilterModal({ isOpen, onClose }: GuestFilterModalProps) {
  const [filters] = useAtom(guestFiltersAtom)
  const updateFilters = useSetAtom(updateGuestFiltersAtom)

  const statusOptions: {
    value: FilterStatus
    label: string
    color: string
    icon: string
  }[] = [
    {
      value: 'all',
      label: 'Tất cả',
      color: 'bg-gray-100 text-gray-800',
      icon: '📋'
    },
    {
      value: 'checked-in',
      label: 'Đã check-in',
      color: 'bg-green-100 text-green-800',
      icon: '✅'
    },
    {
      value: 'not-checked-in',
      label: 'Chưa check-in',
      color: 'bg-orange-100 text-orange-800',
      icon: '⏳'
    }
  ]

  const sortOptions: { value: SortField; label: string; icon: string }[] = [
    { value: 'name', label: 'Tên', icon: '👤' },
    { value: 'checkedInAt', label: 'Thời gian check-in', icon: '⏰' },
    { value: 'createdAt', label: 'Thời gian tạo', icon: '📅' },
    { value: 'status', label: 'Trạng thái', icon: '🔄' }
  ]

  const handleStatusChange = (status: FilterStatus) => {
    updateFilters({ status })
  }

  const handleSortChange = (field: SortField) => {
    const newOrder: SortOrder = filters.sortField === field && filters.sortOrder === 'asc' ? 'desc' : 'asc'
    updateFilters({ sortField: field, sortOrder: newOrder })
  }

  const clearFilters = () => {
    updateFilters({
      status: 'all',
      sortField: 'name',
      sortOrder: 'asc'
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm' onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className='fixed inset-x-4 top-20 bottom-20 flex flex-col rounded-2xl bg-white shadow-2xl'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className='flex flex-shrink-0 items-center justify-between border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-6'>
              <div className='flex items-center gap-3'>
                <div className='rounded-full bg-blue-100 p-2'>
                  <Filter className='h-5 w-5 text-blue-600' />
                </div>
                <h2 className='text-xl font-semibold text-gray-900'>Bộ lọc & Sắp xếp</h2>
              </div>
              <Button variant='ghost' size='sm' onClick={onClose} className='h-8 w-8 rounded-full p-0 hover:bg-white/50'>
                <X className='h-5 w-5' />
              </Button>
            </div>

            <div className='min-h-0 flex-1 space-y-6 overflow-y-auto p-6'>
              {/* Status Filter */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium text-gray-900'>Trạng thái</h3>
                  <span className='rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-500'>{statusOptions.find((opt) => opt.value === filters.status)?.label}</span>
                </div>
                <div className='grid gap-3'>
                  {statusOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStatusChange(option.value)}
                      className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
                        filters.status === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        <span className='text-xl'>{option.icon}</span>
                        <span className='font-medium text-gray-900'>{option.label}</span>
                      </div>
                      {filters.status === option.value && <Check className='h-5 w-5 text-blue-600' />}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium text-gray-900'>Sắp xếp theo</h3>
                  <span className='rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-500'>
                    {sortOptions.find((opt) => opt.value === filters.sortField)?.label}
                    {filters.sortOrder === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                </div>
                <div className='grid gap-3'>
                  {sortOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSortChange(option.value)}
                      className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
                        filters.sortField === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        <span className='text-xl'>{option.icon}</span>
                        <span className='font-medium text-gray-900'>{option.label}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        {filters.sortField === option.value && <span className='font-medium text-blue-600'>{filters.sortOrder === 'asc' ? 'A→Z' : 'Z→A'}</span>}
                        {filters.sortField === option.value && <Check className='h-5 w-5 text-blue-600' />}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className='flex-shrink-0 border-t bg-gray-50 p-6'>
              <div className='flex gap-3'>
                <Button variant='outline' onClick={clearFilters} className='flex-1 border-gray-300 text-gray-700 hover:bg-gray-100'>
                  Đặt lại
                </Button>
                <Button onClick={onClose} className='flex-1 bg-blue-600 text-white hover:bg-blue-700'>
                  Áp dụng
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
