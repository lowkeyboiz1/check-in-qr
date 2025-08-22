'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Camera, CameraOff, RotateCcw, X, User, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react'
import { useSetAtom } from 'jotai'
import { setCurrentGuestAtom, isLoadingAtom } from '@/store/atoms'
import type { Guest } from '@/store/atoms'
import confetti from 'canvas-confetti'
import { ScrollArea } from '@/components/ui/scroll-area'
import { QRGuestModal } from '@/components/qr-guest-modal'

interface QRScannerProps {
  onScanSuccess?: (result: string) => void
}

interface QRResponseData {
  success?: boolean
  data?: {
    _id?: string
    id: string
    name: string
    email: string
    phone: string
    gender?: string
    age?: string
    source?: string
    isCheckedIn: boolean
    createdAt?: string
    checkedInAt?: string
    updatedAt?: string
  }
  message?: string
  error?: string
  [key: string]: any
}

export function QRScannerComponent({ onScanSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [qrResponse, setQrResponse] = useState<QRResponseData | null>(null)
  const [isLoadingResponse, setIsLoadingResponse] = useState(false)
  const [cameras, setCameras] = useState<any[]>([])
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(null)
  const [isBackCamera, setIsBackCamera] = useState(true)

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

  // Request camera permissions and get available cameras
  const requestCameraPermission = async () => {
    try {
      // Request camera permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment' // Prefer back camera
        }
      })
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach((track) => track.stop())
      return true
    } catch (err) {
      console.error('Camera permission denied:', err)
      setError('Cần cấp quyền truy cập camera để quét mã QR')
      return false
    }
  }

  const getCameras = useCallback(async () => {
    try {
      // First request camera permission
      const hasPermission = await requestCameraPermission()
      if (!hasPermission) return []

      const devices = await Html5Qrcode.getCameras()
      console.log('Available cameras:', devices)
      setCameras(devices)

      // Enhanced camera detection logic - prefer back camera for mobile QR scanning
      const backCamera = devices.find((device) => {
        const label = device.label.toLowerCase()
        return (
          label.includes('back') ||
          label.includes('rear') ||
          label.includes('environment') ||
          label.includes('main') ||
          // Some devices use index-based naming, back camera is often the first or second
          (devices.length > 1 && devices.indexOf(device) === 0) ||
          // Check for specific mobile camera patterns
          label.includes('camera 0') ||
          label.includes('camera2 0')
        )
      })

      const frontCamera = devices.find((device) => {
        const label = device.label.toLowerCase()
        return label.includes('front') || label.includes('user') || label.includes('facing') || label.includes('selfie') || label.includes('camera 1') || label.includes('camera2 1')
      })

      console.log('Back camera found:', backCamera)
      console.log('Front camera found:', frontCamera)

      // Set initial camera (strongly prefer back camera for QR scanning)
      if (backCamera) {
        setCurrentCameraId(backCamera.id)
        setIsBackCamera(true)
        console.log('Using back camera:', backCamera.id)
      } else if (devices.length > 1) {
        // If multiple cameras but can't identify back camera, try the first one
        setCurrentCameraId(devices[0].id)
        setIsBackCamera(true)
        console.log('Using first camera as back camera:', devices[0].id)
      } else if (frontCamera) {
        setCurrentCameraId(frontCamera.id)
        setIsBackCamera(false)
        console.log('Using front camera:', frontCamera.id)
      } else if (devices.length > 0) {
        setCurrentCameraId(devices[0].id)
        setIsBackCamera(true)
        console.log('Using first available camera:', devices[0].id)
      }

      return devices
    } catch (err) {
      console.error('Error getting cameras:', err)
      setError('Không thể truy cập camera: ' + (err as Error).message)
      return []
    }
  }, [])

  const switchCamera = async () => {
    if (cameras.length < 2) return

    try {
      // Stop current scanning
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop()
      }

      // Find the other camera
      const currentIndex = cameras.findIndex((cam) => cam.id === currentCameraId)
      const nextIndex = (currentIndex + 1) % cameras.length
      const nextCamera = cameras[nextIndex]

      setCurrentCameraId(nextCamera.id)
      setIsBackCamera(!isBackCamera)

      // Restart scanning with new camera
      if (isScanning) {
        setTimeout(() => {
          startScanningWithCamera(nextCamera.id)
        }, 200)
      }
    } catch (err) {
      console.error('Error switching camera:', err)
      setError('Không thể chuyển camera: ' + (err as Error).message)
    }
  }

  const waitForElement = (id: string, timeout = 5000): Promise<HTMLElement> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()

      const checkElement = () => {
        const element = document.getElementById(id)
        if (element) {
          console.log(`Element '${id}' found after ${Date.now() - startTime}ms`)
          resolve(element)
          return
        }

        if (Date.now() - startTime > timeout) {
          console.error(`Element '${id}' not found within ${timeout}ms`)
          reject(new Error(`Element with id '${id}' not found within ${timeout}ms`))
          return
        }

        // Check again in next frame
        requestAnimationFrame(checkElement)
      }

      // Start checking immediately
      checkElement()
    })
  }

  const startScanningWithCamera = async (cameraId: string) => {
    try {
      console.log('Starting scanner with camera:', cameraId)

      // Wait for element to be available and retry if needed
      let qrReaderElement = document.getElementById('qr-reader')
      let retries = 0
      const maxRetries = 10

      while (!qrReaderElement && retries < maxRetries) {
        console.log(`Waiting for qr-reader element... attempt ${retries + 1}`)
        await new Promise((resolve) => setTimeout(resolve, 100))
        qrReaderElement = document.getElementById('qr-reader')
        retries++
      }

      if (!qrReaderElement) {
        console.error('qr-reader element not found after retries')
        setError('Không tìm thấy element quét QR. Vui lòng thử lại.')
        setIsScanning(false)
        return
      }

      console.log('qr-reader element found, proceeding with scanner initialization')

      // Clean up existing scanner
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop()
          scannerRef.current.clear()
        } catch (err) {
          console.log('Error cleaning up existing scanner:', err)
        }
        scannerRef.current = null
      }

      // Wait a bit for cleanup
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Create new scanner instance
      scannerRef.current = new Html5Qrcode('qr-reader')

      const onScanSuccessCallback = async (decodedText: string, decodedResult: unknown) => {
        console.log('QR Scan Result:', { decodedText, decodedResult })
        setIsLoading(true)
        try {
          await handleScanResult(decodedText)
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

      // Enhanced configuration for full screen mobile QR scanning
      const config = {
        fps: 10,
        // Use larger scanning area or auto-detect based on container size
        aspectRatio: 1.0,
        disableFlip: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        // Additional camera constraints for better mobile experience
        videoConstraints: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: isBackCamera ? 'environment' : 'user',
          focusMode: 'continuous'
        },
        // Optimize for mobile performance
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      }

      await scannerRef.current.start(cameraId, config, onScanSuccessCallback, onScanFailure)

      setIsScanning(true)
    } catch (err) {
      console.error('Error starting scanner:', err)
      setError('Không thể khởi tạo scanner: ' + (err as Error).message)
      setIsScanning(false)
    }
  }

  const startScanning = async () => {
    try {
      setError(null)
      triggerWhaleConfetti()

      console.log('Starting QR scanning...')

      // Get cameras if not already available
      if (cameras.length === 0) {
        console.log('Getting cameras...')
        const availableCameras = await getCameras()
        if (availableCameras.length === 0) {
          setError('Không tìm thấy camera nào')
          return
        }
      }

      // Use current camera or fall back to first available
      const cameraToUse = currentCameraId || (cameras.length > 0 ? cameras[0].id : null)

      if (!cameraToUse) {
        setError('Không tìm thấy camera nào')
        return
      }

      // Set scanning state first to show the element
      setIsScanning(true)

      // Wait for React to render the element
      await new Promise((resolve) => setTimeout(resolve, 100))

      console.log('Using camera:', cameraToUse)
      await startScanningWithCamera(cameraToUse)
    } catch (err) {
      setError('Không thể khởi tạo scanner: ' + (err as Error).message)
      console.error('Error starting scanner:', err)
      setIsScanning(false)
    }
  }

  const stopScanning = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop()
        scannerRef.current.clear()
        scannerRef.current = null
      }
      setIsScanning(false)
    } catch (err) {
      console.error('Error stopping scanner:', err)
      setIsScanning(false)
    }
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
    // Initialize cameras on component mount
    const initializeCamera = async () => {
      try {
        console.log('Initializing camera on mount...')
        await getCameras()
      } catch (err) {
        console.error('Error initializing camera:', err)
      }
    }

    initializeCamera()

    return () => {
      console.log('Component unmounting, stopping scanner...')
      stopScanning()
    }
  }, [])

  // Additional effect to ensure DOM element exists when scanning state changes
  useEffect(() => {
    if (isScanning) {
      const element = document.getElementById('qr-reader')
      if (!element) {
        console.error('qr-reader element missing while scanning is true')
        setIsScanning(false)
        setError('Element quét QR bị thiếu. Vui lòng refresh trang.')
      }
    }
  }, [isScanning])

  return (
    <div className='flex h-full flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50/50'>
      {/* Mobile Header */}
      <div className='flex-shrink-0 border-b border-gray-200/50 bg-white/95 px-4 py-4 backdrop-blur-xl'>
        <div className='flex items-center justify-between'>
          <div className='flex-1 text-center'>
            <h1 className='text-2xl font-bold text-gray-900'>Quét mã QR</h1>
            <p className='mt-1 text-sm text-gray-600'>{isScanning ? `Đang sử dụng camera ${isBackCamera ? 'sau' : 'trước'}` : 'Hướng camera vào mã QR của khách'}</p>
            {cameras.length > 0 && <p className='mt-1 text-xs text-gray-500'>Có {cameras.length} camera khả dụng</p>}
          </div>
        </div>
      </div>

      {/* Main Scanner Area */}
      <div className='flex flex-1 flex-col p-4'>
        <ScrollArea className='flex-1'>
          <div className='space-y-4 pb-4'>
            {/* Error Message */}
            {/* Action Buttons - Only show when not scanning */}
            {!isScanning && (
              <Card className='mx-auto w-full max-w-sm rounded-3xl border border-gray-200 bg-white p-6 shadow-lg'>
                <div className='space-y-4'>
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={startScanning}
                      size='lg'
                      className='touch-target h-14 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-base font-semibold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:from-blue-700 hover:to-blue-800'
                    >
                      <Camera className='mr-2 h-5 w-5' />
                      Bắt đầu quét toàn màn hình
                    </Button>
                  </motion.div>

                  {/* Camera Switch Button */}
                  {cameras.length > 1 && (
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={switchCamera}
                        variant='outline'
                        size='lg'
                        className='touch-target h-12 w-full rounded-2xl border-2 border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      >
                        <RotateCcw className='mr-2 h-4 w-4' />
                        {isBackCamera ? 'Chuyển sang camera trước' : 'Chuyển sang camera sau'}
                      </Button>
                    </motion.div>
                  )}

                  {/* Force Back Camera Button - if not using back camera */}
                  {cameras.length > 1 && !isBackCamera && (
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={async () => {
                          const backCamera = cameras.find((device) => {
                            const label = device.label.toLowerCase()
                            return label.includes('back') || label.includes('rear') || label.includes('environment') || label.includes('main')
                          })
                          if (backCamera) {
                            try {
                              if (scannerRef.current && isScanning) {
                                await scannerRef.current.stop()
                              }
                              setCurrentCameraId(backCamera.id)
                              setIsBackCamera(true)
                              if (isScanning) {
                                setTimeout(() => {
                                  startScanningWithCamera(backCamera.id)
                                }, 200)
                              }
                            } catch (err) {
                              console.error('Error switching to back camera:', err)
                            }
                          }
                        }}
                        variant='outline'
                        size='sm'
                        className='touch-target h-10 w-full rounded-xl border border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-300 hover:bg-orange-100'
                      >
                        📷 Sử dụng camera sau (khuyến nghị)
                      </Button>
                    </motion.div>
                  )}

                  {/* Debug button - development only */}
                  {process.env.NODE_ENV === 'development' && (
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => {
                          const element = document.getElementById('qr-reader')
                          console.log('Debug - Element exists:', !!element)
                          console.log('Debug - Element classList:', element?.classList.toString())
                          console.log('Debug - isScanning:', isScanning)
                          console.log('Debug - Cameras:', cameras.length)
                          console.log('Debug - Current camera:', currentCameraId)
                        }}
                        variant='outline'
                        size='sm'
                        className='touch-target h-8 w-full rounded-lg border border-gray-300 bg-gray-50 text-xs text-gray-600 hover:bg-gray-100'
                      >
                        🔍 Debug Element
                      </Button>
                    </motion.div>
                  )}
                </div>
              </Card>
            )}
            {error && (
              <div className='rounded-2xl border border-red-200 bg-red-50 p-4'>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-2 flex-shrink-0 rounded-full bg-red-500' />
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-red-700'>{error}</p>
                    {error.includes('Element') && (
                      <Button
                        onClick={() => {
                          setError(null)
                          window.location.reload()
                        }}
                        size='sm'
                        variant='outline'
                        className='mt-2 border-red-300 text-red-700 hover:bg-red-100'
                      >
                        Refresh trang
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Scanner Container with Max Height */}
            <div className='relative h-[500px] max-h-[500px] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100'>
              {/* Always render qr-reader element, but conditionally show content */}
              <div id='qr-reader' className={`h-full w-full ${!isScanning ? 'hidden' : ''}`} onLoad={() => console.log('qr-reader element loaded')} />

              {isScanning ? (
                <>
                  {/* Debug info in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className='absolute top-4 left-4 z-50 rounded bg-black/70 px-3 py-2 text-xs text-white'>
                      Camera: {isBackCamera ? 'Back' : 'Front'} | ID: {currentCameraId?.slice(-4)}
                    </div>
                  )}

                  {/* Control overlay */}
                  <div className='absolute top-4 right-4 z-50'>
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button onClick={stopScanning} size='sm' variant='outline' className='border-white/30 bg-black/70 text-white hover:bg-black/90'>
                        <X className='mr-1 h-4 w-4' />
                        Đóng
                      </Button>
                    </motion.div>
                  </div>

                  {/* Camera switch control */}
                  {cameras.length > 1 && (
                    <div className='absolute right-4 bottom-4 z-50'>
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Button onClick={switchCamera} size='sm' variant='outline' className='border-white/30 bg-black/70 text-white hover:bg-black/90'>
                          <RotateCcw className='mr-1 h-4 w-4' />
                          {isBackCamera ? 'Trước' : 'Sau'}
                        </Button>
                      </motion.div>
                    </div>
                  )}

                  {/* Full screen instructions */}
                  <div className='absolute bottom-4 left-4 z-50'>
                    <div className='rounded bg-black/70 px-3 py-2 text-sm text-white'>
                      <p>🎯 Hướng camera vào mã QR</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className='flex h-full w-full items-center justify-center'>
                  <div className='space-y-6 text-center'>
                    <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-blue-50'>
                      <Camera className='h-10 w-10 text-blue-600' />
                    </div>
                    <div>
                      <p className='text-lg font-medium text-gray-700'>Chưa bắt đầu quét</p>
                      <p className='mt-2 text-sm text-gray-500'>Nhấn nút bên dưới để mở camera toàn màn hình</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions - Only show when not scanning */}
            {!isScanning && (
              <div className='space-y-2 text-center'>
                <p className='text-sm font-medium text-gray-700'>Hướng dẫn quét QR</p>
                <div className='space-y-1 text-xs text-gray-500'>
                  <p>• Camera sẽ mở toàn màn hình</p>
                  <p>• Hướng camera vào mã QR</p>
                  <p>• Sử dụng camera sau để quét tốt hơn</p>
                  {!isBackCamera && cameras.length > 1 && <p className='font-medium text-orange-600'>⚠️ Khuyến nghị dùng camera sau</p>}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* QR Guest Modal */}
      <QRGuestModal guestData={qrResponse?.success && qrResponse.data ? qrResponse.data : null} isOpen={showModal} onClose={closeModal} />
    </div>
  )
}
