'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useImportCSV } from '@/hooks/useGuests'

interface ImportResult {
  totalProcessed: number
  successCount: number
  errorCount: number
  insertedCount: number
  errors: string[]
}

export default function ImportCSVPage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importCSVMutation = useImportCSV()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Chỉ chấp nhận file CSV')
        return
      }
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.csv')) {
        toast.error('Chỉ chấp nhận file CSV')
        return
      }
      setFile(droppedFile)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Vui lòng chọn file CSV')
      return
    }

    try {
      const result = await importCSVMutation.mutateAsync(file)
      setResult(result)
      toast.success(`Import thành công! Đã thêm ${result.insertedCount} khách mời`)
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi import CSV'
      toast.error(errorMessage)
    }
  }

  const resetForm = () => {
    setFile(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
      <div className='mx-auto max-w-4xl'>
        {/* Header */}
        <div className='mb-8 flex items-center gap-4'>
          <Link href='/'>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='h-4 w-4' />
              Quay lại
            </Button>
          </Link>
          <h1 className='text-3xl font-bold text-gray-900'>Import CSV</h1>
        </div>

        {/* Instructions Card */}
        <Card className='mb-6 p-6'>
          <h2 className='mb-4 text-xl font-semibold'>Hướng dẫn sử dụng</h2>
          <div className='space-y-2 text-sm text-gray-600'>
            <p>
              • File CSV cần có các cột: <strong>First Name, Last Name, Email, Phone</strong> (bắt buộc)
            </p>
            <p>• Các cột tùy chọn: Giới tính, Độ tuổi làm việc, nguồn thông tin</p>
            <p>• Email phải là duy nhất (không được trùng lặp)</p>
            <p>• Số điện thoại có thể có định dạng +84 hoặc 0xx</p>
            <p>• Hỗ trợ file export từ Shopify customers</p>
            <p>• Định dạng file: UTF-8 CSV</p>
          </div>
        </Card>

        {/* Upload Section */}
        <Card className='mb-6 p-6'>
          <h2 className='mb-4 text-xl font-semibold'>Chọn file CSV</h2>

          {/* Drag & Drop Area */}
          <div
            className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${file ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input ref={fileInputRef} type='file' accept='.csv' onChange={handleFileSelect} className='hidden' />

            {file ? (
              <div className='space-y-2'>
                <FileText className='mx-auto h-12 w-12 text-green-600' />
                <p className='text-lg font-medium text-green-700'>{file.name}</p>
                <p className='text-sm text-gray-600'>Kích thước: {(file.size / 1024).toFixed(1)} KB</p>
                <Button variant='outline' onClick={() => fileInputRef.current?.click()} className='mt-2'>
                  Chọn file khác
                </Button>
              </div>
            ) : (
              <div className='space-y-2'>
                <Upload className='mx-auto h-12 w-12 text-gray-400' />
                <p className='text-lg font-medium text-gray-700'>Kéo thả file CSV vào đây hoặc click để chọn</p>
                <Button variant='outline' onClick={() => fileInputRef.current?.click()}>
                  Chọn file
                </Button>
              </div>
            )}
          </div>

          {/* Upload Button */}
          {file && (
            <div className='mt-4 flex gap-2'>
              <Button onClick={handleUpload} disabled={importCSVMutation.isPending} className='flex-1'>
                {importCSVMutation.isPending ? 'Đang import...' : 'Import CSV'}
              </Button>
              <Button variant='outline' onClick={resetForm} disabled={importCSVMutation.isPending}>
                Reset
              </Button>
            </div>
          )}
        </Card>

        {/* Results Section */}
        {result && (
          <Card className='p-6'>
            <h2 className='mb-4 text-xl font-semibold'>Kết quả Import</h2>

            <div className='mb-6 grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>{result.totalProcessed}</div>
                <div className='text-sm text-gray-600'>Tổng số dòng</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>{result.successCount}</div>
                <div className='text-sm text-gray-600'>Thành công</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-red-600'>{result.errorCount}</div>
                <div className='text-sm text-gray-600'>Lỗi</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-purple-600'>{result.insertedCount}</div>
                <div className='text-sm text-gray-600'>Đã thêm</div>
              </div>
            </div>

            {result.errorCount > 0 && (
              <div className='space-y-2'>
                <h3 className='flex items-center gap-2 font-medium text-red-600'>
                  <AlertCircle className='h-4 w-4' />
                  Danh sách lỗi:
                </h3>
                <div className='max-h-40 overflow-y-auto rounded bg-red-50 p-3'>
                  {result.errors.map((error, index) => (
                    <div key={index} className='text-sm text-red-700'>
                      {error}
                    </div>
                  ))}
                  {result.errors.length === 10 && result.errorCount > 10 && <div className='text-sm text-red-600 italic'>... và {result.errorCount - 10} lỗi khác</div>}
                </div>
              </div>
            )}

            {result.successCount > 0 && (
              <div className='mt-4 flex items-center gap-2 text-green-600'>
                <CheckCircle className='h-5 w-5' />
                <span className='font-medium'>Đã import thành công {result.insertedCount} khách mời!</span>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
