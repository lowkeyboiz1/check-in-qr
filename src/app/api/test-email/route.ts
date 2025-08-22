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

export async function POST(request: NextRequest) {
  try {
    const { email }: { email: string } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email là bắt buộc' }, { status: 400 })
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

    // Test email options
    const mailOptions = {
      from: {
        name: 'WorkLuz Event Team - Test',
        address: smtpUser
      },
      to: email,
      subject: '🧪 Test Email - Cấu hình Email WorkLuz',
      text: 'Đây là email test để kiểm tra cấu hình email của hệ thống WorkLuz.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
          <h2 style="color: #2c3e50;">🧪 Test Email</h2>
          <p>Đây là email test để kiểm tra cấu hình email của hệ thống <strong>WorkLuz</strong>.</p>
          <p>Nếu bạn nhận được email này, cấu hình email đã được thiết lập thành công!</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #27ae60;"><strong>✅ Cấu hình email hoạt động bình thường</strong></p>
          </div>
          <p style="margin-top: 30px; color: #7f8c8d; font-size: 12px;">
            Thân mến,<br>
            <strong>Đội ngũ WorkLuz</strong>
          </p>
        </div>
      `
    }

    // Send test email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: 'Email test đã được gửi thành công! Vui lòng kiểm tra hộp thư.'
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Có lỗi xảy ra khi gửi email test. Vui lòng kiểm tra lại cấu hình SMTP.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
