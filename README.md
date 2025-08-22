# Check-in QR App

Ứng dụng quản lý check-in với QR code sử dụng Next.js và MongoDB.

## Tính năng

- ✅ Quản lý danh sách khách
- ✅ Check-in/Check-out bằng QR code
- ✅ Tìm kiếm và lọc khách
- ✅ Thống kê real-time
- ✅ Giao diện mobile-friendly

## Setup MongoDB

1. Tạo file `.env.local` với nội dung:

```env
NEXT_PUBLIC_MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

Hoặc sử dụng MongoDB local:

```env
NEXT_PUBLIC_MONGODB_URI=mongodb://localhost:27017/checkin
```

2. Thay thế `<username>`, `<password>`, `<cluster>` và `<database>` bằng thông tin MongoDB của bạn.

## API Endpoints

### Guests Management

- `GET /api/user` - Lấy danh sách guests
- `GET /api/user?search=query` - Tìm kiếm guests
- `GET /api/user?id=guestId` - Lấy guest theo ID
- `POST /api/user` - Tạo guest mới
- `PUT /api/user?id=guestId` - Cập nhật guest
- `DELETE /api/user?id=guestId` - Xóa guest

### Check-in/Check-out

- `POST /api/checkin` - Check-in guest
- `POST /api/checkout` - Check-out guest

### Statistics

- `GET /api/stats` - Lấy thống kê

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# check-in-qr
