'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Camera, CameraOff, Sparkles, X, User, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react'
import { useSetAtom } from 'jotai'
import { setCurrentGuestAtom, isLoadingAtom } from '@/store/atoms'
import type { Guest } from '@/store/atoms'
import confetti from 'canvas-confetti'

interface QRScannerProps {
  onScanSuccess?: (result: string) => void
}

interface QRResponseData {
  name?: string
  email?: string
  phone?: string
  message?: string
  error?: string
  [key: string]: any
}

export function QRScannerComponent({ onScanSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [qrResponse, setQrResponse] = useState<QRResponseData | null>(null)
  const [isLoadingResponse, setIsLoadingResponse] = useState(false)

  const setCurrentGuest = useSetAtom(setCurrentGuestAtom)
  const setIsLoading = useSetAtom(isLoadingAtom)

  const triggerWhaleConfetti = () => {
    // Disabled diamond confetti to prevent rotation issues
    // Simple confetti without diamonds
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
    })
  }

  const startScanning = async () => {
    try {
      setError(null)
      setIsScanning(true)
      triggerWhaleConfetti()

      if (scannerRef.current) {
        scannerRef.current.clear()
      }

      // Wait for DOM to update before initializing scanner
      setTimeout(() => {
        try {
          const onScanSuccessCallback = async (decodedText: string, decodedResult: unknown) => {
            console.log('QR Scan Result:', { decodedText, decodedResult })
            setIsLoading(true)
            try {
              await handleScanResult(decodedText)
              // Trigger whale confetti on successful scan
              triggerWhaleConfetti()
              onScanSuccess?.(decodedText)
            } catch (err) {
              setError('Lỗi xử lý dữ liệu QR: ' + (err as Error).message)
            } finally {
              setIsLoading(false)
            }
          }

          const onScanFailure = (error: string) => {
            // This callback will be called in case of qr code scan failure.
            // Usually this callback will be called with "QR code not found" message.
            // You can ignore this callback if you don't want to do anything on scan failure.
          }

          const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
            supportedScanTypes: [0] // Only QR codes
          }

          // Check if element exists before creating scanner
          const element = document.getElementById('qr-reader')
          if (!element) {
            throw new Error('QR reader element not found')
          }

          scannerRef.current = new Html5QrcodeScanner(
            'qr-reader',
            config,
            false // verbose
          )

          scannerRef.current.render(onScanSuccessCallback, onScanFailure)
        } catch (err) {
          setError('Không thể khởi tạo scanner: ' + (err as Error).message)
          console.log({ err })
          setIsScanning(false)
        }
      }, 100) // Small delay to ensure DOM is updated
    } catch (err) {
      setError('Không thể khởi tạo scanner: ' + (err as Error).message)
      console.log({ err })
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error)
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleScanResult = async (data: string) => {
    try {
      // Check if it's a URL
      if (data.startsWith('http')) {
        setIsLoadingResponse(true)
        setShowModal(true)
        stopScanning()

        try {
          const response = await fetch(data)
          const responseData = await response.json()

          setQrResponse(responseData)

          // If the response contains guest data, also set it as current guest
          if (responseData.name && responseData.email && responseData.phone) {
            const guest: Guest = {
              id: Date.now().toString(),
              name: responseData.name,
              email: responseData.email,
              phone: responseData.phone,
              isCheckedIn: false,
              createdAt: new Date().toISOString()
            }
            setCurrentGuest(guest)
          }
        } catch (fetchError) {
          setQrResponse({
            error: 'Không thể lấy dữ liệu từ URL: ' + (fetchError as Error).message
          })
        } finally {
          setIsLoadingResponse(false)
        }
        return
      }

      // Try to parse as JSON
      try {
        const parsed = JSON.parse(data)
        setQrResponse(parsed)
        setShowModal(true)
        stopScanning()

        if (parsed.name && parsed.email && parsed.phone) {
          const guest: Guest = {
            id: Date.now().toString(),
            name: parsed.name,
            email: parsed.email,
            phone: parsed.phone,
            isCheckedIn: false,
            createdAt: new Date().toISOString()
          }
          setCurrentGuest(guest)
        }
        return
      } catch {
        // If not JSON, show as plain text
        setQrResponse({ message: data })
        setShowModal(true)
        stopScanning()
      }
    } catch (err) {
      setQrResponse({
        error: 'Lỗi xử lý dữ liệu QR: ' + (err as Error).message
      })
      setShowModal(true)
      stopScanning()
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setQrResponse(null)
    setIsLoadingResponse(false)
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className='flex h-full flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50/50'>
      {/* Mobile Header */}
      <div className='flex-shrink-0 border-b border-gray-200/50 bg-white/95 px-4 py-4 backdrop-blur-xl'>
        <div className='flex items-center justify-between'>
          <div className='flex-1 text-center'>
            <h1 className='text-2xl font-bold text-gray-900'>Quét mã QR</h1>
            <p className='mt-1 text-sm text-gray-600'>Hướng camera vào mã QR của khách</p>
          </div>
        </div>
      </div>

      {/* Main Scanner Area */}
      <div className='flex flex-1 flex-col justify-center p-4'>
        {/* Error Message */}
        {error && (
          <div className='mb-4 rounded-2xl border border-red-200 bg-red-50 p-4'>
            <div className='flex items-center gap-2'>
              <div className='h-2 w-2 flex-shrink-0 rounded-full bg-red-500' />
              <p className='text-sm font-medium text-red-700'>{error}</p>
            </div>
          </div>
        )}

        {/* Scanner Container */}
        <Card className='mx-auto w-full max-w-sm rounded-3xl border border-gray-200 bg-white p-6 shadow-lg'>
          <div className='space-y-6'>
            {/* Camera Viewport */}
            <div className='relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100'>
              {isScanning ? (
                <>
                  <div id='qr-reader' className='h-full w-full' />
                  {/* Scanning Overlay */}
                  <div className='pointer-events-none absolute inset-0'>
                    <div className='absolute inset-4 rounded-2xl border-2 border-white shadow-lg'>
                      <div className='absolute top-0 left-0 h-6 w-6 rounded-tl-lg border-t-4 border-l-4 border-blue-500' />
                      <div className='absolute top-0 right-0 h-6 w-6 rounded-tr-lg border-t-4 border-r-4 border-blue-500' />
                      <div className='absolute bottom-0 left-0 h-6 w-6 rounded-bl-lg border-b-4 border-l-4 border-blue-500' />
                      <div className='absolute right-0 bottom-0 h-6 w-6 rounded-br-lg border-r-4 border-b-4 border-blue-500' />
                    </div>

                    {/* Scanning Line Animation */}
                    <motion.div
                      className='absolute right-4 left-4 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent'
                      animate={{
                        top: ['16px', 'calc(100% - 16px)', '16px']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className='flex h-full w-full items-center justify-center'>
                  <div className='space-y-4 text-center'>
                    <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50'>
                      <Camera className='h-8 w-8 text-blue-600' />
                    </div>
                    <div>
                      <p className='font-medium text-gray-700'>Chưa bắt đầu quét</p>
                      <p className='mt-1 text-sm text-gray-500'>Nhấn nút bên dưới để mở camera</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                onClick={isScanning ? stopScanning : startScanning}
                size='lg'
                className={`touch-target h-14 w-full rounded-2xl text-base font-semibold shadow-lg transition-all duration-200 ${
                  isScanning
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-200 hover:from-red-600 hover:to-red-700'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-200 hover:from-blue-700 hover:to-blue-800'
                }`}
              >
                {isScanning ? (
                  <>
                    <CameraOff className='mr-2 h-5 w-5' />
                    Dừng quét
                  </>
                ) : (
                  <>
                    <Camera className='mr-2 h-5 w-5' />
                    Bắt đầu quét
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </Card>

        {/* Instructions */}
        <div className='mt-6 space-y-2 text-center'>
          <p className='text-sm font-medium text-gray-700'>Hướng dẫn sử dụng</p>
          <div className='space-y-1 text-xs text-gray-500'>
            <p>• Đặt mã QR trong khung vuông</p>
            <p>• Giữ điện thoại ổn định</p>
            <p>• Đảm bảo ánh sáng đủ</p>
          </div>
        </div>
      </div>

      {/* QR Response Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm' onClick={closeModal}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className='fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform px-4'
              onClick={(e) => e.stopPropagation()}
            >
              <Card className='w-full rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl'>
                <div className='space-y-4'>
                  {/* Header */}
                  <div className='flex items-center justify-between'>
                    <h3 className='text-lg font-semibold text-gray-900'>Kết quả quét QR</h3>
                    <Button variant='ghost' size='sm' onClick={closeModal} className='h-8 w-8 rounded-full p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-600'>
                      <X className='h-4 w-4' />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className='space-y-4'>
                    {isLoadingResponse ? (
                      <div className='flex items-center justify-center py-8'>
                        <div className='flex items-center gap-3'>
                          <div className='h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent' />
                          <p className='text-sm text-gray-600'>Đang lấy dữ liệu...</p>
                        </div>
                      </div>
                    ) : qrResponse ? (
                      <>
                        {qrResponse.error ? (
                          <div className='rounded-2xl border border-red-200 bg-red-50 p-4'>
                            <div className='flex items-start gap-3'>
                              <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-500' />
                              <div>
                                <p className='font-medium text-red-800'>Lỗi</p>
                                <p className='mt-1 text-sm text-red-700'>{qrResponse.error}</p>
                              </div>
                            </div>
                          </div>
                        ) : qrResponse.name && qrResponse.email && qrResponse.phone ? (
                          <div className='rounded-2xl border border-green-200 bg-green-50 p-4'>
                            <div className='flex items-start gap-3'>
                              <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-500' />
                              <div className='flex-1'>
                                <p className='font-medium text-green-800'>Thông tin khách</p>
                                <div className='mt-3 space-y-2'>
                                  <div className='flex items-center gap-2'>
                                    <User className='h-4 w-4 text-green-600' />
                                    <span className='text-sm font-medium text-green-700'>{qrResponse.name}</span>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    <Mail className='h-4 w-4 text-green-600' />
                                    <span className='text-sm text-green-700'>{qrResponse.email}</span>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    <Phone className='h-4 w-4 text-green-600' />
                                    <span className='text-sm text-green-700'>{qrResponse.phone}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className='rounded-2xl border border-gray-200 bg-gray-50 p-4'>
                            <p className='mb-2 text-sm font-medium text-gray-700'>Dữ liệu nhận được:</p>
                            <pre className='max-h-40 overflow-auto text-xs whitespace-pre-wrap text-gray-600'>{JSON.stringify(qrResponse, null, 2)}</pre>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>

                  {/* Footer */}
                  <div className='flex justify-end pt-2'>
                    <Button onClick={closeModal} size='sm' className='bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'>
                      Đóng
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
