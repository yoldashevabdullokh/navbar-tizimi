# Navbat Tizimi (Online Queue Management System)

Bu loyiha **MERN** (MongoDB, Express, React, Node.js) steki va **Socket.io** texnologiyalari yordamida qurilgan onlayn navbatga yozilish tizimi hisoblanadi.

## 🛠 Talablar
Loyihani ishga tushirish uchun kompyuteringizda quyidagilar o'rnatilgan bo'lishi kerak:
- **Node.js** (v16 yoki undan yuqori)
- **MongoDB** (Lokal yoki MongoDB Atlas)

---

## 🚀 Ishga Tushirish Bo'yicha Qo'llanma

Loyiha ikki qismdan iborat: `backend` va `frontend`. Ikkalasini ham alohida ishga tushirish kerak.

### 1-qadam: Repo ni yuklab olib, loyiha jildiga kiring
Terminalni oching va loyiha papkasiga o'ting:
```bash
cd node.js
```

### 2-qadam: Backend qismini sozlash va ishga tushirish
1. Terminal yoki CMD ochib, `backend` jildiga o'ting:
   ```bash
   cd backend
   ```
2. Barcha kutubxonalarni (dependencies) o'rnating:
   ```bash
   npm install
   ```
3. `backend` jildi ichida `.env` faylini yarating (yoki agar bor bo'lsa, uni tahrirlang) va quyidagi ma'lumotlarni kiriting:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/navbat_db
   ```
   *(Eslatma: Agar siz MongoDB Atlas bulut xizmatidan foydalansangiz, o'zingizning Atlas URL manzilingizni kiriting).*
4. Backend serverni ishga tushiring:
   ```bash
   npm run dev
   ```
   *Agar kodingizda xatolik bo'lmasa, ekranda `✅ MongoDB ga ulandi` va `🚀 Server http://localhost:5000 da ishlamoqda` degan yozuv chiqadi.*

### 3-qadam: Frontend qismini sozlash va ishga tushirish
1. Yangi terminal oching (backend terminalini yopib qo'ymang) va `frontend` jildiga o'ting:
   ```bash
   cd frontend
   ```
2. Barcha kutubxonalarni o'rnating:
   ```bash
   npm install
   ```
3. Frontend dasturni (Vite) ishga tushiring:
   ```bash
   npm run dev
   ```
   *Terminalda brauzer manzillari chiqadi (odatda, http://localhost:5173 yoki http://localhost:5174).*

---

## 🌐 Tizimdan Foydalanish

Brauzeringizni oching va Vite taqdim etgan URL-ga kiring (masalan: `http://localhost:5174/`).
Tizim 3 ta asosiy sahifaga ega:
*   **Asosiy Sahifa (`/`)**: Foydalanuvchilar navbat olishi uchun.
*   **Admin Panel (`/admin`)**: Admin xodim tasdiqlashi, navbatni chaqirishi va boshqarishi uchun.
*   **Katta Ekran (`/display`)**: Foydalanuvchilar o'z navbatlarini kutish xonasida TV yoki monitorda kuzatishi uchun mo'ljallangan displey.

Barcha o'zgarishlar **Socket.io** yordamida amalga oshirilgani sababli, har bir sahifa jonli (real-time) shaklda avtomatik yangilanadi (sahifani qayta yuklash/refresh qilish shart emas).
