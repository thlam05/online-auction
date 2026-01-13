# BIDHUB (Đồ án cuối kì Online Auction - 23KTPM3)

![bidhub's website illustration](illustration.png)

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL)
- **Frontend:** Handlebars (SSR), Tailwind CSS
- **Auth:** Passport.js, bcrypt
- **Session:** express-session, connect-session-knex
- **Realtime:** fetch API
- **Other:** Preline UI, Nodemailer, reCAPTCHA v2

## Hướng dẫn cài đặt & chạy web

### 1. Clone repo
```bash
git clone https://github.com/thlam05/online-auction.git
cd online-auction
```

### 2. Cài đặt thư viện
```bash
npm install
```

### 3. Tạo file môi trường
Tạo file `.env`

```bash
PORT = 3000

BCRYPT_SALT_ROUNDS = 10

SESSION_SECRET_KEY = your_session_secret_key

DATABASE_HOST = your_database_host
DATABASE_PORT = your_database_port
DATABASE_USER = your_database_user
DATABASE_PASSWORD = your_database_password
DATABASE_NAME = your_database_name


GOOGLE_CLIENT_ID = your_google_client_id
GOOGLE_CLIENT_SECRET = your_google_client_secret

FACEBOOK_APP_ID = your_facebook_app_id
FACEBOOK_APP_SECRET = your_facebook_app_secret

GOOGLE_APP_EMAIL = your_email
GOOGLE_APP_PASSWORD = your_app_password

RECAPTCHA_SITE_KEY = your_recaptcha_site_key
RECAPTCHA_SECRET_KEY = your_recaptcha_secret_key

```

### 4. Chạy web
```bash
npm run dev
```
Truy cập: [http://localhost:3000](http://localhost:3000)

---

## Dump account để test:
```
1. Admin:
Email: admin@bidhub
Password: 123

2. Seller:
Email: seller@bidhub
Password: 123

3. Bidder:
Email: test@bidhub
Password: 123
```

## Thông tin thành viên nhóm

- **Đào Hoàng Đức Mạnh**
  - MSSV: 23127417
  - Email: dhdmanh23@clc.fitus.edu.vn

- **Trương Hoàng Lâm**
  - MSSV: 23127402
  - Email: thlam23@clc.fitus.edu.vn 
