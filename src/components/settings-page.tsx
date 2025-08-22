'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAtom, useSetAtom } from 'jotai'
import { guestsAtom, checkedInCountAtom } from '@/store/atoms'
import { Trash2, Download, Info, Users, Upload } from 'lucide-react'
import Link from 'next/link'

export function SettingsPage() {
  const [allGuests] = useAtom(guestsAtom)
  const [checkedInCount] = useAtom(checkedInCountAtom)
  // const [checkedInGuests] = useAtom(checkedInGuestsAtom)
  const setGuests = useSetAtom(guestsAtom)

  const handleClearData = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu check-in?')) {
      setGuests([])
    }
  }

  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      totalGuests: allGuests.length,
      checkedInCount: checkedInCount,
      guests: allGuests
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `checkin-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const attendanceRate = allGuests.length > 0 ? Math.round((checkedInCount / allGuests.length) * 100) : 0

  return (
    <div className='flex h-full flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50/50'>
      {/* Mobile Header */}
      <div className='flex-shrink-0 border-b border-gray-200/50 bg-white/95 px-4 py-4 backdrop-blur-xl'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900'>Cài đặt</h1>
          <p className='mt-1 text-sm text-gray-600'>Quản lý và thống kê sự kiện</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className='custom-scrollbar flex-1 space-y-4 overflow-y-auto px-4 pt-4 pb-6'>
        {/* Enhanced Statistics Card */}
        <Card className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm'>
          <div className='mb-4 flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600'>
              <Users className='h-5 w-5 text-white' />
            </div>
            <div>
              <h3 className='font-semibold text-gray-900'>Thống kê sự kiện</h3>
              <p className='text-xs text-gray-500'>Tình hình check-in hiện tại</p>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-4'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-emerald-700'>{checkedInCount}</p>
                <p className='mt-1 text-sm font-medium text-emerald-600'>Đã check-in</p>
              </div>
            </div>

            <div className='rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-blue-700'>{attendanceRate}%</p>
                <p className='mt-1 text-sm font-medium text-blue-600'>Tỷ lệ tham gia</p>
              </div>
            </div>

            <div className='rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-4'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-amber-700'>{allGuests.length - checkedInCount}</p>
                <p className='mt-1 text-sm font-medium text-amber-600'>Chưa đến</p>
              </div>
            </div>

            <div className='rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-gray-700'>{allGuests.length}</p>
                <p className='mt-1 text-sm font-medium text-gray-600'>Tổng khách</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Data Management Card */}
        <Card className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm'>
          <div className='mb-4 flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600'>
              <Download className='h-5 w-5 text-white' />
            </div>
            <div>
              <h3 className='font-semibold text-gray-900'>Quản lý dữ liệu</h3>
              <p className='text-xs text-gray-500'>Xuất và xóa dữ liệu</p>
            </div>
          </div>

          <div className='space-y-3'>
            <Link href='/import-csv'>
              <Button variant='outline' size='lg' className='touch-target h-12 w-full justify-start rounded-xl border-gray-200 transition-all duration-200 hover:bg-gray-50'>
                <Upload className='mr-3 h-4 w-4' />
                <div className='text-left'>
                  <p className='font-medium'>Import CSV</p>
                  <p className='text-xs text-gray-500'>Nhập danh sách khách từ file CSV</p>
                </div>
              </Button>
            </Link>

            <Button
              onClick={handleExportData}
              variant='outline'
              size='lg'
              className='touch-target h-12 w-full justify-start rounded-xl border-gray-200 transition-all duration-200 hover:bg-gray-50'
              disabled={allGuests.length === 0}
            >
              <Download className='mr-3 h-4 w-4' />
              <div className='text-left'>
                <p className='font-medium'>Xuất dữ liệu JSON</p>
                <p className='text-xs text-gray-500'>Tải xuống tất cả thông tin khách</p>
              </div>
            </Button>

            <Button
              onClick={handleClearData}
              variant='outline'
              size='lg'
              className='touch-target h-12 w-full justify-start rounded-xl border-red-200 text-red-600 transition-all duration-200 hover:bg-red-50'
              disabled={allGuests.length === 0}
            >
              <Trash2 className='mr-3 h-4 w-4' />
              <div className='text-left'>
                <p className='font-medium'>Xóa tất cả dữ liệu</p>
                <p className='text-xs text-red-400'>Thao tác này không thể hoàn tác</p>
              </div>
            </Button>
          </div>
        </Card>

        {/* App Information Card */}
        <Card className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm'>
          <div className='mb-4 flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600'>
              <Info className='h-5 w-5 text-white' />
            </div>
            <div>
              <h3 className='font-semibold text-gray-900'>Thông tin ứng dụng</h3>
              <p className='text-xs text-gray-500'>Chi tiết phiên bản và công nghệ</p>
            </div>
          </div>

          <div className='space-y-3'>
            <div className='flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0'>
              <span className='text-sm font-medium text-gray-600'>Phiên bản</span>
              <span className='text-sm font-semibold text-gray-900'>1.0.0</span>
            </div>
            <div className='flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0'>
              <span className='text-sm font-medium text-gray-600'>Ứng dụng</span>
              <span className='text-sm font-semibold text-gray-900'>Guest Check-in</span>
            </div>
            <div className='flex items-start justify-between py-2'>
              <span className='text-sm font-medium text-gray-600'>Công nghệ</span>
              <div className='text-right'>
                <p className='text-sm font-semibold text-gray-900'>React • Next.js</p>
                <p className='text-xs text-gray-500'>TailwindCSS • Framer Motion</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
