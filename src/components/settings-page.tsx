'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAtom, useSetAtom } from 'jotai'
import { guestsAtom, checkedInCountAtom, isAuthenticatedAtom, loginAttemptsAtom } from '@/store/atoms'
import { Trash2, Download, Info, Users, Upload, Mail, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function SettingsPage() {
  const [allGuests] = useAtom(guestsAtom)
  const [checkedInCount] = useAtom(checkedInCountAtom)
  // const [checkedInGuests] = useAtom(checkedInGuestsAtom)
  const setGuests = useSetAtom(guestsAtom)
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom)
  const setLoginAttempts = useSetAtom(loginAttemptsAtom)
  const router = useRouter()

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

  const handleSendEmail = async () => {
    if (!confirm('Bạn có muốn gửi email thông tin sự kiện đến khách mời chưa check-in?')) {
      return
    }

    try {
      const uncheckedInGuests = allGuests.filter((guest) => !guest.isCheckedIn && guest.email)

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
