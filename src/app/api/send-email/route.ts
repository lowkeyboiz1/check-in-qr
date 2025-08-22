import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

interface EmailRequest {
  email: string
  guestId: string
}

export async function POST(request: NextRequest) {
  try {
    const { email, guestId }: EmailRequest = await request.json()

    if (!email || !guestId) {
      return NextResponse.json({ success: false, message: 'Email và guestId là bắt buộc' }, { status: 400 })
    }

    // Check if SMTP credentials are configured
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS

    if (!smtpUser || !smtpPass) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cấu hình email chưa được thiết lập. Vui lòng cấu hình biến môi trường SMTP_USER và SMTP_PASS.',
          error: 'Missing SMTP credentials'
        },
        { status: 500 }
      )
    }

    // Get guest information from the API
    const guestResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/guests/${guestId}`)
    const guestData = await guestResponse.json()

    if (!guestData.success || !guestData.data) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy thông tin khách mời' }, { status: 404 })
    }

    const guest = guestData.data
    const firstName = guest.name?.split(' ')[0] || 'bạn'

    // Email content
    const emailContent = `
Xin chào bạn ${firstName},

Me & Stress sẽ chính thức diễn ra vào ngày mai.

Xin gửi lại lịch trình như sau:

🗓️ Thời gian: 14h00, Chủ Nhật ngày 24/8/2025

🏢 Địa điểm Hội thảo: Kefoff Cafe & Events - Phòng hội thảo - Tầng 2
(Địa chỉ: 90 Đào Duy Anh, Phường Đức Nhuận, TPHCM)

🛵 Địa điểm gửi xe: Sân đá banh Mini Quyên
(Địa chỉ: 21 Đào Duy Anh, Phường Đức Nhuận, TPHCM)

// QR để quét
${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/guests/${guestId}

Sau khi gửi xe, Đội lễ tân WorkLuz sẽ hướng dẫn bạn di chuyển đến Địa điểm tổ chức Hội thảo theo sơ đồ sau:
    `

    // Email options
    const mailOptions = {
      from: {
        name: 'WorkLuz Event Team',
        address: smtpUser
      },
      to: email,
      subject: '📅 Lịch trình sự kiện Me & Stress - 24/8/2025',
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
          <p>Xin chào bạn <strong>${firstName}</strong>,</p>

          <p><strong>Me & Stress</strong> sẽ chính thức diễn ra vào ngày mai.</p>

          <p>Xin gửi lại lịch trình như sau:</p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #e74c3c;"><strong>🗓️ Thời gian:</strong> 14h00, Chủ Nhật ngày 24/8/2025</p>
            <p style="margin: 10px 0 0 0; color: #2c3e50;"><strong>🏢 Địa điểm Hội thảo:</strong> Kefoff Cafe & Events - Phòng hội thảo - Tầng 2</p>
            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 14px;">(Địa chỉ: 90 Đào Duy Anh, Phường Đức Nhuận, TPHCM)</p>
            <p style="margin: 15px 0 0 0; color: #2c3e50;"><strong>🛵 Địa điểm gửi xe:</strong> Sân đá banh Mini Quyên</p>
            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 14px;">(Địa chỉ: 21 Đào Duy Anh, Phường Đức Nhuận, TPHCM)</p>
          </div>

          <p><strong>// QR để quét</strong></p>
          <p style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; font-family: monospace;">
            ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/guests/${guestId}
          </p>

          <p>Sau khi gửi xe, Đội lễ tân WorkLuz sẽ hướng dẫn bạn di chuyển đến Địa điểm tổ chức Hội thảo theo sơ đồ sau:</p>

          <p style="margin-top: 30px; color: #7f8c8d; font-size: 12px;">
            Thân mến,<br>
            <strong>Đội ngũ WorkLuz</strong>
          </p>
        </div>
      `
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: 'Email đã được gửi thành công!'
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Có lỗi xảy ra khi gửi email',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
