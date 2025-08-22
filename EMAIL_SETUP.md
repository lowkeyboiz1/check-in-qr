# Email Setup Guide

## Cấu hình Email với Nodemailer

Để sử dụng tính năng gửi email, bạn cần cấu hình các biến môi trường sau:

### 1. Tạo file `.env.local`

Tạo file `.env.local` trong thư mục gốc của dự án và thêm các biến sau:

```env
# Email Configuration for Nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App URL (for QR code generation)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# MongoDB Configuration
NEXT_PUBLIC_MONGODB_URI=your-mongodb-connection-string
```

### 2. Cấu hình Gmail (nếu dùng Gmail)

#### Bước 1: Bật xác thực 2 yếu tố

1. Truy cập [Google Account Settings](https://myaccount.google.com/)
2. Chọn "Security" (Bảo mật)
3. Bật "2-Step Verification" (Xác thực 2 bước)

#### Bước 2: Tạo App Password

1. Truy cập [App Passwords](https://myaccount.google.com/apppasswords)
2. Chọn "Mail" và "Other (custom name)"
3. Đặt tên cho app (ví dụ: "Check-in App")
4. Copy mật khẩu được tạo (16 ký tự)

#### Bước 3: Cập nhật file `.env.local`

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcd-efgh-ijkl-mnop  # App Password vừa tạo
```

### 3. Cấu hình cho các nhà cung cấp email khác

#### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo Mail

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### 4. Test cấu hình

Sau khi cấu hình xong, bạn có thể:

1. Khởi động lại server: `npm run dev`
2. Truy cập Settings (Cài đặt)
3. Nhấn nút "Gửi email thông tin sự kiện"
4. Hệ thống sẽ gửi email đến tất cả khách chưa check-in có email hợp lệ

## Lưu ý bảo mật

- Không bao giờ commit file `.env.local` vào git
- Thêm `.env.local` vào file `.gitignore` nếu chưa có
- Sử dụng App Password thay vì mật khẩu chính để tăng bảo mật
- Kiểm tra lại cấu hình SMTP trước khi triển khai production
