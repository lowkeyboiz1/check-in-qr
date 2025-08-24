'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAtom, useSetAtom } from 'jotai'
import { isAuthenticatedAtom, loginAttemptsAtom } from '@/store/atoms'
import { Trash2, Download, Info, Users, Upload, Mail, LogOut, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useGuests } from '@/hooks/useGuests'
import { motion } from 'framer-motion'

export function SettingsPage() {
  // Use React Query for guest data instead of Jotai atoms
  const { data: allGuests = [], isLoading, isError, error, refetch } = useGuests()

  // Jotai atoms for authentication only
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom)
  const setLoginAttempts = useSetAtom(loginAttemptsAtom)
  const router = useRouter()

  // Calculate statistics from API data
  const checkedInCount = allGuests.filter((guest) => guest.isCheckedIn).length
  const attendanceRate = allGuests.length > 0 ? Math.round((checkedInCount / allGuests.length) * 100) : 0

  // Note: handleClearData function removed as data is now managed by API
  // Users should manage data through the API endpoints instead

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

  const handleSendEmail = async () => {
    if (!confirm('Bạn có muốn gửi email thông tin sự kiện đến khách mời chưa check-in?')) {
      return
    }

    try {
      const uncheckedInGuests = allGuests.filter((guest) => !guest.isCheckedIn && guest.email && guest.email.trim() !== '')

      if (uncheckedInGuests.length === 0) {
        alert('Không có khách mời nào chưa check-in có email hợp lệ')
        return
      }

      let successCount = 0
      let errorCount = 0

      for (const guest of uncheckedInGuests) {
        try {
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: guest.email,
              guestId: guest.id
            })
          })

          const result = await response.json()

          if (result.success) {
            successCount++
          } else {
            errorCount++
            console.error(`Failed to send email to ${guest.email}:`, result.message)
          }
        } catch (error) {
          errorCount++
          console.error(`Error sending email to ${guest.email}:`, error)
        }
      }

      alert(`Đã gửi email thành công: ${successCount}\nLỗi: ${errorCount}`)
    } catch (error) {
      console.error('Error sending emails:', error)
      alert('Có lỗi xảy ra khi gửi email')
    }
  }

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      // Clear authentication state
      setIsAuthenticated(false)
      localStorage.removeItem('isAuthenticated')

      // Reset login attempts
      setLoginAttempts(0)

      toast.success('Đã đăng xuất thành công!')
      router.push('/login')
    }
  }

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
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600'>
                <Users className='h-5 w-5 text-white' />
              </div>
              <div>
                <h3 className='font-semibold text-gray-900'>Thống kê sự kiện</h3>
                <p className='text-xs text-gray-500'>Tình hình check-in hiện tại</p>
              </div>
            </div>
            {/* Refresh Button */}
            <motion.div whileHover={!isLoading ? { scale: 1.1 } : {}} whileTap={!isLoading ? { scale: 0.9 } : {}} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
              <Button
                onClick={() => refetch()}
                disabled={isLoading}
                variant='ghost'
                size='sm'
                className={`h-8 w-8 rounded-xl p-0 transition-all duration-300 ${
                  isLoading ? 'bg-blue-50 text-blue-600 shadow-lg shadow-blue-200/50' : 'hover:bg-blue-50 hover:text-blue-600 hover:shadow-md active:shadow-sm'
                }`}
              >
                <RefreshCw className={`h-4 w-4 transition-all duration-500 ${isLoading ? 'animate-spin text-blue-600 drop-shadow-sm' : 'text-gray-400 hover:text-blue-500'}`} />
              </Button>
            </motion.div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className='grid grid-cols-2 gap-3'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='animate-pulse rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4'>
                  <div className='text-center'>
                    <div className='mx-auto mb-2 h-6 w-12 animate-pulse rounded bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300'></div>
                    <div className='mx-auto h-4 w-16 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200'></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className='rounded-xl border border-red-200 bg-red-50 p-4 text-center'
            >
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }}>
                <p className='text-sm font-medium text-red-700'>Không thể tải dữ liệu thống kê</p>
                <p className='mt-1 text-xs text-red-600'>{error instanceof Error ? error.message : 'Đã có lỗi xảy ra'}</p>
              </motion.div>
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.3 }}>
                <Button onClick={() => refetch()} variant='outline' size='sm' className='mt-2 transition-all duration-200 hover:border-red-300 hover:bg-red-100'>
                  <RefreshCw className='mr-2 h-3 w-3' />
                  Thử lại
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Statistics Grid - Only show when not loading and no error */}
          {!isLoading && !isError && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} className='grid grid-cols-2 gap-3'>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className='rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 transition-all duration-200 hover:shadow-lg'
              >
                <div className='text-center'>
                  <motion.p
                    key={checkedInCount}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className='text-2xl font-bold text-emerald-700'
                  >
                    {checkedInCount}
                  </motion.p>
                  <p className='mt-1 text-sm font-medium text-emerald-600'>Đã check-in</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className='rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 transition-all duration-200 hover:shadow-lg'
              >
                <div className='text-center'>
                  <motion.p
                    key={attendanceRate}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className='text-2xl font-bold text-blue-700'
                  >
                    {attendanceRate}%
                  </motion.p>
                  <p className='mt-1 text-sm font-medium text-blue-600'>Tỷ lệ tham gia</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className='rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-4 transition-all duration-200 hover:shadow-lg'
              >
                <div className='text-center'>
                  <motion.p
                    key={allGuests.length - checkedInCount}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className='text-2xl font-bold text-amber-700'
                  >
                    {allGuests.length - checkedInCount}
                  </motion.p>
                  <p className='mt-1 text-sm font-medium text-amber-600'>Chưa đến</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className='rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 transition-all duration-200 hover:shadow-lg'
              >
                <div className='text-center'>
                  <motion.p
                    key={allGuests.length}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className='text-2xl font-bold text-gray-700'
                  >
                    {allGuests.length}
                  </motion.p>
                  <p className='mt-1 text-sm font-medium text-gray-600'>Tổng khách</p>
                </div>
              </motion.div>
            </motion.div>
          )}
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

            {/* <Button
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
            </Button> */}
          </div>
        </Card>

        {/* Logout Card */}
        <Card className='rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm'>
          <div className='mb-4 flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600'>
              <LogOut className='h-5 w-5 text-white' />
            </div>
            <div>
              <h3 className='font-semibold text-red-900'>Đăng xuất</h3>
              <p className='text-xs text-red-600'>Thoát khỏi ứng dụng</p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant='outline'
            size='lg'
            className='touch-target h-12 w-full justify-start rounded-xl border-red-300 text-red-600 transition-all duration-200 hover:bg-red-100'
          >
            <LogOut className='mr-3 h-4 w-4' />
            <div className='text-left'>
              <p className='font-medium'>Đăng xuất</p>
              <p className='text-xs text-red-400'>Quay về trang đăng nhập</p>
            </div>
          </Button>
        </Card>
      </div>
    </div>
  )
}
