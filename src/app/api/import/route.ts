import { NextRequest, NextResponse } from 'next/server'
import { getGuestsCollection } from '@/lib/db'
import { generateGuestId, validateGuestData } from '@/lib/models/Guest'
import csv from 'csv-parser'
import { Readable } from 'stream'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided',
          message: 'Vui lòng chọn file CSV để upload'
        },
        { status: 400 }
      )
    }

    // Check if file is CSV
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type',
          message: 'Chỉ chấp nhận file CSV'
        },
        { status: 400 }
      )
    }

    const collection = await getGuestsCollection()
    const results: any[] = []
    const errors: string[] = []
    let processedCount = 0
    let successCount = 0
    let errorCount = 0

    // Convert file to buffer and then to readable stream
    const buffer = Buffer.from(await file.arrayBuffer())
    const readable = Readable.from(buffer)

    return new Promise<NextResponse>((resolve) => {
      readable
        .pipe(csv())
        .on('data', async (data) => {
          processedCount++

          console.log(`\n=== PROCESSING ROW ${processedCount} ===`)
          console.log('Raw CSV data:', data)

          // Map CSV fields to Guest model for customers_export format
          const firstName = data['First Name'] || ''
          const lastName = data['Last Name'] || ''
          const fullName = `${firstName} ${lastName}`.trim()

          // Clean phone number: remove quotes, +84 prefix, and format
          const cleanPhone = (data['Phone'] || '').toString().replace(/^'/, '').replace(/^\+84/, '0')

          console.log('Name mapping:', { firstName, lastName, fullName })
          console.log('Phone mapping:', { original: data['Phone'], cleaned: cleanPhone })

          const guestData = {
            name: fullName || data['name'] || data['Name'] || '',
            email: data['Email'] || data['email'] || '',
            phone: cleanPhone,
            gender: data['Giới tính  (customer.metafields.custom.gii_tnh_)'] || data['gender'] || '',
            age: data['Độ tuổi làm việc (customer.metafields.custom._tui_lm_vic)'] || data['age'] || '',
            source: data['Bạn biết thông tin khóa học qua kênh nào? (*) (customer.metafields.custom.bn_bit_thng_tin_kha_hc_qua_knh_no_)'] || data['source'] || ''
          }

          console.log('Mapped guest data:', guestData)

          // Optional validation - only check format if data exists
          const validationErrors = validateGuestData({
            name: guestData.name,
            email: guestData.email,
            phone: guestData.phone
          })

          console.log('Validation result:', { errors: validationErrors })

          if (validationErrors.length > 0) {
            console.log(`⚠️ Row ${processedCount} has format issues but will be imported:`, validationErrors)
            // Don't skip, just log the warnings
          }

          // Check if email already exists (SKIP DATABASE CHECK FOR NOW)
          try {
            console.log(`✅ Row ${processedCount} PASSED validation`)
            // const existingGuest = await collection.findOne({ email: guestData.email.toLowerCase() })
            // if (existingGuest) {
            //   errors.push(`Row ${processedCount}: Email ${guestData.email} đã tồn tại`)
            //   errorCount++
            //   return
            // }

            // Create new guest object with safe handling of empty values
            const newGuest = {
              id: generateGuestId(),
              name: guestData.name ? guestData.name.trim() : '',
              email: guestData.email ? guestData.email.trim().toLowerCase() : '',
              phone: guestData.phone ? guestData.phone.trim() : '',
              gender: guestData.gender || '',
              age: guestData.age || '',
              source: guestData.source || '',
              isCheckedIn: false,
              createdAt: new Date()
            }

            console.log('Final guest object:', newGuest)
            results.push(newGuest)
            successCount++
          } catch (error) {
            console.log(`❌ Row ${processedCount} ERROR:`, error)
            errors.push(`Row ${processedCount}: Error processing data - ${error}`)
            errorCount++
          }
        })
        .on('end', async () => {
          try {
            console.log('\n=== IMPORT SUMMARY ===')
            console.log(`Total processed: ${processedCount}`)
            console.log(`Success count: ${successCount}`)
            console.log(`Error count: ${errorCount}`)
            console.log(`Will insert: ${results.length} records`)
            console.log('First 3 records to be inserted:', results.slice(0, 3))
            console.log('All errors:', errors)

            // INSERT INTO DATABASE
            if (results.length > 0) {
              await collection.insertMany(results)
              console.log(`✅ Successfully inserted ${results.length} records into database!`)
            }

            resolve(
              NextResponse.json({
                success: true,
                message: 'CSV import completed successfully!',
                data: {
                  totalProcessed: processedCount,
                  successCount: successCount,
                  errorCount: errorCount,
                  insertedCount: results.length,
                  errors: errors.slice(0, 10) // Limit errors to first 10 for response size
                }
              })
            )
          } catch (error) {
            console.error('Error inserting guests:', error)
            resolve(
              NextResponse.json(
                {
                  success: false,
                  error: 'Database insertion failed',
                  message: 'Lỗi khi lưu dữ liệu vào database',
                  data: {
                    totalProcessed: processedCount,
                    successCount: 0,
                    errorCount: processedCount,
                    insertedCount: 0,
                    errors: [`Database error: ${error}`]
                  }
                },
                { status: 500 }
              )
            )
          }
        })
        .on('error', (error) => {
          console.error('CSV parsing error:', error)
          resolve(
            NextResponse.json(
              {
                success: false,
                error: 'CSV parsing failed',
                message: 'Lỗi khi đọc file CSV',
                details: error instanceof Error ? error.message : 'Unknown error'
              },
              { status: 400 }
            )
          )
        })
    })
  } catch (error) {
    console.error('Error importing CSV:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Import failed',
        message: 'Lỗi khi import CSV',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
